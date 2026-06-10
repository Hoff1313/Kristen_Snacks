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

function buildGoogleMapLink(snack) {
  const query = encodeURIComponent(
    `${snack.location || snack.name} ${snack.park} Walt Disney World`
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function render() {
  const grid = document.getElementById("snackGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const filtered = SNACKS.filter(snack => {
    let parkMatch =
      currentPark === "all" ||
      (currentPark === "Resort" && isResortPark(snack.park)) ||
      normalizePark(snack.park) === normalizePark(currentPark);

    let triedMatch =
      currentTried === "all" ||
      (currentTried === true && snack.tried) ||
      (currentTried === false && !snack.tried);

    return parkMatch && triedMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<p>No snacks match this filter.</p>";
    return;
  }

  filtered.forEach(snack => {
    const mapLink = buildGoogleMapLink(snack);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${snack.image}">
      <h3>${snack.name}</h3>
      <div class="park">${snack.park}</div>
      <div class="location">${snack.location || ""}</div>

      <div class="links">
        <a href="${mapLink}" target="_blank" class="mapBtn googleBtn">🗺 Open in Maps</a>
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
  document.getElementById("park-all")?.classList.add("active");
  document.getElementById("tried-all")?.classList.add("active");
  render();
});
