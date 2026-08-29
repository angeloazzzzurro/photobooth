import { useState, useRef, useEffect } from "react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const PHOTO_STYLES = [
  { id: "original", name: "Original", filter: "none",                                                          swatch: "linear-gradient(135deg,#667eea,#764ba2)" },
  { id: "bw",       name: "B&W",      filter: "grayscale(100%) contrast(1.2)",                                 swatch: "linear-gradient(135deg,#333,#999)" },
  { id: "vintage",  name: "Vintage",  filter: "sepia(0.8) brightness(1.1)",                                    swatch: "linear-gradient(135deg,#c8913a,#8B5e14)" },
  { id: "neon",     name: "Neon",     filter: "saturate(2) hue-rotate(270deg) brightness(1.2) contrast(1.1)", swatch: "linear-gradient(135deg,#ff00ff,#7700ff)" },
  { id: "dreamy",   name: "Dreamy",   filter: "brightness(1.15) saturate(1.5) contrast(0.9)",                  swatch: "linear-gradient(135deg,#ffadd9,#dda0dd)" },
  { id: "pop",      name: "Pop",      filter: "saturate(3) contrast(1.4)",                                     swatch: "linear-gradient(135deg,#ff4400,#ffcc00)" },
  { id: "ice",      name: "Ice",      filter: "hue-rotate(195deg) saturate(1.5) brightness(1.1)",              swatch: "linear-gradient(135deg,#00d2ff,#1e6fff)" },
  { id: "golden",   name: "Golden",   filter: "sepia(0.4) saturate(2) brightness(1.1)",                       swatch: "linear-gradient(135deg,#FFD700,#FF8C00)" },
];

const STICKER_CATS = [
  { cat: "❤️", items: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💕","💞","💓","💗","💖","💘","💝"] },
  { cat: "😊", items: ["😊","😂","🥰","😍","🤩","😎","🥳","😜","🤪","😈","👻","🤖","💀","🤡","👽"] },
  { cat: "✨", items: ["✨","⭐","🌟","💫","🌈","☀️","🌙","⚡","🔥","💥","❄️","🌊","🌀","🎆","🎇"] },
  { cat: "🌸", items: ["🌸","🌺","🌻","🌹","🌷","🍀","🌿","🦋","🐝","🌱","🍄","🍁","🌵","🌴","🪴"] },
  { cat: "🎉", items: ["🎉","🎊","🎈","🥂","🍾","🎁","🎀","🎂","🏆","👑","💎","🎯","🎪","🪄","🎭"] },
  { cat: "💪", items: ["💯","🔥","✅","💪","👍","✌️","🤙","🙌","👏","🤝","🫶","🧿","😏","🫠","🤌"] },
];

const FRAMES = [
  {
    id: "classic", name: "Classic",
    bg: "#f5f2ea", accent: "#2b2b2b",
    pad: 16, gap: 6, radius: 4,
    decorations: [],
    label: null,
    swatch: "linear-gradient(135deg,#fdfcf8,#e8e4d8)",
  },
  {
    id: "sakura", name: "Sakura",
    bg: "repeating-linear-gradient(90deg,#ffd9e8 0px,#ffd9e8 14px,#ffc2dc 14px,#ffc2dc 28px)",
    canvasStripe: ["#ffd9e8", "#ffc2dc"],
    accent: "#d6336c",
    pad: 18, gap: 8, radius: 6,
    decorations: [
      { emoji: "🎀", top: "1.5%", left: "4%", size: 34, rotate: -15 },
      { emoji: "⭐", top: "2.5%", right: "6%", size: 24, rotate: 12 },
      { emoji: "🍡", bottom: "17%", right: "5%", size: 28, rotate: 0 },
    ],
    label: { text: "photo booth" },
    swatch: "repeating-linear-gradient(90deg,#ffd9e8,#ffd9e8 6px,#ffc2dc 6px,#ffc2dc 12px)",
  },
  {
    id: "sky", name: "Sky Ribbon",
    bg: "repeating-linear-gradient(90deg,#cfe8ff 0px,#cfe8ff 14px,#bcdcff 14px,#bcdcff 28px)",
    canvasStripe: ["#cfe8ff", "#bcdcff"],
    accent: "#1c6fd8",
    pad: 18, gap: 8, radius: 6,
    decorations: [
      { emoji: "🎀", top: "1.5%", left: "5%", size: 30, rotate: -10 },
      { emoji: "💗", top: "2.5%", right: "5%", size: 24, rotate: 8 },
      { emoji: "🎵", bottom: "19%", left: "5%", size: 22, rotate: -8 },
    ],
    label: { text: "sweet day" },
    swatch: "repeating-linear-gradient(90deg,#cfe8ff,#cfe8ff 6px,#bcdcff 6px,#bcdcff 12px)",
  },
  {
    id: "mint", name: "Mint Dash",
    bg: "#cdeede", accent: "#1f7a52",
    pad: 18, gap: 8, radius: 6,
    dashedPhotoBorder: true,
    decorations: [
      { emoji: "🐸", top: "1.5%", right: "5%", size: 32, rotate: 6 },
      { emoji: "🌿", bottom: "19%", left: "4%", size: 24, rotate: -6 },
    ],
    label: { text: "playground" },
    swatch: "#cdeede",
  },
  {
    id: "sunny", name: "Sunny Star",
    bg: "#fff3b0", accent: "#c9820a",
    pad: 18, gap: 8, radius: 6,
    decorations: [
      { emoji: "⭐", top: "1.5%", left: "4%", size: 30, rotate: -12 },
      { emoji: "✨", top: "2.5%", right: "6%", size: 22, rotate: 10 },
      { emoji: "❤️", bottom: "18%", right: "5%", size: 24, rotate: 0 },
    ],
    label: { text: "good day" },
    swatch: "#fff3b0",
  },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
let stickerCounter = 0;

// ─── IndexedDB Gallery ──────────────────────────────────────────────────────────
function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open("photobooth-gallery", 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
    req.onsuccess = e => res(e.target.result);
    req.onerror = rej;
  });
}
async function dbSavePhoto(dataUrl) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").add({ dataUrl, date: Date.now() });
    tx.oncomplete = res; tx.onerror = rej;
  });
}
async function dbLoadPhotos() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const req = db.transaction("photos", "readonly").objectStore("photos").getAll();
    req.onsuccess = e => res([...e.target.result].reverse());
    req.onerror = rej;
  });
}
async function dbDeletePhoto(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").delete(id);
    tx.oncomplete = res; tx.onerror = rej;
  });
}

