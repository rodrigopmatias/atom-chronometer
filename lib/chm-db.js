class DBStore {
  open() {
    return new Promise(
      (resolve, reject) => {
        const req = indexedDB.open('chm-data-store-v1', 1);

        req.onupgradeneeded = (event) => {
          const db = event.target.result;
          const configsStore = db.createObjectStore('configs', { keyPath: 'slug' });

          db.createObjectStore('accounts');
          configsStore.transaction.oncomplete = () => {
            const store = db.transaction('configs', 'readwrite').objectStore('configs');

            store.add({ slug: 'time-reg' });
          };
        };

        req.onerror = e => reject(e);
        req.onsuccess = e => resolve(e.target.result);
      }
    );
  }

  model(model) {
    return new Promise(
      (resolve, reject) => {
        this.open()
          .then(
            db => resolve(db.transaction(model, 'readwrite').objectStore(model)),
            e => reject(e)
          );
      }
    );
  }

  // add(model, data) {
  //
  // }

  get(model, key) {
    return new Promise(
      (resolve, reject) => {
        this.model(model)
          .then(
            (store) => {
              const req = store.get(key);

              req.onsuccess = e => resolve([e.target.result, store]);
              req.onerror = e => reject(e);
            }
          );
      }
    );
  }

  filter(model, filter) {
    return new Promise(
      (resolve, reject) => {
        this.model(model)
          .then(
            (store) => {
              const req = store.openCursor();
              const data = [];

              req.onerror = e => reject(e);
              req.onsuccess = (e) => {
                const cursor = e.target.result;

                if (cursor) {
                  if ((filter || (() => true))(cursor.value)) {
                    data.push(cursor.value);
                  }
                  cursor.continue();
                } else {
                  resolve([data, store]);
                }
              };
            },
            e => reject(e)
          );
      }
    );
  }

  all(model) {
    return this.filter(model);
  }

  updateByKey(model, key, data) {
    return new Promise(
      (resolve, reject) => {
        this.get(model, key)
          .then(
            ([row, store]) => {
              Object.keys(data).forEach(
                (attr) => {
                  row[attr] = data[attr];
                }
              );

              const req = store.put(row);

              req.onsuccess = () => resolve({ ok: true, data: row });
              req.onerror = e => reject(e);
            },
            err => reject(err)
          );
      }
    );
  }

  // update(model, filter, data) {
  //
  // }
  //
  // remove(model, filter) {
  //
  // }
  //
  // restoreOrCreate(models, fitler) {
  //
  // }
}

const dbStore = new DBStore();

export default dbStore;
