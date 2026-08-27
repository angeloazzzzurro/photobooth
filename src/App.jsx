import { useState, useRef, useEffect } from "react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const PHOTO_STYLES = [
  { id: "original", name: "Original", filter: "none",                                                          icon: "📷" },
  { id: "bw",       name: "B&W",      filter: "grayscale(100%) contrast(1.2)",                                 icon: "🎞️" },
  { id: "vintage",  name: "Vintage",  filter: "sepia(0.8) brightness(1.1)",                                    icon: "🍂" },
  { id: "neon",     name: "Neon",     filter: "saturate(2) hue-rotate(270deg) brightness(1.2) contrast(1.1)", icon: "⚡" },
  { id: "dreamy",   name: "Dreamy",   filter: "brightness(1.15) saturate(1.5) contrast(0.9)",                  icon: "🌸" },
  { id: "pop",      name: "Pop",      filter: "saturate(3) contrast(1.4)",                                     icon: "🎨" },
  { id: "ice",      name: "Ice",      filter: "hue-rotate(195deg) saturate(1.5) brightness(1.1)",              icon: "❄️" },
  { id: "golden",   name: "Golden",   filter: "sepia(0.4) saturate(2) brightness(1.1)",                       icon: "✨" },
];

const STICKER_CATS = [
  { cat: "❤️", items: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💕","💞","💓","💗","💖","💘","💝"] },
  { cat: "😊", items: ["😊","😂","🥰","😍","🤩","😎","🥳","😜","🤪","😈","👻","🤖","💀","🤡","👽"] },
  { cat: "✨", items: ["✨","⭐","🌟","💫","🌈","☀️","🌙","⚡","🔥","💥","❄️","🌊","🌀","🎆","🎇"] },
  { cat: "🌸", items: ["🌸","🌺","🌻","🌹","🌷","🍀","🌿","🦋","🐝","🌱","🍄","🍁","🌵","🌴","🪴"] },
  { cat: "🎉", items: ["🎉","🎊","🎈","🥂","🍾","🎁","🎀","🎂","🏆","👑","💎","🎯","🎪","🪄","🎭"] },
  { cat: "💪", items: ["💯","🔥","✅","💪","👍","✌️","🤙","🙌","👏","🤝","🫶","🧿","😏","🫠","🤌"] },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
let stickerCounter = 0;

// ─── Global CSS ────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  body { background:#0A0A12; overflow:hidden; font-family:'DM Sans',system-ui,sans-serif; }

  .app {
    background:#0A0A12; color:#F0F0FF;
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
    transform:scaleX(-1); transition:filter 0.25s;
  }

  .countdown-over {
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center;
    pointer-events:none; z-index:10;
  }
  .countdown-num {
    font-size:110px; font-weight:900; color:#fff; line-height:1;
    text-shadow:0 0 60px rgba(255,107,157,.9),0 0 20px rgba(192,132,252,.8);
    animation:cd-in .4s cubic-bezier(.34,1.56,.64,1) both;
  }
  @keyframes cd-in { from{transform:scale(1.6);opacity:0} to{transform:scale(1);opacity:1} }

  .flash-el {
    position:absolute; inset:0; background:#fff; pointer-events:none; z-index:20;
    animation:do-flash .35s ease-out forwards;
  }
  @keyframes do-flash { 0%{opacity:.9} 100%{opacity:0} }

  .strip-mini {
    position:absolute; bottom:12px; right:12px;
    display:flex; flex-direction:column; gap:3px;
    background:rgba(0,0,0,.65); padding:6px; border-radius:8px;
    backdrop-filter:blur(8px);
  }
  .strip-mini-frame {
    width:44px; height:33px; border-radius:4px;
    overflow:hidden; background:rgba(255,255,255,.1);
  }
  .strip-mini-frame img { width:100%; height:100%; object-fit:cover; }

  .cam-err { color:#888; text-align:center; padding:32px; }
  .cam-err-icon { font-size:48px; margin-bottom:12px; }

  /* Style bar */
  .style-bar {
    display:flex; gap:6px; padding:10px 12px;
    overflow-x:auto; scrollbar-width:none;
    background:rgba(10,10,18,.97);
    border-top:1px solid rgba(255,255,255,.05);
  }
  .style-bar::-webkit-scrollbar { display:none; }

  .style-chip {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:7px 14px; border-radius:20px;
    border:1.5px solid transparent;
    background:rgba(255,255,255,.06);
    color:rgba(255,255,255,.45);
    cursor:pointer; font-size:11px; font-weight:500;
    white-space:nowrap; flex-shrink:0; transition:all .15s;
  }
  .style-chip.on { border-color:#FF6B9D; background:rgba(255,107,157,.15); color:#FF6B9D; }
  .style-chip-icon { font-size:18px; }

  /* Controls */
  .cam-controls {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 32px 28px;
    background:rgba(10,10,18,.98);
  }

  .mode-btn {
    display:flex; flex-direction:column; align-items:center; gap:4px;
    width:56px; padding:10px 0; border-radius:14px;
    border:1.5px solid rgba(255,255,255,.1);
    background:transparent; color:rgba(255,255,255,.45);
    cursor:pointer; font-size:10px; font-weight:500; transition:all .15s;
  }
  .mode-btn.on { border-color:#C084FC; background:rgba(192,132,252,.12); color:#C084FC; }
  .mode-btn-icon { font-size:22px; }

  .shutter {
    width:74px; height:74px; border-radius:50%;
    background:linear-gradient(135deg,#FF6B9D,#C084FC);
    border:none; cursor:pointer;
    box-shadow:0 0 0 4px rgba(255,107,157,.2),0 0 30px rgba(255,107,157,.4);
    display:flex; align-items:center; justify-content:center;
    transition:transform .1s,box-shadow .1s;
  }
  .shutter:active { transform:scale(.91); box-shadow:0 0 0 4px rgba(255,107,157,.1),0 0 15px rgba(255,107,157,.2); }
  .shutter:disabled { opacity:.4; cursor:not-allowed; }
  .shutter-inner { width:58px; height:58px; border-radius:50%; background:rgba(255,255,255,.92); }

  /* ── Sticker screen ── */
  .stk-screen { display:flex; flex-direction:column; height:100%; min-height:0; }

  .stk-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 16px;
    background:rgba(10,10,18,.98);
    border-bottom:1px solid rgba(255,255,255,.06);
    flex-shrink:0;
  }
  .stk-title { font-size:15px; font-weight:600; }
  .stk-hint  { font-size:10px; color:rgba(255,255,255,.3); text-align:center; margin-top:2px; }

  .btn-ghost {
    padding:8px 14px; border-radius:20px;
    border:1.5px solid rgba(255,255,255,.12);
    background:transparent; color:rgba(255,255,255,.55);
    cursor:pointer; font-size:13px; font-weight:500;
    display:flex; align-items:center; gap:5px;
  }

  .btn-save {
    padding:8px 18px; border-radius:20px; border:none;
    background:linear-gradient(135deg,#FF6B9D,#C084FC);
    color:#fff; cursor:pointer; font-size:13px; font-weight:600;
    display:flex; align-items:center; gap:5px;
    box-shadow:0 4px 15px rgba(255,107,157,.35);
    transition:transform .1s;
  }
  .btn-save:active { transform:scale(.97); }

  .photo-area {
    flex:1; position:relative; overflow:hidden;
    background:#000; display:flex; align-items:stretch;
    touch-action:none; user-select:none; min-height:0;
  }

  .photo-fit { width:100%; height:100%; object-fit:cover; pointer-events:none; display:block; }

  .strip-wrap { display:flex; flex-direction:column; width:100%; height:100%; }
  .strip-frame { flex:1; overflow:hidden; position:relative; }
  .strip-frame:not(:last-child) { border-bottom:2px solid #0A0A12; }
  .strip-frame img { width:100%; height:100%; object-fit:cover; display:block; }

  .stk-el {
    position:absolute; cursor:grab; user-select:none;
    touch-action:none; line-height:1;
    filter:drop-shadow(0 2px 4px rgba(0,0,0,.5));
  }
  .stk-el:active { cursor:grabbing; }
  .stk-el.sel { outline:2px dashed rgba(255,107,157,.8); outline-offset:3px; border-radius:4px; }

  /* Sticker panel */
  .stk-panel { background:#0F0F1A; border-top:1px solid rgba(255,255,255,.07); flex-shrink:0; }

  .cat-tabs { display:flex; overflow-x:auto; scrollbar-width:none; border-bottom:1px solid rgba(255,255,255,.05); }
  .cat-tabs::-webkit-scrollbar { display:none; }
  .cat-tab {
    padding:10px 18px; font-size:22px;
    background:transparent; border:none; border-bottom:2px solid transparent;
    cursor:pointer; flex-shrink:0; transition:border-color .15s; line-height:1;
  }
  .cat-tab.on { border-bottom-color:#FF6B9D; }

  .stk-grid {
    display:grid; grid-template-columns:repeat(5,1fr);
    gap:4px; padding:8px; max-height:150px;
    overflow-y:auto; scrollbar-width:thin;
    scrollbar-color:rgba(255,107,157,.3) transparent;
  }

  .stk-pick {
    background:rgba(255,255,255,.05); border:none; border-radius:10px;
    padding:9px 4px; font-size:26px; cursor:pointer; line-height:1;
    transition:background .1s,transform .1s;
  }
  .stk-pick:active { background:rgba(255,107,157,.2); transform:scale(.88); }
`;

// ─── Camera Screen ─────────────────────────────────────────────────────────────

function CameraScreen({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [style, setStyle] = useState(PHOTO_STYLES[0]);
  const [stripMode, setStripMode] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [stripPreview, setStripPreview] = useState([]);
  const [camError, setCamError] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCamError(true));
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  function snap() {
    const v = videoRef.current;
    if (!v) return null;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    const ctx = c.getContext("2d");
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    return c.toDataURL("image/jpeg", 0.92);
  }

  async function doCapture() {
    if (capturing) return;
    setCapturing(true);
    setStripPreview([]);
    const shots = stripMode ? 4 : 1;
    const photos = [];

    for (let i = 0; i < shots; i++) {
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
          <video
            ref={videoRef}
            className="cam-video"
            style={{ filter: style.filter === "none" ? undefined : style.filter }}
            autoPlay playsInline muted
          />
        )}

        {countdown !== null && (
          <div className="countdown-over">
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

      <div className="style-bar">
        {PHOTO_STYLES.map(s => (
          <button
            key={s.id}
            className={`style-chip${style.id === s.id ? " on" : ""}`}
            onClick={() => setStyle(s)}
          >
            <span className="style-chip-icon">{s.icon}</span>
            {s.name}
          </button>
        ))}
      </div>

      <div className="cam-controls">
        <button
          className={`mode-btn${stripMode ? " on" : ""}`}
          onClick={() => setStripMode(v => !v)}
        >
          <span className="mode-btn-icon">{stripMode ? "🎞️" : "📷"}</span>
          {stripMode ? "Strip" : "Single"}
        </button>

        <button className="shutter" onClick={doCapture} disabled={capturing || camError}>
          <div className="shutter-inner" />
        </button>

        <div style={{ width: 56 }} />
      </div>
    </div>
  );
}

// ─── Sticker Screen ────────────────────────────────────────────────────────────

function StickerScreen({ captureData, onRetake }) {
  const { photos, style, isStrip } = captureData;
  const containerRef = useRef(null);
  const [stickers, setStickers] = useState([]);
  const [activeCat, setActiveCat] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null);

  function addSticker(emoji) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const id = ++stickerCounter;
    const size = 52;
    setStickers(prev => [...prev, {
      id, emoji, size,
      x: 40 + Math.random() * (rect.width - size - 80),
      y: 40 + Math.random() * (rect.height - size - 80),
    }]);
    setSelected(id);
  }

  function handleStickerDown(e, sticker) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(sticker.id);
    setDragging({ id: sticker.id, origX: sticker.x, origY: sticker.y, startX: e.clientX, startY: e.clientY });
  }

  function handleStickerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - dragging.startX;
    const dy = e.clientY - dragging.startY;
    setStickers(prev => prev.map(s =>
      s.id === dragging.id ? { ...s, x: dragging.origX + dx, y: dragging.origY + dy } : s
    ));
  }

  function removeSticker(id) {
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

  async function handleDownload() {
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

    if (!isStrip) {
      const img = await loadImage(photos[0]);
      if (f) ctx.filter = f;
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      ctx.filter = "";
    } else {
      const h = rect.height / photos.length;
      for (let i = 0; i < photos.length; i++) {
        const img = await loadImage(photos[i]);
        if (f) ctx.filter = f;
        ctx.drawImage(img, 0, i * h, rect.width, h);
        ctx.filter = "";
        if (i < photos.length - 1) {
          ctx.fillStyle = "#0A0A12";
          ctx.fillRect(0, (i + 1) * h - 1, rect.width, 2);
        }
      }
    }

    for (const s of stickers) {
      ctx.font = `${s.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText(s.emoji, s.x, s.y);
    }

    const a = document.createElement("a");
    a.download = `photobooth-${Date.now()}.jpg`;
    a.href = canvas.toDataURL("image/jpeg", 0.95);
    a.click();
  }

  return (
    <div className="stk-screen">
      <div className="stk-header">
        <button className="btn-ghost" onClick={onRetake}>← Ritatta</button>
        <div>
          <div className="stk-title">Sticker</div>
          <div className="stk-hint">
            {selected ? "Trascina • doppio tap = elimina" : "Tocca uno sticker per aggiungerlo"}
          </div>
        </div>
        <button className="btn-save" onClick={handleDownload}>⬇ Salva</button>
      </div>

      <div
        className="photo-area"
        ref={containerRef}
        onClick={() => setSelected(null)}
      >
        {isStrip ? (
          <div className="strip-wrap">
            {photos.map((p, i) => (
              <div key={i} className="strip-frame">
                <img src={p} style={{ filter: style.filter }} alt="" />
              </div>
            ))}
          </div>
        ) : (
          <img className="photo-fit" src={photos[0]} style={{ filter: style.filter }} alt="" />
        )}

        {stickers.map(s => (
          <div
            key={s.id}
            className={`stk-el${selected === s.id ? " sel" : ""}`}
            style={{ left: s.x, top: s.y, fontSize: s.size }}
            onPointerDown={e => handleStickerDown(e, s)}
            onPointerMove={handleStickerMove}
            onPointerUp={() => setDragging(null)}
            onDoubleClick={e => { e.stopPropagation(); removeSticker(s.id); }}
          >
            {s.emoji}
          </div>
        ))}
      </div>

      <div className="stk-panel">
        <div className="cat-tabs">
          {STICKER_CATS.map((c, i) => (
            <button
              key={i}
              className={`cat-tab${activeCat === i ? " on" : ""}`}
              onClick={() => setActiveCat(i)}
            >
              {c.cat}
            </button>
          ))}
        </div>
        <div className="stk-grid">
          {STICKER_CATS[activeCat].items.map((emoji, i) => (
            <button key={i} className="stk-pick" onClick={() => addSticker(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const [capture, setCapture] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  return (
    <div className="app">
      {!capture ? (
        <CameraScreen onCapture={setCapture} />
      ) : (
        <StickerScreen captureData={capture} onRetake={() => setCapture(null)} />
      )}
    </div>
  );
}
