window.addEventListener('load', () => {
  // Create fade overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: #000;
    z-index: 10;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.4s ease;
  `;
  document.body.appendChild(overlay);

  const aladin = window.A.aladin('#aladin-lite-div', {
    survey:          'P/DSS2/color',
    fov:             60,
    target:          '0 0',
    cooFrame:        'ICRSd',
    projection:      'TAN',
    showReticle:          false,
    showZoomControl:      false,
    showFullscreenControl:false,
    showLayersControl:    false,
    showGotoControl:      false,
    showSimbadPointerControl: false,
    showShareControl:     false,
    showCooGrid:          false,
    showFrame:            false,
    showCooLocation:      false,
    showProjectionControl:false,
    showContextMenu:      false,
    showStatusBar:        false,
  });

  let fadeTimeout = null;

  function showOverlay() {
    if (fadeTimeout) clearTimeout(fadeTimeout);
    overlay.style.opacity = '1';
  }

  function hideOverlay() {
    fadeTimeout = setTimeout(() => {
      overlay.style.opacity = '0';
    }, 600);
  }

  // Hide overlay on initial load
  setTimeout(hideOverlay, 1500);

  // Attach events after Aladin canvas is ready
  setTimeout(() => {
    const canvas = document.querySelector('#aladin-lite-div canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', showOverlay);
      canvas.addEventListener('mouseup', hideOverlay);
      canvas.addEventListener('mouseleave', hideOverlay);
      canvas.addEventListener('touchstart', showOverlay);
      canvas.addEventListener('touchend', hideOverlay);
      canvas.addEventListener('wheel', () => {
        showOverlay();
        hideOverlay();
      });
    }
  }, 2000);

  window.addEventListener('resize', () => {
    try { aladin.setSize(window.innerWidth, window.innerHeight); } catch(e) {}
  });
});
