const STORAGE_KEY = "socialEditorState";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&fit=crop&w=1453&q=85";

const PANELS = {
  templates: {
    title: "Templates",
    html: `
      <button class="template-card" data-size="1080,1080">
        <span class="template-card__preview template-card__preview--square"></span>
        <span>Instagram Post</span>
        <small>1080 × 1080</small>
      </button>
      <button class="template-card" data-size="1080,1920">
        <span class="template-card__preview template-card__preview--story"></span>
        <span>Instagram Story</span>
        <small>1080 × 1920</small>
      </button>
      <button class="template-card" data-size="1200,630">
        <span class="template-card__preview template-card__preview--cover"></span>
        <span>Facebook Cover</span>
        <small>1200 × 630</small>
      </button>
    `,
  },
  images: { title: "Images", dynamic: true },
  text: {
    title: "Text / Font",
    html: `
      <label class="field">
        <span>Heading</span>
        <input type="text" id="text-heading" placeholder="Your headline" />
      </label>
      <label class="field">
        <span>Subtext</span>
        <input type="text" id="text-sub" placeholder="Supporting copy" />
      </label>
      <label class="field">
        <span>Font size</span>
        <input type="range" id="text-size" min="16" max="72" value="36" />
      </label>
      <label class="field">
        <span>Color</span>
        <input type="color" id="text-color" value="#ffffff" />
      </label>
    `,
  },
  shapes: {
    title: "Shapes",
    html: `
      <button class="shape-btn" data-shape="circle">Circle overlay</button>
      <button class="shape-btn" data-shape="bar">Bottom bar</button>
      <button class="shape-btn" data-shape="frame">Frame border</button>
      <button class="shape-btn shape-btn--clear" data-shape="none">Clear overlays</button>
    `,
  },
};

const state = {
  activeTab: "images",
  panelCollapsed: false,
  canvasImage: DEFAULT_IMAGE,
  uploadedImages: [],
  template: "1080,1080",
  text: { heading: "", sub: "", size: 36, color: "#ffffff" },
  shape: "none",
};

const panel = document.querySelector(".panel");
const panelTitle = document.querySelector(".first-heading");
const panelBody = document.querySelector(".panel__body");
const panelImages = document.querySelector(".panel__images");
const menuButtons = document.querySelectorAll(".menu__button");
const collapseBtn = document.querySelector(".panel__collapse-btn");
const bgImg = document.querySelector(".canvas__bg-img");
const fgImg = document.querySelector(".canvas__fg-img");
const canvas = document.querySelector(".canvas");
const canvasText = document.querySelector(".canvas__text");
const publishBtn = document.querySelector(".button");
const uploadBtn = document.querySelector(".panel__btn");
const fileInput = document.getElementById("file-upload");

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    Object.assign(state, saved);
  } catch {
    /* ignore corrupt storage */
  }
}

function setCanvasImage(src) {
  state.canvasImage = src;
  bgImg.src = src;
  fgImg.src = src;
  saveState();
}

function renderImageGrid() {
  panelImages.innerHTML = "";
  [...state.uploadedImages, ...getDefaultImages()].forEach((src) => {
    const img = document.createElement("img");
    img.className = "panel__img";
    img.src = src;
    img.alt = "Selectable image";
    img.addEventListener("click", () => setCanvasImage(src));
    panelImages.appendChild(img);
  });

  const btn = document.createElement("button");
  btn.className = "panel__btn";
  btn.type = "button";
  btn.innerHTML = '<i class="fas fa-plus panel__upload-icon"></i>';
  btn.addEventListener("click", () => fileInput.click());
  panelImages.appendChild(btn);
}

function getDefaultImages() {
  return [
    "https://images.unsplash.com/photo-1543096222-72de739f7917?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&fit=crop&w=280&q=100",
    "https://images.unsplash.com/photo-1475598322381-f1b499717dda?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&fit=crop&h=280&q=100",
    "https://images.unsplash.com/photo-1615887023516-9b6bcd559e87?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&fit=crop&w=280&q=100",
    "https://images.unsplash.com/photo-1615749190340-34c7c3b16784?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&fit=crop&w=280&q=100",
    "https://images.unsplash.com/photo-1615707547992-93435f1e7f13?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&fit=crop&w=280&q=100",
  ];
}

