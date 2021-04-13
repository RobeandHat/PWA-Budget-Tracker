let db;
const request = indexedDB.open("budget", 1);

// Create pending object store
request.onupgradeneeded = function(event) {   
  const db = event.target.result;
  db.createObjectStore("pending", { 
    autoIncrement: true });
};

// Check if app is online before reading from db //
request.onsuccess = function(event) {
  db = event.target.result;  
  if (navigator.onLine) {
    checkDatabase();
  };
};

// Error Response
request.onerror = function(event) {
  console.log("Error: " + event.target.errorCode);
};


function saveRecord(record) {
  const transaction = db.transaction("pending", "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction("pending", "readwrite");
  const store = transaction.objectStore("pending");

  // get all records from store
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        // Opens a transaction on pending db
        const transaction = db.transaction(["pending"], "readwrite");

        const store = transaction.objectStore("pending");

        // clear all items in your store
        store.clear();
      });
    }
  };
}

// Checks database when back online
window.addEventListener("online", checkDatabase);
