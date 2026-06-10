let currentPark = "all";
let currentTried = "all";

// load saved data
let saved = JSON.parse(localStorage.getItem("snack-tracker")) || {};

SNACKS.forEach(snack => {
  if (saved[snack.id] !== undefined) {
    snack.tried = saved[snack.id];
  }
});

function saveState() {
  let data = {};
  SNACKS.forEach(s => data[s.id] = s.tried);
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
  document.getElementById(`park-${park}`).classList.add("active");
  render();
}

function setTried(value) {
  currentTried = value;
  clearActive("tried-group");
  document.getElementById(`tried-${value}`).classList.add("active");
  render();
}

function toggleTried(id) {
  let snack = SNACKS.find(s => s.id === id);
  snack.tried = !snack.tried;
  saveState();
  render();
}

function render() {
  const grid = document.getElementById("snackGrid");
  grid.innerHTML = "";

  const filtered = SNACKS.filter(s => {

    let parkMatch =
      currentPark === "all" ||
      (currentPark === "Resort" && s.park.includes("Resort")) ||
      s.park === currentPark;

    let triedMatch =
      currentTried === "all" ||
      (currentTried === true && s.tried) ||
      (currentTried === false && !s.tried);

    return parkMatch && triedMatch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<p>No snacks match this filter.</p>";
    return;
  }

  filtered.forEach(snack => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${snack.image}">
      <h3>${snack.name}</h3>
      <div class="park">${snack.park}</div>
      <div class="location">${snack.location || ""}</div>

      <div class="links">
        ${snack.disney ? `<a class="mapBtn" href="${snack.disney}" target="_blank">📍 Disney</a>` : ""}
        ${snack.google ? `<a class="mapBtn alt" href="${snack.google}" target="_blank">🗺 Google</a>` : ""}
      </div>

      <label>
        <input type="checkbox" ${snack.tried ? "checked" : ""} onclick="toggleTried(${snack.id})">
        Tried
      </label>
    `;

    grid.appendChild(card);
  });
}

// default selections
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("park-all").classList.add("active");
  document.getElementById("tried-all").classList.add("active");
  render();
});
