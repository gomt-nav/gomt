// Firebase 初始化代碼
const firebaseConfig = {
    apiKey: "AIzaSyBJhKP4APZJqUnZzACj9EiAcyuhwgr3wgE",
    authDomain: "gomt-9518e.firebaseapp.com",
    projectId: "gomt-9518e",
    storageBucket: "gomt-9518e.appspot.com",
    messagingSenderId: "169885183614",
    appId: "1:169885183614:web:f9d0c9d5ff8224f74a722f",
    measurementId: "G-DTTTWQ7BZB"
};

// 初始化 Firebase 應用程式
firebase.initializeApp(firebaseConfig);

// 初始化 Firestore
const db = firebase.firestore();

// 同步 IndexedDB 資料到 Firebase
async function syncIndexedDBToFirebase() {
    const dbRequest = indexedDB.open('gomtDB', 1);

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['routeRecords'], 'readonly');
        const store = transaction.objectStore('routeRecords');
        const getAllRecords = store.getAll();

        getAllRecords.onsuccess = function () {
            const records = getAllRecords.result;
            records.forEach(record => {
                // 將每條記錄同步至 Firebase
                syncRecordToFirebase(record);
            });
        };
    };

    dbRequest.onerror = function (event) {
        console.error("無法開啟 IndexedDB: ", event.target.errorCode);
    };
}

// 將單條記錄同步到 Firebase
async function syncRecordToFirebase(record) {
    try {
        const docRef = await db.collection("routes").add({
            routeName: record.routeName,
            date: record.date,
            duration: record.duration,
            distance: record.distance,
            mtPlace: record.mtPlace,
            gpx: record.gpx
        });
        console.log("資料已同步至 Firebase，記錄 ID:", docRef.id);
    } catch (error) {
        console.error("同步到 Firebase 時發生錯誤:", error);
    }
}

// 監聽網路狀態變化，當網路連接恢復時自動同步資料
window.addEventListener('online', syncIndexedDBToFirebase);
