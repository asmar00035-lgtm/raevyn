import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CONFIG
// ==========================================
const SUPABASE_URL = 'https://vytutfarfloaksmonerl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dHV0ZmFyZmxvYWtzbW9uZXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTQ2MDQsImV4cCI6MjA4ODgzMDYwNH0.FjyEJL5w0ttG6XiaaTxBUjfk-o74Ns7ix3hg2ZVyp1Y';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// WAIT FOR ALADIN TO LOAD
// ==========================================
function waitForAladin() {
  return new Promise(resolve => {
    const check = () => {
      if (window.A) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
}

// ==========================================
// INIT ALADIN
// ==========================================
let aladin;

async function initAladin() {
  await waitForAladin();

  aladin = window.A.aladin('#aladin-lite-div', {
    survey:                   'P/DSS2/color',
    fov:                      60,
    target:                   '0 0',
    cooFrame:                 'ICRSd',
    projection:               'TAN',
    showReticle:              false,
    showZoomControl:          false,
    showFullscreenControl:    false,
    showLayersControl:        false,
    showGotoControl:          false,
    showSimbadPointerControl: false,
    showShareControl:         false,
    showCooGrid:              false,
    showFrame:                false,
    showCooLocation:          false,
    showProjectionControl:    false,
    showContextMenu:          false,
    showStatusBar:            false,
  });

  console.log('Aladin initialized ✅');
  await loadAndOverlayStars();
}

// ==========================================
// LOAD STARS FROM SUPABASE
// ==========================================
let allStars = [];

async function loadAndOverlayStars() {
  console.log('Loading stars...');
  const batchSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('stars')
      .select('id, ra, dec, mag, color_bv, proper_name')
      .lte('mag', 6)
      .range(from, from + batchSize - 1);

    if (error || !data || data.length === 0) break;
    allStars = allStars.concat(data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  console.log(`Loaded ${allStars.length} stars`);
  overlayDedicatedStars();
}

// ==========================================
// OVERLAY DEDICATED STARS
// ==========================================
async function overlayDedicatedStars() {
  const { data: dedications } = await supabase
    .from('dedications')
    .select('star_id, custom_name, message, share_token')
    .eq('payment_status', 'paid')
    .eq('is_public', true)
    .limit(500);

  if (!dedications || dedications.length === 0) return;

  const dedicatedMap = {};
  dedications.forEach(d => dedicatedMap[d.star_id] = d);

  const cat = window.A.catalog({
    name:       'Dedicated Stars',
    sourceSize: 18,
    color:      '#FFD700',
    onClick:    'showPopup',
  });

  for (const star of allStars) {
    if (!dedicatedMap[star.id]) continue;
    const ded = dedicatedMap[star.id];
    const ra_h = star.ra / 15;

    cat.addSources([window.A.source(ra_h, star.dec, {
      name:       ded.custom_name,
      popupTitle: `⭐ ${ded.custom_name}`,
      popupDesc:  ded.message || '',
    })]);
  }

  aladin.addCatalog(cat);
}

// ==========================================
// START
// ==========================================
initAladin();
