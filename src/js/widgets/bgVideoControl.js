// Manual play/pause button on a background video (used once, in the
// reviews section). Swaps which icon is visible via the native `hidden`
// property, matching the two <span class="play-state">/<span
// class="pause-state"> already in the markup.
export function initBgVideoControl() {
  document.querySelectorAll(".video-button[aria-controls]").forEach((button) => {
    const video = document.getElementById(button.getAttribute("aria-controls"));
    if (!video) return;

    const playState = button.querySelector(".play-state");
    const pauseState = button.querySelector(".pause-state");
    const sync = () => {
      if (playState) playState.hidden = video.paused;
      if (pauseState) pauseState.hidden = !video.paused;
    };

    button.addEventListener("click", () => {
      video.paused ? video.play() : video.pause();
    });
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    sync();
  });
}
