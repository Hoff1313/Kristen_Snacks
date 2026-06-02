let currentPark = "all";

function setPark(park) {
  currentPark = park;
  render();
}

function render() {
  const grid = document.getElementById("snackGrid");
  grid.innerHTML = "";

  const filtered = SNACKS.filter(s => {
    if (currentPark === "all") return true;
    if (currentPark === "Resort") return s.park.includes("Resort");
    return s.park === currentPark;
  });

  filtered.forEach(snack => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${snack.image}" />
      <h3>${snack.name}</h3>
      <div class="badge">${snack.park}</div>
      <div class="badge">${snack.location || ""}</div>
      <label>
        <input type="checkbox" />
        Tried
      </label>
    `;

    grid.appendChild(card);
  });
}

render();
