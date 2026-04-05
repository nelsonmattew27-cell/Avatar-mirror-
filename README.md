# Web 3D VRM Avatar Mirror

This app mirrors your movement using your webcam with a 3D VRM avatar, powered by Three.js and MediaPipe MoveNet pose detection.

## How to use

1. **Upload a `.vrm` model** or use the sample included (`sample_avatar.vrm`).
2. **Allow webcam access** when prompted by your browser.
3. **Move in front of your webcam**. The avatar will mirror some hip motion (extendable for full body).
4. **Deploy** using [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) — simply import this repo and go live!

> For best results: run over HTTPS/localhost, use a modern browser, and have good lighting!

## Customizing

- Replace `sample_avatar.vrm` with any VRM avatar you like.
- Extend `vrm_viewer.js` to map more keypoints to avatar bones for richer animation (see three-vrm and pose-detection documentation).

---

**Enjoy your 3D avatar mirror!**