// ─── Global CSS ────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Yomogi&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  body {
    background: linear-gradient(145deg,#dde8ff 0%,#f5e6ff 45%,#d6f0ff 100%);
    background-attachment:fixed;
    overflow:hidden; font-family:'DM Sans',system-ui,sans-serif;
  }

  .app {
    background:transparent; color:#1C1C1E;
    width:100vw; height:100dvh;
    max-width:430px; margin:0 auto;
    display:flex; flex-direction:column; overflow:hidden;
  }

  /* ── Camera ── */
  .cam-wrap { flex:1; display:flex; flex-direction:column; min-height:0; }

  .cam-preview {
    flex:1; position:relative; overflow:hidden;
    background:#000; display:flex; align-items:center; justify-content:center;
    min-height:0;
  }

  .cam-video {
    width:100%; height:100%; object-fit:cover;
    transition:filter 0.25s;
  }

  .cam-switch {
    position:absolute; top:12px; right:12px;
    width:44px; height:44px; border-radius:50%;
    background:rgba(255,255,255,.72); backdrop-filter:blur(20px) saturate(180%);
    border:1px solid rgba(255,255,255,.9);
    color:#1C1C1E; font-size:19px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 2px 12px rgba(0,0,0,.1);
    transition:transform .2s; z-index:5;
  }
  .cam-switch:active { transform:scale(.88) rotate(180deg); }
  .cam-switch:disabled { opacity:.4; cursor:not-allowed; }

  .countdown-over {
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center;
    pointer-events:none; z-index:10;
  }
  .countdown-num {
    font-size:110px; font-weight:900; color:#fff; line-height:1;
    text-shadow:0 0 60px rgba(0,122,255,.8),0 0 20px rgba(88,86,214,.7);
    animation:cd-in .4s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes cd-in { from{transform:scale(1.6);opacity:0} to{transform:scale(1);opacity:1} }

  .flash-el {
    position:absolute; inset:0; background:#fff; pointer-events:none; z-index:20;
    animation:do-flash .35s ease-out forwards;
  }
  @keyframes do-flash { 0%{opacity:.9} 100%{opacity:0} }
  @media (prefers-reduced-motion: reduce) { .flash-el { display:none; } }

  .strip-mini {
    position:absolute; bottom:12px; right:12px;
    display:flex; flex-direction:column; gap:3px;
    background:rgba(255,255,255,.65); backdrop-filter:blur(16px) saturate(180%);
    padding:6px; border-radius:10px;
    border:1px solid rgba(255,255,255,.85);
    box-shadow:0 2px 12px rgba(0,0,0,.1);
  }
  .strip-mini-frame {
    width:44px; height:33px; border-radius:5px;
    overflow:hidden; background:rgba(0,0,0,.07);
  }
  .strip-mini-frame img { width:100%; height:100%; object-fit:cover; }

  .cam-err { color:#666; text-align:center; padding:32px; }
  .cam-err-icon { font-size:48px; margin-bottom:12px; }

  /* Style bar */
  .style-bar {
    display:flex; gap:6px; padding:10px 12px;
    overflow-x:auto; scrollbar-width:none;
  }
  .style-bar::-webkit-scrollbar { display:none; }

  .style-chip {
    display:flex; flex-direction:column; align-items:center; gap:5px;
    padding:8px 12px; border-radius:16px;
    border:1px solid rgba(0,0,0,.08);
    background:rgba(255,255,255,.6);
    color:rgba(0,0,0,.45);
    cursor:pointer; font-size:11px; font-weight:500;
    white-space:nowrap; flex-shrink:0; transition:all .15s;
    box-shadow:0 1px 4px rgba(0,0,0,.06);
  }
  .style-chip.on { border-color:#007AFF; background:rgba(0,122,255,.1); color:#007AFF; box-shadow:0 1px 6px rgba(0,122,255,.18); }

  /* Controls */
  .cam-controls {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 32px 28px;
    background:rgba(255,255,255,.72); backdrop-filter:blur(24px) saturate(180%);
    border-top:1px solid rgba(255,255,255,.85);
  }

  .mode-btn {
    display:flex; flex-direction:column; align-items:center; gap:4px;
    width:72px; padding:10px 6px; border-radius:16px;
    border:1px solid rgba(0,0,0,.1);
    background:rgba(255,255,255,.6);
    color:rgba(0,0,0,.4);
    cursor:pointer; font-size:11px; font-weight:500; transition:all .15s;
    box-shadow:0 1px 4px rgba(0,0,0,.06);
  }
  .mode-btn.on { border-color:#5856D6; background:rgba(88,86,214,.1); color:#5856D6; box-shadow:0 1px 6px rgba(88,86,214,.18); }
  .mode-btn-icon { font-size:22px; }

  .shutter {
    width:74px; height:74px; border-radius:50%;
    background:linear-gradient(135deg,#007AFF,#5856D6);
    border:none; cursor:pointer;
    box-shadow:0 0 0 4px rgba(0,122,255,.18), 0 6px 24px rgba(0,122,255,.4);
    display:flex; align-items:center; justify-content:center;
    transition:transform .1s,box-shadow .1s;
  }
  .shutter:active { transform:scale(.91); box-shadow:0 0 0 4px rgba(0,122,255,.1),0 4px 14px rgba(0,122,255,.3); }
  .shutter:disabled { opacity:.4; cursor:not-allowed; }
  .shutter-inner { width:58px; height:58px; border-radius:50%; background:rgba(255,255,255,.95); }

  /* ── Sticker screen ── */
  .stk-screen { display:flex; flex-direction:column; height:100%; min-height:0; }

  .stk-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 16px;
    background:rgba(255,255,255,.78); backdrop-filter:blur(24px) saturate(180%);
    border-bottom:1px solid rgba(0,0,0,.07);
    flex-shrink:0;
  }
  .stk-title { font-size:15px; font-weight:600; color:#1C1C1E; }
  .stk-hint  { font-size:10px; color:rgba(0,0,0,.38); text-align:center; margin-top:2px; }

  .btn-ghost {
    padding:8px 14px; border-radius:20px;
    border:1px solid rgba(0,0,0,.1);
    background:rgba(255,255,255,.65);
    color:rgba(0,0,0,.55);
    cursor:pointer; font-size:13px; font-weight:500;
    display:flex; align-items:center; gap:5px;
    box-shadow:0 1px 4px rgba(0,0,0,.06);
  }

  .btn-save {
    padding:8px 18px; border-radius:20px; border:none;
    background:linear-gradient(135deg,#007AFF,#5856D6);
    color:#fff; cursor:pointer; font-size:13px; font-weight:600;
    display:flex; align-items:center; gap:5px;
    box-shadow:0 4px 14px rgba(0,122,255,.35);
    transition:transform .1s;
  }
  .btn-save:active { transform:scale(.97); }

  .photo-area {
    flex:1; display:flex; align-items:center; justify-content:center;
    background:#1C1C1E; padding:20px 16px;
    min-height:0; overflow-y:auto;
  }

  /* ── Photo card: the physical strip / print ── */
  .photo-card {
    position:relative; flex-shrink:0;
    touch-action:none; user-select:none;
    box-shadow:0 10px 40px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.35);
  }
  .photo-card.is-strip {
    align-self:stretch; width:min(185px,50vw);
    display:flex; flex-direction:column;
  }
  .photo-card.is-single { width:min(290px,76vw); }

  /* ── Frame bar ── */
  .frame-bar-wrap {
    position:relative; background:rgba(255,255,255,.72);
    backdrop-filter:blur(20px) saturate(1.6);
    border-bottom:1px solid rgba(0,0,0,.07); flex-shrink:0;
  }
  .frame-bar { display:flex; gap:6px; padding:9px 12px; overflow-x:auto; scrollbar-width:none; }
  .frame-bar::-webkit-scrollbar { display:none; }
  .frame-chip {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 12px; border-radius:16px;
    border:1.5px solid transparent;
    background:rgba(0,0,0,.05);
    color:rgba(0,0,0,.45);
    cursor:pointer; font-size:10px; font-weight:500;
    white-space:nowrap; flex-shrink:0; transition:all .15s;
  }
  .frame-chip.on { border-color:#007AFF; background:rgba(0,122,255,.1); color:#007AFF; }
  .frame-chip-swatch {
    width:24px; height:24px; border-radius:50%;
    border:2px solid rgba(0,0,0,.1); flex-shrink:0;
    transition:border-color .15s, box-shadow .15s;
  }
  .frame-chip.on .frame-chip-swatch { border-color:#007AFF; box-shadow:0 0 0 2px rgba(0,122,255,.25); }

  /* ── Frame rendering ── */
  .frame-deco {
    position:absolute; pointer-events:none; line-height:1; z-index:1;
    filter:drop-shadow(0 2px 3px rgba(0,0,0,.3));
  }
  .frame-strip { flex:1 1 auto; min-height:0; display:flex; flex-direction:column; }
  .frame-photo { flex:1; overflow:hidden; position:relative; background:rgba(0,0,0,.15); }
  .frame-photo img { width:100%; height:100%; object-fit:cover; display:block; }
  .frame-single { width:100%; aspect-ratio:3/4; overflow:hidden; position:relative; background:rgba(0,0,0,.15); }
  .frame-single img { width:100%; height:100%; object-fit:cover; display:block; }
  .frame-label {
    flex-shrink:0; text-align:center; padding:6px 0 0;
    font-family:'Yomogi',cursive; font-size:20px; letter-spacing:.5px;
  }

  .stk-el {
    position:absolute; cursor:grab; user-select:none;
    touch-action:none; line-height:1;
    filter:drop-shadow(0 2px 4px rgba(0,0,0,.5));
    transform-origin:center center;
  }
  .stk-el:active { cursor:grabbing; }
  .stk-el.sel { outline:2px solid #007AFF; outline-offset:3px; border-radius:4px; }

  /* Handle resize e rotate */
  .stk-handle {
    position:absolute; width:26px; height:26px; border-radius:50%;
    background:#007AFF; border:2px solid #fff;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; touch-action:none; pointer-events:all;
    box-shadow:0 2px 8px rgba(0,122,255,.4);
    transition:transform .1s; z-index:1;
  }
  .stk-handle:active { transform:scale(.85); }
  .stk-handle-resize { bottom:-11px; right:-11px; cursor:se-resize; }
  .stk-handle-rotate { top:-11px; left:50%; transform:translateX(-50%); cursor:grab; }

  /* Sticker panel */
  .stk-panel { background:rgba(255,255,255,.78); backdrop-filter:blur(24px) saturate(180%); border-top:1px solid rgba(0,0,0,.07); flex-shrink:0; }

  .cat-tabs { display:flex; overflow-x:auto; scrollbar-width:none; border-bottom:1px solid rgba(0,0,0,.07); }
  .cat-tabs::-webkit-scrollbar { display:none; }
  .cat-tab {
    padding:10px 18px; font-size:22px;
    background:transparent; border:none; border-bottom:2px solid transparent;
    cursor:pointer; flex-shrink:0; transition:border-color .15s; line-height:1;
  }
  .cat-tab.on { border-bottom-color:#007AFF; }

  .stk-grid {
    display:grid; grid-template-columns:repeat(4,1fr);
    gap:4px; padding:8px; max-height:160px;
    overflow-y:auto; scrollbar-width:thin;
    scrollbar-color:rgba(0,122,255,.3) transparent;
  }

  .stk-pick {
    background:rgba(0,0,0,.04); border:1px solid rgba(0,0,0,.06); border-radius:12px;
    padding:8px 4px; font-size:28px; cursor:pointer; line-height:1; min-height:52px;
    transition:background .1s,transform .1s;
  }
  .stk-pick:active { background:rgba(0,122,255,.1); transform:scale(.88); }

  /* Focus visibile per tastiera */
  :focus-visible { outline:2px solid #007AFF; outline-offset:2px; border-radius:4px; }

  /* Bottone elimina sticker */
  .stk-delete {
    position:absolute; top:-10px; right:-10px;
    width:22px; height:22px; border-radius:50%;
    background:#FF3B30; color:#fff; border:2px solid #fff;
    font-size:11px; font-weight:700; cursor:pointer; line-height:1;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 2px 8px rgba(255,59,48,.4);
    transition:transform .1s;
    pointer-events:all;
  }
  .stk-delete:active { transform:scale(.88); }

  /* Indicatore progresso strip */
  .strip-progress {
    position:absolute; top:12px; left:50%; transform:translateX(-50%);
    background:rgba(255,255,255,.8); backdrop-filter:blur(12px);
    border:1px solid rgba(255,255,255,.9);
    padding:6px 14px; border-radius:20px;
    font-size:13px; font-weight:600; color:#1C1C1E;
    pointer-events:none; z-index:10;
    box-shadow:0 2px 12px rgba(0,0,0,.1);
  }

  /* Salva loading */
  .btn-save:disabled { opacity:.65; cursor:not-allowed; transform:none !important; }

  /* ── Transizioni schermata ── */
  .cam-wrap  { animation:screen-in .22s ease-out both; }
  .stk-screen { animation:screen-in .22s ease-out both; }
  @keyframes screen-in { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

  /* ── Style bar con scroll indicator ── */
  .style-bar-wrap {
    position:relative;
    background:rgba(255,255,255,.72); backdrop-filter:blur(24px) saturate(180%);
    border-top:1px solid rgba(255,255,255,.85);
    box-shadow:0 -1px 0 rgba(0,0,0,.04);
  }
  .style-bar-wrap::after {
    content:''; position:absolute; right:0; top:0; bottom:0; width:48px;
    background:linear-gradient(to right,transparent,rgba(255,255,255,.8));
    pointer-events:none; transition:opacity .2s;
  }
  .style-bar-wrap.at-end::after { opacity:0; }
  .style-bar { border-top:none; background:transparent; }

  /* ── Swatch filtro ── */
  .style-chip-swatch {
    width:28px; height:28px; border-radius:50%;
    border:1.5px solid rgba(0,0,0,.08); flex-shrink:0;
    transition:border-color .15s, box-shadow .15s;
  }
  .style-chip.on .style-chip-swatch {
    border-color:#007AFF;
    box-shadow:0 0 0 2px rgba(0,122,255,.25);
  }

  /* ── Strip mode più prominente ── */
  .mode-btn { width:72px; font-size:11px; }
  .mode-btn-label { font-size:9px; opacity:.7; }

  /* ── Pannello sticker collassabile ── */
  .stk-panel-handle {
    display:flex; align-items:center; justify-content:center; gap:8px;
    padding:9px 16px 6px; cursor:pointer; user-select:none;
  }
  .stk-panel-bar { width:36px; height:4px; border-radius:2px; background:rgba(0,0,0,.15); }
  .stk-panel-label { font-size:11px; color:rgba(0,0,0,.35); }

  /* ── Griglia sticker 4 col, touch target 44px ── */
  .stk-grid { grid-template-columns:repeat(4,1fr); max-height:160px; }
  .stk-pick { font-size:28px; min-height:52px; padding:8px 4px; }

  /* ── Toast ── */
  .toast {
    position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
    background:rgba(255,255,255,.92); backdrop-filter:blur(20px) saturate(180%);
    color:#1C1C1E; padding:11px 22px; border-radius:24px;
    font-size:13px; font-weight:500;
    border:1px solid rgba(0,0,0,.08);
    box-shadow:0 8px 24px rgba(0,0,0,.12);
    animation:toast-in .2s ease-out both;
    z-index:400; white-space:nowrap; pointer-events:none;
  }
  @keyframes toast-in {
    from{opacity:0;transform:translateX(-50%) translateY(8px)}
    to  {opacity:1;transform:translateX(-50%) translateY(0)}
  }

  /* ── Confirm dialog ── */
  .confirm-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.35);
    backdrop-filter:blur(8px) saturate(150%); z-index:300;
    display:flex; align-items:flex-end; justify-content:center;
    padding:0 16px 32px;
    animation:overlay-in .15s ease-out both;
  }
  @keyframes overlay-in { from{opacity:0} to{opacity:1} }
  .confirm-sheet {
    background:rgba(255,255,255,.95); backdrop-filter:blur(24px);
    border-radius:20px; border:1px solid rgba(0,0,0,.07);
    padding:24px; width:100%; max-width:398px;
    box-shadow:0 20px 60px rgba(0,0,0,.15);
    animation:sheet-up .22s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes sheet-up { from{transform:translateY(20px);opacity:0} to{transform:none;opacity:1} }
  .confirm-title { font-size:16px; font-weight:600; margin-bottom:6px; color:#1C1C1E; }
  .confirm-desc  { font-size:13px; color:rgba(0,0,0,.45); margin-bottom:22px; line-height:1.5; }
  .confirm-actions { display:flex; gap:10px; }
  .confirm-cancel {
    flex:1; padding:13px; border-radius:12px;
    border:1px solid rgba(0,0,0,.1);
    background:rgba(0,0,0,.04); color:#1C1C1E; cursor:pointer;
    font-size:14px; font-weight:500;
  }
  .confirm-ok {
    flex:1; padding:13px; border-radius:12px;
    border:none; background:#FF3B30; color:#fff;
    cursor:pointer; font-size:14px; font-weight:600;
  }

  /* ── Strip tooltip ── */
  .mode-wrap { position:relative; display:inline-flex; }
  .strip-tooltip {
    position:absolute; bottom:calc(100% + 10px); left:50%;
    transform:translateX(-50%);
    background:rgba(255,255,255,.9); backdrop-filter:blur(16px);
    border:1px solid rgba(88,86,214,.3);
    color:#5856D6; padding:8px 14px; border-radius:12px;
    font-size:11px; font-weight:500; white-space:nowrap;
    box-shadow:0 4px 16px rgba(88,86,214,.15);
    animation:tooltip-pop .25s cubic-bezier(.34,1.56,.64,1) both;
    pointer-events:none; z-index:20;
  }
  .strip-tooltip::after {
    content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
    border:5px solid transparent; border-top-color:rgba(88,86,214,.3);
  }
  @keyframes tooltip-pop {
    from{opacity:0;transform:translateX(-50%) translateY(6px)}
    to  {opacity:1;transform:translateX(-50%) translateY(0)}
  }

  /* ── Undo button ── */
  .undo-btn {
    position:absolute; top:12px; left:12px;
    width:40px; height:40px; border-radius:50%;
    background:rgba(255,255,255,.72); backdrop-filter:blur(12px) saturate(1.6);
    border:1.5px solid rgba(255,255,255,.9);
    color:#1C1C1E; font-size:17px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:transform .1s, opacity .2s; z-index:5;
    box-shadow:0 2px 8px rgba(0,0,0,.12);
  }
  .undo-btn:not(:disabled):active { transform:scale(.88); }
  .undo-btn:disabled { opacity:.25; cursor:not-allowed; }

  /* ── Handles più grandi e spaziati ── */
  .stk-handle { width:26px; height:26px; font-size:13px; }
  .stk-handle-resize { bottom:-13px; right:-13px; }
  .stk-handle-rotate { top:-13px; }

  /* ── Gallery button (camera controls) ── */
  .gallery-btn {
    width:44px; height:44px; border-radius:50%;
    background:rgba(255,255,255,.6); border:1px solid rgba(0,0,0,.1);
    color:#1C1C1E; font-size:20px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 1px 4px rgba(0,0,0,.06); transition:transform .1s;
  }
  .gallery-btn:active { transform:scale(.9); }

  /* ── Gallery screen ── */
  .gallery-screen { display:flex; flex-direction:column; height:100%; }
  .gallery-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 16px;
    background:rgba(255,255,255,.78); backdrop-filter:blur(24px) saturate(180%);
    border-bottom:1px solid rgba(0,0,0,.07); flex-shrink:0;
  }
  .gallery-title { font-size:15px; font-weight:600; color:#1C1C1E; }
  .gallery-count { font-size:12px; color:rgba(0,0,0,.4); }
  .gallery-body { flex:1; overflow-y:auto; padding:3px; background:#1C1C1E; }
  .gallery-empty {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    height:100%; color:rgba(255,255,255,.4); font-size:14px; gap:12px; padding:40px;
    text-align:center;
  }
  .gallery-empty-icon { font-size:52px; opacity:.5; }
  .gallery-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:3px; }
  .gallery-thumb {
    aspect-ratio:1; overflow:hidden; cursor:pointer;
    background:#333; transition:opacity .12s;
  }
  .gallery-thumb:active { opacity:.7; }
  .gallery-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
  .gallery-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.9);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    z-index:500; padding:20px; gap:20px;
    animation:overlay-in .15s ease-out both;
  }
  .gallery-view-img {
    max-width:100%; max-height:calc(100dvh - 140px);
    object-fit:contain; border-radius:6px;
    box-shadow:0 8px 40px rgba(0,0,0,.6);
  }
  .gallery-view-actions { display:flex; gap:12px; }
  .gallery-view-btn {
    padding:12px 24px; border-radius:20px; border:none;
    font-size:14px; font-weight:600; cursor:pointer;
    transition:transform .1s;
  }
  .gallery-view-btn:active { transform:scale(.95); }
  .gallery-view-btn.primary { background:linear-gradient(135deg,#007AFF,#5856D6); color:#fff; box-shadow:0 4px 14px rgba(0,122,255,.35); }
  .gallery-view-btn.danger { background:rgba(255,59,48,.15); color:#FF3B30; border:1px solid rgba(255,59,48,.3); }
  .gallery-view-close {
    position:absolute; top:16px; right:16px;
    width:36px; height:36px; border-radius:50%;
    background:rgba(255,255,255,.12); border:none;
    color:#fff; font-size:18px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
  }
`;

// ─── Camera Screen ─────────────────────────────────────────────────────────────

function CameraScreen({ onCapture, onGallery }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [style, setStyle] = useState(PHOTO_STYLES[0]);
  const [stripMode, setStripMode] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [stripPreview, setStripPreview] = useState([]);
  const [camError, setCamError] = useState(false);
  const [shotProgress, setShotProgress] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [atEnd, setAtEnd] = useState(false);
  const [showStripTooltip, setShowStripTooltip] = useState(false);
  const styleBarRef = useRef(null);

  useEffect(() => {
    startCamera("user");
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    const bar = styleBarRef.current;
    if (!bar) return;
    const check = () => setAtEnd(bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 4);
    bar.addEventListener("scroll", check);
    check();
    return () => bar.removeEventListener("scroll", check);
  }, []);

  function toggleStripMode() {
    const next = !stripMode;
    setStripMode(next);
    if (next && !localStorage.getItem("stripSeen")) {
      localStorage.setItem("stripSeen", "1");
      setShowStripTooltip(true);
      setTimeout(() => setShowStripTooltip(false), 3000);
    }
  }

  async function startCamera(mode) {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCamError(true);
    }
  }

  async function switchCamera() {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    await startCamera(next);
  }

  function snap() {
    const v = videoRef.current;
    if (!v) return null;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    if (facingMode === "user") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0);
    return c.toDataURL("image/jpeg", 0.92);
  }

  async function doCapture() {
    if (capturing) return;
    setCapturing(true);
    setStripPreview([]);
    setShotProgress(null);
    const shots = stripMode ? 4 : 1;
    const photos = [];

    for (let i = 0; i < shots; i++) {
      if (stripMode) setShotProgress(`${i + 1} / ${shots}`);
      for (let n = 3; n > 0; n--) {
        setCountdown(n);
        await sleep(900);
      }
      setCountdown(null);
      setFlash(true);
      await sleep(40);
      photos.push(snap());
      setStripPreview([...photos]);
      setFlash(false);
      if (i < shots - 1) await sleep(700);
    }

    setShotProgress(null);
    setCapturing(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    onCapture({ photos, style, isStrip: stripMode });
  }

  return (
    <div className="cam-wrap">
      <div className="cam-preview">
        {camError ? (
          <div className="cam-err">
            <div className="cam-err-icon">📷</div>
            <div>Camera non disponibile</div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="cam-video"
              style={{
                filter: style.filter === "none" ? undefined : style.filter,
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
              autoPlay playsInline muted
              aria-label="Anteprima camera"
            />
            <button
              className="cam-switch"
              onClick={switchCamera}
              disabled={capturing}
              aria-label="Cambia fotocamera"
            >
              🔄
            </button>
          </>
        )}

        {shotProgress && (
          <div className="strip-progress" aria-live="polite">
            Foto {shotProgress}
          </div>
        )}

        {countdown !== null && (
          <div className="countdown-over" aria-live="assertive" aria-atomic="true">
            <div className="countdown-num" key={countdown}>{countdown}</div>
          </div>
        )}

        {flash && <div className="flash-el" />}

        {stripMode && stripPreview.length > 0 && (
          <div className="strip-mini">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="strip-mini-frame">
                {stripPreview[i] && <img src={stripPreview[i]} alt="" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`style-bar-wrap${atEnd ? " at-end" : ""}`}>
        <div className="style-bar" ref={styleBarRef} role="group" aria-label="Stili fotografici">
          {PHOTO_STYLES.map(s => (
            <button
              key={s.id}
              className={`style-chip${style.id === s.id ? " on" : ""}`}
              onClick={() => setStyle(s)}
              aria-pressed={style.id === s.id}
              aria-label={`Filtro ${s.name}`}
            >
              <div className="style-chip-swatch" style={{ background: s.swatch }} aria-hidden="true" />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="cam-controls">
        <div className="mode-wrap">
          {showStripTooltip && (
            <div className="strip-tooltip" role="status">
              🎞️ 4 foto in sequenza!
            </div>
          )}
          <button
            className={`mode-btn${stripMode ? " on" : ""}`}
            onClick={toggleStripMode}
            aria-pressed={stripMode}
            aria-label={stripMode ? "Modalità strip attiva (4 foto)" : "Modalità singola foto"}
          >
            <span className="mode-btn-icon" aria-hidden="true">{stripMode ? "🎞️" : "📷"}</span>
            {stripMode ? "Strip" : "Single"}
            {stripMode && <span className="mode-btn-label">4 foto</span>}
          </button>
        </div>

        <button
          className="shutter"
          onClick={doCapture}
          disabled={capturing || camError}
          aria-label={stripMode ? "Scatta 4 foto (modalità strip)" : "Scatta foto"}
        >
          <div className="shutter-inner" />
        </button>

        <button className="gallery-btn" onClick={onGallery} aria-label="Apri galleria">🖼️</button>
      </div>
    </div>
  );
}

// ─── Sticker Screen ────────────────────────────────────────────────────────────

function StickerScreen({ captureData, onRetake, onGallery }) {
  const { photos, style, isStrip } = captureData;
  const containerRef = useRef(null);
  const [stickers, setStickers] = useState([]);
  const [stickerHistory, setStickerHistory] = useState([]);
  const [activeCat, setActiveCat] = useState(0);
  const [frame, setFrame] = useState(FRAMES[0]);
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Ctrl+Z undo
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        setStickerHistory(prev => {
          if (!prev.length) return prev;
          setStickers(prev[prev.length - 1]);
          return prev.slice(0, -1);
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function saveSnapshot(snap) {
    setStickerHistory(prev => [...prev.slice(-15), snap]);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function addSticker(emoji) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    saveSnapshot(stickers);
    const id = ++stickerCounter;
    const size = 52;
    setStickers(prev => [...prev, {
      id, emoji, size, rotation: 0,
      x: 40 + Math.random() * (rect.width - size - 80),
      y: 40 + Math.random() * (rect.height - size - 80),
    }]);
    setSelected(id);
  }

  function handleStickerDown(e, sticker) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(sticker.id);
    saveSnapshot(stickers);
    setDragging({ type: "move", id: sticker.id, origX: sticker.x, origY: sticker.y, startX: e.clientX, startY: e.clientY });
  }

  function handleResizeDown(e, sticker) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    saveSnapshot(stickers);
    setDragging({ type: "resize", id: sticker.id, origSize: sticker.size, startX: e.clientX, startY: e.clientY });
  }

  function handleRotateDown(e, sticker) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    saveSnapshot(stickers);
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + sticker.x + sticker.size / 2;
    const centerY = rect.top + sticker.y + sticker.size / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    setDragging({ type: "rotate", id: sticker.id, origRotation: sticker.rotation || 0, centerX, centerY, startAngle });
  }

  function handleStickerMove(e) {
    if (!dragging) return;
    if (dragging.type === "move") {
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      setStickers(prev => prev.map(s =>
        s.id === dragging.id ? { ...s, x: dragging.origX + dx, y: dragging.origY + dy } : s
      ));
    } else if (dragging.type === "resize") {
      const delta = ((e.clientX - dragging.startX) + (e.clientY - dragging.startY)) / 2;
      const newSize = Math.max(24, Math.min(130, dragging.origSize + delta));
      setStickers(prev => prev.map(s =>
        s.id === dragging.id ? { ...s, size: newSize } : s
      ));
    } else if (dragging.type === "rotate") {
      const angle = Math.atan2(e.clientY - dragging.centerY, e.clientX - dragging.centerX) * 180 / Math.PI;
      const newRotation = dragging.origRotation + (angle - dragging.startAngle);
      setStickers(prev => prev.map(s =>
        s.id === dragging.id ? { ...s, rotation: newRotation } : s
      ));
    }
  }

  function removeSticker(id) {
    saveSnapshot(stickers);
    setStickers(prev => prev.filter(s => s.id !== id));
    if (selected === id) setSelected(null);
  }

  function loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function decoCenter(dec, rect) {
    let x, y;
    if (dec.left != null) x = (parseFloat(dec.left) / 100) * rect.width + dec.size / 2;
    else x = rect.width - (parseFloat(dec.right) / 100) * rect.width - dec.size / 2;
    if (dec.top != null) y = (parseFloat(dec.top) / 100) * rect.height + dec.size / 2;
    else y = rect.height - (parseFloat(dec.bottom) / 100) * rect.height - dec.size / 2;
    return { x, y };
  }

  async function handleDownload() {
    if (saving) return;
    setSaving(true);
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    const f = style.filter !== "none" ? style.filter : "";
    const LABEL_H = 34;
    const padBottom = frame.pad + (frame.label ? LABEL_H : 0);

    // Frame background
    if (frame.canvasStripe) {
      const stripeW = 14;
      for (let x = 0; x < rect.width; x += stripeW * 2) {
        ctx.fillStyle = frame.canvasStripe[0];
        ctx.fillRect(x, 0, stripeW, rect.height);
        ctx.fillStyle = frame.canvasStripe[1];
        ctx.fillRect(x + stripeW, 0, stripeW, rect.height);
      }
    } else {
      ctx.fillStyle = frame.bg;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    const innerX = frame.pad;
    const innerY = frame.pad;
    const innerW = rect.width - frame.pad * 2;
    const innerH = rect.height - frame.pad - padBottom;

    if (!isStrip) {
      const img = await loadImage(photos[0]);
      ctx.save();
      roundRectPath(ctx, innerX, innerY, innerW, innerH, frame.radius);
      ctx.clip();
      if (f) ctx.filter = f;
      ctx.drawImage(img, innerX, innerY, innerW, innerH);
      ctx.restore();
      if (frame.dashedPhotoBorder) {
        ctx.save();
        ctx.strokeStyle = frame.accent;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        roundRectPath(ctx, innerX, innerY, innerW, innerH, frame.radius);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      const h = (innerH - frame.gap * (photos.length - 1)) / photos.length;
      for (let i = 0; i < photos.length; i++) {
        const img = await loadImage(photos[i]);
        const y = innerY + i * (h + frame.gap);
        ctx.save();
        roundRectPath(ctx, innerX, y, innerW, h, frame.radius);
        ctx.clip();
        if (f) ctx.filter = f;
        ctx.drawImage(img, innerX, y, innerW, h);
        ctx.restore();
        if (frame.dashedPhotoBorder) {
          ctx.save();
          ctx.strokeStyle = frame.accent;
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          roundRectPath(ctx, innerX, y, innerW, h, frame.radius);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    ctx.filter = "";

    // Frame decorations
    for (const dec of frame.decorations) {
      const { x, y } = decoCenter(dec, rect);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((dec.rotate || 0) * Math.PI) / 180);
      ctx.font = `${dec.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(dec.emoji, 0, 0);
      ctx.restore();
    }

    // Frame label
    if (frame.label) {
      try { await document.fonts.load(`20px "Yomogi"`); } catch {}
      ctx.fillStyle = frame.accent;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `20px "Yomogi",cursive`;
      ctx.fillText(frame.label.text, rect.width / 2, rect.height - padBottom + LABEL_H / 2 + 3);
    }

    for (const s of stickers) {
      ctx.save();
      ctx.translate(s.x + s.size / 2, s.y + s.size / 2);
      ctx.rotate(((s.rotation || 0) * Math.PI) / 180);
      ctx.font = `${s.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(s.emoji, 0, 0);
      ctx.restore();
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    // Prova Web Share API (mobile)
    if (navigator.canShare) {
      try {
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], `photobooth-${Date.now()}.jpg`, { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "📸 Photobooth" });
          dbSavePhoto(dataUrl);
          setSaving(false);
          showToast("✅ Condivisa!");
          return;
        }
      } catch (e) {
        if (e.name === "AbortError") { setSaving(false); return; }
      }
    }

    dbSavePhoto(dataUrl);
    const a = document.createElement("a");
    a.download = `photobooth-${Date.now()}.jpg`;
    a.href = dataUrl;
    a.click();
    setSaving(false);
    showToast("✅ Foto salvata!");
  }

  return (
    <div className="stk-screen">
      {/* Confirm dialog ritatta */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">Ritattare?</div>
            <div className="confirm-desc">Perderai tutti gli sticker aggiunti. La foto verrà eliminata.</div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowConfirm(false)}>Annulla</button>
              <button className="confirm-ok" onClick={onRetake}>Sì, ritatta</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast" role="status">{toast}</div>}

      <div className="stk-header">
        <div style={{ display:"flex", gap:6 }}>
          <button className="btn-ghost" onClick={() => setShowConfirm(true)}>← Ritatta</button>
          <button className="btn-ghost" onClick={onGallery} aria-label="Galleria">🖼️</button>
        </div>
        <div>
          <div className="stk-title">Sticker</div>
          <div className="stk-hint">
            {selected ? "Trascina • ✕ elimina • ↻⤡ modifica" : "Tocca uno sticker per aggiungerlo"}
          </div>
        </div>
        <button className="btn-save" onClick={handleDownload} disabled={saving} aria-label="Condividi o scarica foto">
          {saving ? "⏳ …" : navigator.canShare ? "↗ Condividi" : "⬇ Salva"}
        </button>
      </div>

      <div className="frame-bar-wrap">
        <div className="frame-bar" role="group" aria-label="Cornici">
          {FRAMES.map(fr => (
            <button
              key={fr.id}
              className={`frame-chip${frame.id === fr.id ? " on" : ""}`}
              onClick={() => setFrame(fr)}
              aria-pressed={frame.id === fr.id}
              aria-label={`Cornice ${fr.name}`}
            >
              <div className="frame-chip-swatch" style={{ background: fr.swatch }} aria-hidden="true" />
              {fr.name}
            </button>
          ))}
        </div>
      </div>

      <div
        className="photo-area"
        onClick={() => setSelected(null)}
      >
      <div
        className={`photo-card${isStrip ? " is-strip" : " is-single"}`}
        ref={containerRef}
        style={{
          background: frame.bg,
          padding: frame.pad,
          paddingBottom: frame.pad + (frame.label ? 34 : 0),
        }}
      >
        {frame.decorations.map((dec, i) => (
          <div
            key={i}
            className="frame-deco"
            aria-hidden="true"
            style={{
              top: dec.top, left: dec.left, right: dec.right, bottom: dec.bottom,
              fontSize: dec.size, transform: `rotate(${dec.rotate || 0}deg)`,
            }}
          >
            {dec.emoji}
          </div>
        ))}

        {isStrip ? (
          <div className="frame-strip" style={{ gap: frame.gap }}>
            {photos.map((p, i) => (
              <div
                key={i}
                className="frame-photo"
                style={{
                  borderRadius: frame.radius,
                  border: frame.dashedPhotoBorder ? `2px dashed ${frame.accent}` : undefined,
                }}
              >
                <img src={p} style={{ filter: style.filter }} alt="" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="frame-single"
            style={{
              borderRadius: frame.radius,
              border: frame.dashedPhotoBorder ? `2px dashed ${frame.accent}` : undefined,
            }}
          >
            <img src={photos[0]} style={{ filter: style.filter }} alt="" />
          </div>
        )}

        {frame.label && (
          <div className="frame-label" style={{ color: frame.accent }}>{frame.label.text}</div>
        )}

        {/* Undo button */}
        <button
          className="undo-btn"
          onClick={() => setStickerHistory(prev => {
            if (!prev.length) return prev;
            setStickers(prev[prev.length - 1]);
            return prev.slice(0, -1);
          })}
          disabled={stickerHistory.length === 0}
          aria-label="Annulla ultima azione"
        >↩</button>

        {stickers.map(s => (
          <div
            key={s.id}
            className={`stk-el${selected === s.id ? " sel" : ""}`}
            style={{ left: s.x, top: s.y, fontSize: s.size, transform: `rotate(${s.rotation || 0}deg)` }}
            onPointerDown={e => handleStickerDown(e, s)}
            onPointerMove={handleStickerMove}
            onPointerUp={() => setDragging(null)}
            onDoubleClick={e => { e.stopPropagation(); removeSticker(s.id); }}
            role="img"
            aria-label={`Sticker ${s.emoji}, trascina per spostare`}
          >
            {s.emoji}
            {selected === s.id && (<>
              <button
                className="stk-delete"
                onClick={e => { e.stopPropagation(); removeSticker(s.id); }}
                onPointerDown={e => e.stopPropagation()}
                aria-label={`Elimina sticker ${s.emoji}`}
              >✕</button>
              <div
                className="stk-handle stk-handle-rotate"
                onPointerDown={e => handleRotateDown(e, s)}
                onPointerMove={handleStickerMove}
                onPointerUp={() => setDragging(null)}
                aria-label="Ruota"
                role="button"
              >↻</div>
              <div
                className="stk-handle stk-handle-resize"
                onPointerDown={e => handleResizeDown(e, s)}
                onPointerMove={handleStickerMove}
                onPointerUp={() => setDragging(null)}
                aria-label="Ridimensiona"
                role="button"
              >⤡</div>
            </>)}
          </div>
        ))}
      </div>
      </div>

      <div className="stk-panel">
        {/* Handle collassabile */}
        <div
          className="stk-panel-handle"
          onClick={() => setPanelOpen(v => !v)}
          role="button"
          aria-expanded={panelOpen}
          aria-label={panelOpen ? "Chiudi pannello sticker" : "Apri pannello sticker"}
        >
          <div className="stk-panel-bar" />
          <span className="stk-panel-label">{panelOpen ? "Nascondi" : "Sticker"}</span>
        </div>

        {panelOpen && (<>
          <div className="cat-tabs" role="tablist" aria-label="Categorie sticker">
            {STICKER_CATS.map((c, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={activeCat === i}
                className={`cat-tab${activeCat === i ? " on" : ""}`}
                onClick={() => setActiveCat(i)}
                aria-label={`Categoria ${c.cat}`}
              >
                {c.cat}
              </button>
            ))}
          </div>
          <div className="stk-grid" role="tabpanel">
            {STICKER_CATS[activeCat].items.map((emoji, i) => (
              <button
                key={i}
                className="stk-pick"
                onClick={() => addSticker(emoji)}
                aria-label={`Aggiungi sticker ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>)}
      </div>
    </div>
  );
}

// ─── Gallery Screen ─────────────────────────────────────────────────────────────

function GalleryScreen({ onBack }) {
  const [photos, setPhotos] = useState([]);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    dbLoadPhotos().then(setPhotos).catch(() => {});
  }, []);

  function download(p) {
    const a = document.createElement("a");
    a.href = p.dataUrl;
    a.download = `photobooth-${p.date}.jpg`;
    a.click();
  }

  async function remove(id) {
    await dbDeletePhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (viewing?.id === id) setViewing(null);
  }

  return (
    <div className="gallery-screen">
      <div className="gallery-header">
        <button className="btn-ghost" onClick={onBack}>← Indietro</button>
        <span className="gallery-title">Galleria</span>
        <span className="gallery-count">{photos.length} foto</span>
      </div>
      <div className="gallery-body">
        {photos.length === 0 ? (
          <div className="gallery-empty">
            <div className="gallery-empty-icon">🖼️</div>
            <div>Nessuna foto ancora.<br/>Scatta e salva per vederle qui.</div>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map(p => (
              <div key={p.id} className="gallery-thumb" onClick={() => setViewing(p)}>
                <img src={p.dataUrl} alt="" />
              </div>
            ))}
          </div>
        )}
      </div>

      {viewing && (
        <div className="gallery-overlay" onClick={() => setViewing(null)}>
          <button className="gallery-view-close" onClick={() => setViewing(null)}>✕</button>
          <img className="gallery-view-img" src={viewing.dataUrl} alt="" onClick={e => e.stopPropagation()} />
          <div className="gallery-view-actions" onClick={e => e.stopPropagation()}>
            <button className="gallery-view-btn primary" onClick={() => download(viewing)}>⬇ Scarica</button>
            <button className="gallery-view-btn danger" onClick={() => remove(viewing.id)}>🗑 Elimina</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [capture, setCapture] = useState(null);
  const [screen, setScreen] = useState("camera"); // "camera" | "sticker" | "gallery"

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  function handleCapture(cap) {
    setCapture(cap);
    setScreen("sticker");
  }

  function handleRetake() {
    setCapture(null);
    setScreen("camera");
  }

  return (
    <div className="app">
      {screen === "gallery" ? (
        <GalleryScreen onBack={() => setScreen(capture ? "sticker" : "camera")} />
      ) : screen === "sticker" && capture ? (
        <StickerScreen
          captureData={capture}
          onRetake={handleRetake}
          onGallery={() => setScreen("gallery")}
        />
      ) : (
        <CameraScreen
          onCapture={handleCapture}
          onGallery={() => setScreen("gallery")}
        />
      )}
    </div>
  );
}
