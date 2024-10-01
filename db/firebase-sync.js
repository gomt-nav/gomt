import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js"; 
import { firestoreDB } from '../db/firebase-config.js'; // 確保這是正確的路徑

const db = firestoreDB;

// 確保 Firestore 初始化成功
if (navigator.onLine) {
    syncIndexedDBToFirebase();
}

window.addEventListener('online', syncIndexedDBToFirebase);

async function syncIndexedDBToFirebase() {
    const dbRequest = indexedDB.open('gomtDB', 1);

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['routeRecords'], 'readonly');
        const store = transaction.objectStore('routeRecords');
        const getAllRecords = store.getAll();

        getAllRecords.onsuccess = async function() {
            const indexedDbRecords = getAllRecords.result;

            // 獲取 Firebase 中的記錄
            const firebaseRecordsSnapshot = await getDocs(collection(firestoreDB, 'routes'));
            const firebaseRecords = firebaseRecordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 刪除 Firebase 中多餘的記錄
            for (let firebaseRecord of firebaseRecords) {
                if (!indexedDbRecords.some(record => record.recordId === firebaseRecord.recordId)) {
                    await deleteDoc(doc(firestoreDB, 'routes', firebaseRecord.id));
                    console.log(`已刪除 Firebase 中的記錄: ${firebaseRecord.id}`);
                }
            }

            // 添加 IndexedDB 中不存在於 Firebase 的記錄
            for (let indexedDbRecord of indexedDbRecords) {
                const existsInFirebase = firebaseRecords.some(record => record.recordId === indexedDbRecord.recordId);
                if (!existsInFirebase) {
                    await addDoc(collection(firestoreDB, 'routes'), indexedDbRecord);
                    console.log(`已添加到 Firebase 的記錄: ${indexedDbRecord.recordId}`);
                }
            }

            console.log("資料同步完成");
        };
    };

    dbRequest.onerror = function(event) {
        console.error("無法開啟 IndexedDB", event);
    };
}

// 檢查並同步資料
if (navigator.onLine) {
    syncIndexedDBToFirebase();
}
