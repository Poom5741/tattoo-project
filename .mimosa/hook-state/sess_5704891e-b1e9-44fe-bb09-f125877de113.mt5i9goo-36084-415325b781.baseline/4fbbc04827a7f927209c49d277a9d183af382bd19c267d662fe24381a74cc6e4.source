/**
 * Passkey storage — IndexedDB wallet persistence.
 *
 * Stores the encrypted wallet blob in IndexedDB under a fixed key.
 * IndexedDB is available in modern browsers but not in happy-dom —
 * these functions are manual-test only in vitest.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */

const DB_NAME = "saknid-passkey";
const DB_VERSION = 1;
const STORE_NAME = "wallets";
const RECORD_KEY = "current-wallet";

function openDb(): Promise<IDBDatabase> {
  const { promise, resolve, reject } = Promise.withResolvers<IDBDatabase>();
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    request.result.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
  return promise;
}

/** Save encrypted wallet data to IndexedDB. */
export async function saveWallet(data: string): Promise<void> {
  const db = await openDb();
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(data, RECORD_KEY);
  tx.oncomplete = () => { resolve(); db.close(); };
  tx.onerror = () => { reject(tx.error); db.close(); };
  return promise;
}

/** Load encrypted wallet data from IndexedDB. Returns null if none stored. */
export async function loadWallet(): Promise<string | null> {
  const db = await openDb();
  const { promise, resolve, reject } = Promise.withResolvers<string | null>();
  const tx = db.transaction(STORE_NAME, "readonly");
  const request = tx.objectStore(STORE_NAME).get(RECORD_KEY);
  request.onsuccess = () => {
    resolve(request.result ?? null);
    db.close();
  };
  request.onerror = () => { reject(request.error); db.close(); };
  return promise;
}

/** Delete encrypted wallet data from IndexedDB. */
export async function deleteWallet(): Promise<void> {
  const db = await openDb();
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(RECORD_KEY);
  tx.oncomplete = () => { resolve(); db.close(); };
  tx.onerror = () => { reject(tx.error); db.close(); };
  return promise;
}
