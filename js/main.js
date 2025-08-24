import { renderAccounts, deleteAccount, addAccount, updateAccount } from './accounts.js';

let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
  renderAccounts();

  const form = document.getElementById('accountForm');
  const nameInput = document.getElementById('name');
  const currencyInput = document.getElementById('currency');
  const typeInput = document.getElementById('type');
  const submitBtn = form.querySelector('button');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const currency = currencyInput.value;
    const type = typeInput.value;

    if (!name) return;

    if (editingId) {
      updateAccount(editingId, { name, currency, type });
      editingId = null;
      submitBtn.textContent = 'Add';
    } else {
      addAccount({
        id: Date.now().toString(),
        name,
        currency,
        type,
        balance: 0
      });
    }

    form.reset();
  });

  document.getElementById('accountsList').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.dataset.id;
    if (btn.classList.contains('delete')) {
      deleteAccount(id);
    } else if (btn.classList.contains('edit')) {
      const acc = JSON.parse(localStorage.getItem("accounts")).find(a => a.id === id);
      nameInput.value = acc.name;
      currencyInput.value = acc.currency;
      typeInput.value = acc.type;
      editingId = id;
      submitBtn.textContent = 'Save Changes';
    }
  });
});