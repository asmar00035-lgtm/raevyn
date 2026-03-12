window.addEventListener('load', () => {
  // Overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;top:0;left:0;
    width:100vw;height:100vh;
    background:#000;z-index:10;
    pointer-events:none;opacity:1;
    transition:opacity 0.5s ease;
  `;
  document.body.appendChild(overlay);

  // Hide overlay after load
  function hideOverlay() { overlay.style.opacity = '0'; }
  function showOverlay() { overlay.style.opacity = '0.92'; }

  let hideTimer = null;
  function scheduleHide(ms) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hideOverlay, ms);
  }

  // Init Aladin v3
  window.A.init.then(() => {
    const aladin = window.A.aladin('#aladin-lite-div', {
      survey:    'P/DSS2/color',
      fov:       60,
      target:    '0 0',
      cooFrame:  'ICRSd',
      showReticle: false,
      showZoomControl: false,
      showFullscreenControl: false,
      showLayersControl: false,
      showGotoControl: false,
      showSimbadPointerControl: false,
      showShareControl: false,
      showCooGrid: false,
      showFrame: false,
      showStatusBar: false,
    });

    // Hide after initial tiles load
    scheduleHide(2000);

    // On move: show overlay, hide after tiles load
    aladin.on('positionChanged', () => {
      showOverlay();
      scheduleHide(700);
    });

    aladin.on('zoomChanged', () => {
      showOverlay();
      scheduleHide(700);
    });

    window.addEventListener('resize', () => {
      try { aladin.setSize(window.innerWidth, window.innerHeight); } catch(e){}
    });
  });
});
