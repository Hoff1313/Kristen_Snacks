let currentPark = "all";
let currentTried = "all";

// Load saved tried state from browser
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

function render() {
  const grid = document.getElementById("snackGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const filtered = SNACKS.filter(snack => {
    let parkMatch =
      currentPark === "all" ||
      (currentPark === "Resort" && snack.park.includes("Resort")) ||
      snack.park === currentPark;

    let triedMatch =
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
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${snack.image}" alt="${snack.name}">
      <h3>${snack.name}</h3>
      <div class="park">${snack.park}</div>
      <div class="location">${snack.location || ""}</div>

      <div class="links">
        ${snack.disney ? `<a class="mapBtn" href="${snack.disney}" target="_blank" rel="noopener noreferrer">📍 Disney</a>` : ""}
        ${snack.google ? `<a class="mapBtn alt" href="${snack.google}" target="_blank" rel="noopener noreferrer">🗺 Google</a>` : ""}
      </div>

      <label>
        <input type="checkbox" ${snack.tried ? "checked" : ""} onchange="toggleTried(${snack.id})">
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
