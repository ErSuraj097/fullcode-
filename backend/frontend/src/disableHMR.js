// src/disableHMR.js
if (new URLSearchParams(window.location.search).get('disable-hmr')) {
  if (import.meta.hot) {
    import.meta.hot.invalidate(); // or: import.meta.hot._dispose()
  }
}
