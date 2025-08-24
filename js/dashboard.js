// dashboard.js
import { getAccounts } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  const accountsContainer = document.getElementById('accountsContainer');

  const accounts = getAccounts();

  const currencies = [...new Set(accounts.map(acc => acc.currency))];

  currencies.forEach(currency => {
    const currencySection = document.createElement('div');
    currencySection.className = 'currency-section';

    const currencyHeader = document.createElement('h2');
    currencyHeader.textContent = currency;
    currencySection.appendChild(currencyHeader);

    ['debit', 'credit'].forEach(type => {
      const filteredAccounts = accounts.filter(acc => acc.currency === currency && acc.type === type);
      if (filteredAccounts.length > 0) {
        const group = document.createElement('div');
        group.className = 'account-group';

        const typeHeader = document.createElement('h3');
        typeHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        group.appendChild(typeHeader);

        const cardContainer = document.createElement('div');
        cardContainer.className = 'account-cards';

        filteredAccounts.forEach(acc => {
          const card = document.createElement('div');
          card.className = 'account-card';

          const icon = document.createElement('div');
          icon.className = 'icon';
          icon.textContent = acc.type === 'debit' ? '💵' : '💳';
          card.appendChild(icon);

          const name = document.createElement('div');
          name.className = 'name';
          name.textContent = acc.name;
          card.appendChild(name);

          const details = document.createElement('div');
          details.className = 'details';
          details.textContent = `${acc.currency} • ${acc.type.charAt(0).toUpperCase() + acc.type.slice(1)}`;
          card.appendChild(details);

          const balance = document.createElement('div');
          balance.className = 'balance';
          balance.textContent = `Balance: ${acc.currency === 'THB' ? '฿' : '₱'} ${acc.balance.toFixed(2)}`;
          card.appendChild(balance);

          cardContainer.appendChild(card);
        });

        group.appendChild(cardContainer);
        currencySection.appendChild(group);
      }
    });

    accountsContainer.appendChild(currencySection);
  });
});