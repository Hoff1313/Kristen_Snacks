const STORAGE_KEY = 'disney-snack-tracker-v1';
const grid = document.getElementById('snackGrid');
const template = document.getElementById('snackCardTemplate');
const searchInput = document.getElementById('searchInput');
const parkFilter = document.getElementById('parkFilter');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');
const countAll = document.getElementById('countAll');
const countTried = document.getElementById('countTried');
const clearChecks = document.getElementById('clearChecks');

const parkOrder = ['Magic Kingdom', 'EPCOT', 'Hollywood Studios', 'Animal Kingdom', 'Disney Springs', 'Resort / Hotel', 'BoardWalk', 'Unclear / Review'];

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = {
  checks: loadState(),
  search: '',
  park: 'all',
  status: 'all',
  sort: 'park',
};

window.SNACKS.forEach(item => {
  if (typeof state.checks[item.id] === 'boolean') {
    item.tried = state.checks[item.id];
  }
});

function populateParkFilter() {
  const parks = [...new Set(window.SNACKS.map(item => item.park))].sort((a, b) => {
    const ia = parkOrder.indexOf(a);
    const ib = parkOrder.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.localeCompare(b);
  });
  parks.forEach(park => {
    const option = document.createElement('option');
    option.value = park;
    option.textContent = park;
    parkFilter.appendChild(option);
  });
}

function getVisibleSnacks() {
  let items = [...window.SNACKS];

  if (state.search) {
    const q = state.search.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.fullNote.toLowerCase().includes(q) ||
      (item.location || '').toLowerCase().includes(q) ||
      item.park.toLowerCase().includes(q)
    );
  }

  if (state.park !== 'all') items = items.filter(item => item.park === state.park);
  if (state.status === 'tried') items = items.filter(item => item.tried);
  if (state.status === 'untried') items = items.filter(item => !item.tried);

  items.sort((a, b) => {
    if (state.sort === 'name') return a.name.localeCompare(b.name);
    if (state.sort === 'tried') return Number(b.tried) - Number(a.tried) || a.name.localeCompare(b.name);
    if (state.sort === 'untried') return Number(a.tried) - Number(b.tried) || a.name.localeCompare(b.name);
    const pa = parkOrder.indexOf(a.park);
    const pb = parkOrder.indexOf(b.park);
    return (pa === -1 ? 999 : pa) - (pb === -1 ? 999 : pb) || a.name.localeCompare(b.name);
  });

  return items;
}

function render() {
  const items = getVisibleSnacks();
  grid.innerHTML = '';

  countAll.textContent = `${window.SNACKS.length} snacks`;
  const triedCount = window.SNACKS.filter(item => item.tried).length;
  countTried.textContent = `${triedCount} tried`;

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'emptyState';
    empty.textContent = 'No snacks match your current filters. Try another park, search term, or status.';
    grid.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const node = template.content.firstElementChild.cloneNode(true);
    const img = node.querySelector('.card__image');
    const pill = node.querySelector('.pill');
    const title = node.querySelector('.card__title');
    const location = node.querySelector('.card__location');
    const note = node.querySelector('.card__note');
    const checkbox = node.querySelector('.triedCheckbox');

    img.src = item.image;
    img.alt = item.name;
    pill.textContent = item.park;
    title.textContent = item.name;
    location.textContent = item.location
      ? `${item.location}${item.locationInferred ? ' · park inferred from location name' : ''}`
      : 'Location to be confirmed';
    note.textContent = item.fullNote;
    checkbox.checked = item.tried;

    if (item.tried) node.classList.add('card--tried');

    checkbox.addEventListener('change', (event) => {
      item.tried = event.target.checked;
      state.checks[item.id] = item.tried;
      saveState(state.checks);
      render();
    });

    grid.appendChild(node);
  });
}

searchInput.addEventListener('input', e => {
  state.search = e.target.value.trim();
  render();
});
parkFilter.addEventListener('change', e => {
  state.park = e.target.value;
  render();
});
statusFilter.addEventListener('change', e => {
  state.status = e.target.value;
  render();
});
sortBy.addEventListener('change', e => {
  state.sort = e.target.value;
  render();
});
clearChecks.addEventListener('click', () => {
  Object.keys(state.checks).forEach(key => delete state.checks[key]);
  window.SNACKS.forEach(item => item.tried = false);
  saveState(state.checks);
  render();
});

populateParkFilter();
render();

function setPark(park) {
  state.park = park;
  document.getElementById("parkFilter").value = park === "all" ? "all" : park;
  render();
}
