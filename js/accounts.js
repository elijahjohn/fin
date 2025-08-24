import { getAccounts, saveAccounts } from './storage.js';

const listContainer = document.getElementById('accountsList');

export function renderAccounts() {
  const accounts = getAccounts();
  listContainer.innerHTML = '';
  accounts.forEach(acc => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <div style="flex-grow: 1;">
      <div style="font-weight: bold;">${acc.name} (${acc.currency}, ${acc.type})</div>
      <div style="font-size: 0.9em; color: #ccc;">Balance: ${acc.balance.toFixed(2)}</div>
    </div>
    <div style="display: flex; gap: 12px;">
      <button class="icon-btn edit" data-id="${acc.id}" title="Edit">
        <i class="fa-solid fa-pen"></i>
      </button>
      <button class="icon-btn delete" data-id="${acc.id}" title="Delete">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  </div>
`;
    listContainer.appendChild(div);
  });
}

export function deleteAccount(id) {
  let accounts = getAccounts();
  accounts = accounts.filter(acc => acc.id !== id);
  saveAccounts(accounts);
  renderAccounts();
}

export function addAccount(data) {
  const accounts = getAccounts();
  accounts.push(data);
  saveAccounts(accounts);
  renderAccounts();
}

export function updateAccount(id, updatedData) {
  const accounts = getAccounts().map(acc =>
    acc.id === id ? { ...acc, ...updatedData } : acc
  );
  saveAccounts(accounts);
  renderAccounts();
}