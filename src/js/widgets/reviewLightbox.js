// Review video lightbox. Webflow's own lightbox builds this overlay purely
// at runtime via JS - there's no static markup to port, so this is a small
// fresh implementation: read the Vimeo url out of the trigger's embedded
// JSON (Webflow's CMS video-embed format) and show it in an iframe overlay.
export function initReviewLightbox() {
  const triggers = document.querySelectorAll(".review-background-video");
  if (!triggers.length) return;

  const overlay = document.createElement("div");
  overlay.className = "review-lightbox";
  overlay.innerHTML = `
    <div class="review-lightbox-frame">
      <button type="button" class="review-lightbox-close" aria-label="закрити відео">×</button>
    </div>
  `;
  document.body.appendChild(overlay);
  const frame = overlay.querySelector(".review-lightbox-frame");
  const closeBtn = overlay.querySelector(".review-lightbox-close");

  const close = () => {
    overlay.classList.remove("is-open");
    frame.querySelector("iframe")?.remove();
    document.body.style.overflow = "";
  };
  const open = (url) => {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  triggers.forEach((trigger) => {
    const data = trigger.querySelector('script[type="application/json"]');
    if (!data) return; // this instance is a plain background video, not a lightbox trigger
    let url;
    try {
      url = JSON.parse(data.textContent).items?.[0]?.url;
    } catch {
      return;
    }
    if (!url) return;
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      open(url);
    });
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
