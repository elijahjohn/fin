// App logic
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});
installBtn?.addEventListener('click', async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = 'none';
});

// Register service worker for offline
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').catch(console.error);
  });
}

const el = (id)=>document.getElementById(id);
const txForm = el('txForm');
const txList = el('txList');
const emptyState = el('emptyState');
const incomeSum = el('incomeSum');
const expenseSum = el('expenseSum');
const netSum = el('netSum');
const monthFilter = el('monthFilter');
const clearFilter = el('clearFilter');
const exportBtn = el('exportBtn');
const importFile = el('importFile');

txForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const tx = {
    date: el('date').value || new Date().toISOString().slice(0,10),
    type: el('type').value,
    category: el('category').value.trim(),
    amount: Number(el('amount').value || 0),
    notes: el('notes').value.trim(),
    createdAt: Date.now()
  };
  if(!tx.category || !tx.amount){ return; }
  await _db.dbPut(tx);
  txForm.reset();
  render();
});

clearFilter.addEventListener('click', ()=>{
  monthFilter.value = '';
  render();
});

monthFilter.addEventListener('change', render);

exportBtn.addEventListener('click', async ()=>{
  const data = await _db.dbGetAll();
  const blob = new Blob([JSON.stringify({ version:1, data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'finance-export.json';
  a.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener('change', async (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const text = await file.text();
  try{
    const payload = JSON.parse(text);
    if(!payload || !Array.isArray(payload.data)) throw new Error('Bad file');
    // Clear then import
    await _db.dbClear();
    for(const tx of payload.data){
      const {id, ...rest} = tx;
      await _db.dbPut(rest);
    }
    render();
  }catch(err){
    alert('Import failed: ' + err.message);
  }finally{
    importFile.value = '';
  }
});

function formatTHB(n){
  try{
    return new Intl.NumberFormat('th-TH', { style:'currency', currency:'THB', maximumFractionDigits: 2 }).format(n);
  }catch{
    return 'THB ' + (n||0).toFixed(2);
  }
}

function monthOf(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  return d.toISOString().slice(0,7); // YYYY-MM
}

async function render(){
  const all = await _db.dbGetAll();
  const month = monthFilter.value || null;
  const list = month ? all.filter(t => monthOf(t.date) === month) : all.slice().sort((a,b)=>b.createdAt-a.createdAt);

  // Sums
  const income = list.filter(t=>t.type==='income').reduce((s,t)=>s + t.amount, 0);
  const expense = list.filter(t=>t.type==='expense').reduce((s,t)=>s + t.amount, 0);
  incomeSum.textContent = formatTHB(income);
  expenseSum.textContent = formatTHB(expense);
  netSum.textContent = formatTHB(income - expense);

  // List
  txList.innerHTML = '';
  if(list.length === 0){
    emptyState.style.display = 'block';
  }else{
    emptyState.style.display = 'none';
  }

  list.sort((a,b)=> new Date(b.date) - new Date(a.date));
  for(const tx of list){
    const li = document.createElement('li');
    li.className = 'tx-item';

    const left = document.createElement('div');
    left.className = 'tx-main';
    const title = document.createElement('div');
    title.className = 'tx-title';
    title.textContent = tx.category || '(no category)';
    const sub = document.createElement('div');
    sub.className = 'tx-sub';
    sub.textContent = `${tx.date} • ${tx.notes||''}`.trim();
    left.appendChild(title);
    left.appendChild(sub);

    const right = document.createElement('div');
    const amount = document.createElement('div');
    amount.className = 'amount ' + (tx.type==='income'?'income':'expense');
    amount.textContent = (tx.type==='income' ? '+' : '−') + formatTHB(Math.abs(tx.amount));
    const menu = document.createElement('div');
    const del = document.createElement('button');
    del.className = 'btn small ghost';
    del.textContent = 'Delete';
    del.addEventListener('click', async ()=>{
      if(confirm('Delete this transaction?')){
        await _db.dbDelete(tx.id);
        render();
      }
    });
    right.style.display = 'flex';
    right.style.flexDirection = 'column';
    right.style.alignItems = 'flex-end';
    right.style.gap = '6px';
    right.appendChild(amount);
    right.appendChild(del);

    li.appendChild(left);
    li.appendChild(right);
    txList.appendChild(li);
  }
}

// Default month = current
(function init(){
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,'0');
  el('date').value = `${yyyy}-${mm}-${String(now.getDate()).padStart(2,'0')}`;
  monthFilter.value = `${yyyy}-${mm}`;
  render();
})();
