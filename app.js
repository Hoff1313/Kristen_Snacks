let currentPark = "all";
let currentTried = "all";

// Load saved tried state
let saved = JSON.parse(localStorage.getItem("snack-tracker")) || {};

SNACKS.forEach(snack => {
  if (saved[snack.id] !== undefined) {
    snack.tried = saved[snack.id];
  }
});

function saveState() {
  let data = {};
  SNACKS.forEach(snack => {
    data[snack.id] = snack.tried;
  });
  localStorage.setItem("snack-tracker", JSON.stringify(data));
}

function clearActive(groupId) {
  document.querySelectorAll(`#${groupId} button`).forEach(btn => {
    btn.classList.remove("active");
  });
}

function normalizePark(value) {
  return (value || "").trim().toLowerCase();
}

function isResortPark(value) {
  const p = normalizePark(value);
  return p.includes("resort") || p.includes("polynesian") || p.includes("port orleans") ||
         p.includes("pop century") || p.includes("riviera") || p.includes("contemporary") ||
         p.includes("grand floridian");
}

function setPark(park) {
  currentPark = park;
  clearActive("park-group");

  const btn = document.getElementById(`park-${park}`);
  if (btn) btn.classList.add("active");

  render();
}

function setTried(value) {
  currentTried = value;
  clearActive("tried-group");

  const btn = document.getElementById(`tried-${value}`);
  if (btn) btn.classList.add("active");

  render();
}

function toggleTried(id) {
  const snack = SNACKS.find(s => s.id === id);
  if (!snack) return;

  snack.tried = !snack.tried;
  saveState();
  render();
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderImage(snack) {
  if (!snack.image) return "";

  const img = String(snack.image).trim();

  // Supports either:
  // 1) image: "snack_01.png"
  // 2) image: "<img src='snack_01.png'>"
  if (img.startsWith("<img")) {
    return img;
  }

  return `<img src="${img}" alt="${escapeHtml(snack.name)}" loading="lazy">`;
}

function buildDisneyMapLink(snack) {
  const query = encodeURIComponent(`${snack.location || snack.name} ${snack.park} Walt Disney World`);
  return `https://disneyworld.disney.go.com/maps/?search=${query}`;
}

function buildGoogleMapLink(snack) {
  const query = encodeURIComponent(`${snack.location || snack.name} ${snack.park} Walt Disney World`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function render() {
  const grid = document.getElementById("snackGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const filtered = SNACKS.filter(snack => {
    const snackPark = normalizePark(snack.park);
    const wantedPark = normalizePark(currentPark);

    let parkMatch = false;

    if (wantedPark === "all") {
      parkMatch = true;
    } else if (wantedPark === "resort") {
      parkMatch = isResortPark(snack.park);
    } else {
      parkMatch = snackPark === wantedPark;
    }

    const triedMatch =
      currentTried === "all" ||
      (currentTried === true && snack.tried) ||
      (currentTried === false && !snack.tried);

    return parkMatch && triedMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p>No snacks match this filter.</p>`;
    return;
  }

  filtered.forEach(snack => {
    const disneyLink = buildDisneyMapLink(snack);
    const googleLink = buildGoogleMapLink(snack);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      ${renderImage(snack)}
      <h3>${escapeHtml(snack.name)}</h3>
      <div class="park">${escapeHtml(snack.park)}</div>
      <div class="location">${escapeHtml(snack.location || "")}</div>

      <div class="links">
        <a class="mapBtn disneyBtn" href="${disneyLink}" target="_blank" rel="noopener noreferrer">📍 Disney Map</a>
        <a class="mapBtn googleBtn" href="${googleLink}" target="_blank" rel="noopener noreferrer">🗺 Google Maps</a>
      </div>

      <label>
        <input type="checkbox" ${snack.tried ? "checked" : ""} onclick="toggleTried(${snack.id})">
        Tried
      </label>
    `;

    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const defaultPark = document.getElementById("park-all");
  const defaultTried = document.getElementById("tried-all");

  if (defaultPark) defaultPark.classList.add("active");
  if (defaultTried) defaultTried.classList.add("active");

  render();
});