function bindPanelEvents() {
  panelBody.querySelectorAll(".template-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.template = card.dataset.size;
      const [w, h] = state.template.split(",").map(Number);
      canvas.style.aspectRatio = `${w} / ${h}`;
      saveState();
    });
  });

  const heading = panelBody.querySelector("#text-heading");
  const sub = panelBody.querySelector("#text-sub");
  const size = panelBody.querySelector("#text-size");
  const color = panelBody.querySelector("#text-color");

  if (heading) {
    heading.value = state.text.heading;
    sub.value = state.text.sub;
    size.value = state.text.size;
    color.value = state.text.color;

    const updateText = () => {
      state.text = {
        heading: heading.value,
        sub: sub.value,
        size: Number(size.value),
        color: color.value,
      };
      renderCanvasText();
      saveState();
    };

    [heading, sub, size, color].forEach((el) =>
      el.addEventListener("input", updateText)
    );
  }

  panelBody.querySelectorAll(".shape-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.shape = btn.dataset.shape;
      canvas.dataset.shape = state.shape;
      saveState();
    });
  });
}

function renderPanel(tab) {
  state.activeTab = tab;
  const config = PANELS[tab];
  panelTitle.textContent = config.title;

  menuButtons.forEach((btn) => {
    btn.classList.toggle("menu__button--active", btn.dataset.tab === tab);
  });

  if (config.dynamic) {
    panelBody.innerHTML = "";
    panelBody.appendChild(panelImages);
    renderImageGrid();
  } else {
    panelBody.innerHTML = config.html;
    bindPanelEvents();
  }

  saveState();
}

function renderCanvasText() {
  canvasText.innerHTML = "";
  if (state.text.heading) {
    const h = document.createElement("h2");
    h.className = "canvas__heading";
    h.textContent = state.text.heading;
    h.style.fontSize = `${state.text.size}px`;
    h.style.color = state.text.color;
    canvasText.appendChild(h);
  }
  if (state.text.sub) {
    const p = document.createElement("p");
    p.className = "canvas__sub";
    p.textContent = state.text.sub;
    p.style.color = state.text.color;
    canvasText.appendChild(p);
  }
}

function togglePanel() {
  state.panelCollapsed = !state.panelCollapsed;
  panel.classList.toggle("panel--collapsed", state.panelCollapsed);
  const icon = collapseBtn.querySelector(".panel__collapse-icon");
  icon.classList.toggle("fa-angle-double-left", !state.panelCollapsed);
  icon.classList.toggle("fa-angle-double-right", state.panelCollapsed);
  saveState();
}

function handleUpload(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.uploadedImages.unshift(reader.result);
    setCanvasImage(reader.result);
    if (state.activeTab === "images") renderImageGrid();
    saveState();
  };
  reader.readAsDataURL(file);
}

async function exportCanvas() {
  const [w, h] = state.template.split(",").map(Number);
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d");

  const img = await loadImage(state.canvasImage);
  ctx.drawImage(img, 0, 0, w, h);

  if (state.shape === "circle") {
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (state.shape === "bar") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
  } else if (state.shape === "frame") {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = Math.max(8, w * 0.012);
    ctx.strokeRect(
      ctx.lineWidth,
      ctx.lineWidth,
      w - ctx.lineWidth * 2,
      h - ctx.lineWidth * 2
    );
  }

  if (state.text.heading) {
    ctx.fillStyle = state.text.color;
    ctx.font = `bold ${state.text.size}px Lato, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(state.text.heading, w / 2, h * 0.4);
  }
  if (state.text.sub) {
    ctx.fillStyle = state.text.color;
    ctx.font = `500 ${Math.round(state.text.size * 0.55)}px Lato, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(state.text.sub, w / 2, h * 0.4 + state.text.size * 1.2);
  }

  offscreen.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "social-editor-export.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

menuButtons.forEach((btn) => {
  btn.addEventListener("click", () => renderPanel(btn.dataset.tab));
});

collapseBtn.addEventListener("click", togglePanel);
fileInput.addEventListener("change", (e) => handleUpload(e.target.files[0]));
publishBtn.addEventListener("click", exportCanvas);

loadState();
setCanvasImage(state.canvasImage);
canvas.dataset.shape = state.shape;
const [tw, th] = state.template.split(",").map(Number);
canvas.style.aspectRatio = `${tw} / ${th}`;
renderCanvasText();
renderPanel(state.activeTab);
if (state.panelCollapsed) togglePanel();
