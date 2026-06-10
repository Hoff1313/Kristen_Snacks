
let currentPark = "all";
let currentTried = "all";

// Load saved state
let saved = JSON.parse(localStorage.getItem("snack-tracker")) || {};
SNACKS.forEach(s => {
  if (saved[s.id] !== undefined) {
    s.tried = saved[s.id];
  }
});

function saveState() {
  let data = {};
  SNACKS.forEach(s => {
    data[s.id] = s.tried;
  });
  localStorage.setItem("snack-tracker", JSON.stringify(data));
}

function clearActive(prefix) {
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(btn => {
    btn.classList.remove("active");
  });
}

function setPark(park) {
  currentPark = park;

  clearActive("park-");
  document.getElementById(`park-${park}`).classList.add("active");

  render();
}

function setTried(value) {
  currentTried = value;

  clearActive("tried-");
  document.getElementById(`tried-${value}`).classList.add("active");

  render();
}

function toggleTried(id) {
  const snack = SNACKS.find(s => s.id === id);
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

  filtered.forEach(snack => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${snack.image}">
      <h3>${snack.name}</h3>
      <div class="park">${snack.park}</div>
      <div class="location">${snack.location || ""}</div>
      <label>
        <input type="checkbox" ${snack.tried ? "checked" : ""} onchange="toggleTried(${snack.id})">
        Tried
      </label>
    `;

    grid.appendChild(card);
  });
}

// ✅ Set default highlighted buttons
document.getElementById("park-all").classList.add("active");
document.getElementById("tried-all").classList.add("active");

render();
