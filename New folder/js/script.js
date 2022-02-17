// Add the cdn of curtainjs
import {
  Curtains,
  Plane,
} from "https://cdn.jsdelivr.net/npm/curtainsjs@7.2.0/src/index.mjs";
window.addEventListener("load", () => {
  // set up our WebGL context or set curtiansjs
  const curtains = new Curtains({
    container: "canvas",
    pixelRatio: Math.min(1.5, window.devicePixelRatio),
  });

  // handle the texture visibility and transition timer between the images
  let activeTexture = 0;
  let transitionTimer = 0;

  // get our plane element
  const planeElements = document.getElementsByClassName("video_inner");

  // some basic parameters
  const params = {
    vertexShader: vs,
    fragmentShader: fs,
    uniforms: {
      transitionTimer: {
        name: "uTransitionTimer",
        type: "1f",
        value: 1,
      },
    },
  };

  // create  plane
  const multiTexturesPlane = new Plane(curtains, planeElements[0], params);

  multiTexturesPlane
    .onReady(() => {
      planeElements[0].addEventListener("click", () => {
        activeTexture = activeTexture === 0 ? 1 : 0;
        multiTexturesPlane.videos[activeTexture].play();
      });

      document.body.classList.add("loader");
      multiTexturesPlane.playVideos();

      curtains.nextRender(() => {
        multiTexturesPlane.videos[1].pause();
      });
    })
    .onRender(() => {
      // increase or decrease the timer based on the active texture value
      if (activeTexture === 1) {
        transitionTimer = (1 - 0.05) * transitionTimer + 0.05 * 60;
        // transition is over pause previous video
        if (transitionTimer >= 59 && transitionTimer !== 60) {
          transitionTimer = 60;
          multiTexturesPlane.videos[0].pause();
        }
      } else {
        // lerp value to smoothen animation
        transitionTimer = (1 - 0.05) * transitionTimer;
      }

      // transition is over , pause previous video
      if (transitionTimer <= 1 && transitionTimer !== 0) {
        transitionTimer = 0;
        multiTexturesPlane.videos[1].pause();
      }

      // updata our transition timer uniform
      multiTexturesPlane.uniforms.transitionTimer.value = transitionTimer;
    });
});
