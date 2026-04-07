const video = document.getElementById("cam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const avatar = new Image();
avatar.src = "avatar_base.png";

let smoothX = window.innerWidth / 2;
let smoothY = window.innerHeight / 2;
let smoothAngle = 0;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawAvatar(x, y, angle) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const size = 260;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(avatar, -size / 2, -size / 2, size, size);
  ctx.restore();
}

function onResults(results) {
  if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const face = results.multiFaceLandmarks[0];
  const leftEye = face[33];
  const rightEye = face[263];
  const nose = face[1];

  const x = nose.x * canvas.width;
  const y = nose.y * canvas.height;

  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const angle = Math.atan2(dy, dx);

  smoothX = lerp(smoothX, x, 0.2);
  smoothY = lerp(smoothY, y, 0.2);
  smoothAngle = lerp(smoothAngle, angle, 0.25);

  drawAvatar(smoothX, smoothY, smoothAngle);
}

const faceMesh = new FaceMesh({
  locateFile: (file) =>
    `[cdn.jsdelivr.net](https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file})`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults(onResults);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start().catch((err) => {
  document.body.innerHTML += `<p style="position:fixed;bottom:10px;left:10px;color:red;z-index:20;">${err}</p>`;
});
