// Tiny IndexedDB helper (no dependencies)
const DB_NAME = 'finance-tracker-db';
const DB_VERSION = 1;
const STORE = 'transactions';

function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e)=>{
      const db = e.target.result;
      if(!db.objectStoreNames.contains(STORE)){
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
      }
    };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}

async function dbPut(tx){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const t = db.transaction(STORE,'readwrite');
    t.objectStore(STORE).put(tx);
    t.oncomplete = ()=>resolve();
    t.onerror = ()=>reject(t.error);
  });
}

async function dbDelete(id){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const t = db.transaction(STORE,'readwrite');
    t.objectStore(STORE).delete(id);
    t.oncomplete = ()=>resolve();
    t.onerror = ()=>reject(t.error);
  });
}

async function dbGetAll(){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const t = db.transaction(STORE,'readonly');
    const req = t.objectStore(STORE).getAll();
    req.onsuccess = ()=>resolve(req.result || []);
    req.onerror = ()=>reject(req.error);
  });
}

async function dbClear(){
  const db = await openDB();
  return new Promise((resolve,reject)=>{
    const t = db.transaction(STORE,'readwrite');
    t.objectStore(STORE).clear();
    t.oncomplete = ()=>resolve();
    t.onerror = ()=>reject(t.error);
  });
}

window._db = { dbPut, dbDelete, dbGetAll, dbClear };
