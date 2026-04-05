import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';
import { VRMLoader } from 'https://cdn.jsdelivr.net/npm/three-vrm@2.0.1/lib/three-vrm.module.js';
import * as poseDetection from 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@4.4.0/dist/pose-detection.min.js';
import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js';

const canvas = document.getElementById('vrm-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(canvas.width, canvas.height);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
const camera = new THREE.PerspectiveCamera(30, 4/3, 0.1, 1000);
camera.position.set(0, 1.4, 2);
scene.add(camera);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(0, 1, 2);
scene.add(light);

let currentVrm = null;
async function loadVRM(url) {
    const loader = new VRMLoader();
    loader.load(url, (vrm) => {
        if (currentVrm) scene.remove(currentVrm.scene);
        currentVrm = vrm;
        scene.add(vrm.scene);
        vrm.scene.position.set(0, 0, 0);
    });
}

// Handle VRM upload
document.getElementById('vrm-upload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  loadVRM(url);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ========== MediaPipe + Webcam for Pose ==========
const video = document.getElementById('webcam');
(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 }, audio: false });
    video.srcObject = stream;
    await new Promise(res => video.onloadedmetadata = res);

    // Load MoveNet (single-pose, fast)
    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

    async function poseLoop() {
        const poses = await detector.estimatePoses(video);
        if (poses[0] && currentVrm) {
          // Example: map pose to avatar's hips
          const h = currentVrm.humanoid.getBoneNode('hips');
          if (h && poses[0].keypoints[11] && poses[0].keypoints[12]) {
            // (11: leftHip, 12: rightHip)
            const dx = poses[0].keypoints[12].x - poses[0].keypoints[11].x;
            h.position.x = dx * 0.005;
          }
          // Extend: map more joints to avatar bones as needed
        }
        requestAnimationFrame(poseLoop);
    }
    poseLoop();
})();

// Optional: auto-load sample avatar on page load
window.addEventListener('DOMContentLoaded', () => {
  loadVRM('sample_avatar.vrm');
});
