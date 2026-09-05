// Your own scripts. jQuery and Webflow's runtime (IX2 interactions, sliders,
// the nav, the modal) are already loaded as plain scripts before this module,
// so `window.jQuery` and `window.Webflow` are available here.
//
// Webflow's runtime is initialised by the time this runs; if you add DOM that
// carries Webflow interaction attributes, call `window.Webflow.require('ix2').init()`
// again afterwards.

// Example hook - delete when you start writing real code:
// window.Webflow?.push(() => { ... });

if (import.meta.hot) {
  // Editing a partial changes index.html, which Vite full-reloads. Nothing to
  // do here, but keeping the guard makes it obvious where to add HMR handlers.
  import.meta.hot.accept();
}
