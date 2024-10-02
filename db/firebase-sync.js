// 引入 Firebase Firestore 所需的庫
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// 引入 Firebase 的 Firestore 實例
import { firestoreDB } from './firebase-config.js';

// 每次執行操作時進行同步
async function syncIndexedDBToFirebase() {
    const dbRequest = indexedDB.open('gomtDB', 2); // 確保資料庫版本提升至 2 以觸發升級

    dbRequest.onupgradeneeded = function (event) {
        const db = event.target.result;

        // 如果 'routeRecords' 尚未存在，則創建
        if (!db.objectStoreNames.contains('routeRecords')) {
            db.createObjectStore('routeRecords', { keyPath: 'recordId', autoIncrement: true });
            console.log("routeRecords object store 已創建");
        }
    };

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;

        // 確保 routeRecords 存在於資料庫中
        if (!db.objectStoreNames.contains('routeRecords')) {
            console.error("routeRecords object store 不存在。請檢查資料庫升級邏輯。");
            return;
        }

        const transaction = db.transaction(['routeRecords'], 'readonly');
        const store = transaction.objectStore('routeRecords');
        const getAllRecords = store.getAll();

        getAllRecords.onsuccess = async function () {
            const indexedDbRecords = getAllRecords.result;
            console.log("從 IndexedDB 中獲取的記錄: ", indexedDbRecords);

            try {
                // 獲取 Firebase 中的記錄
                const firebaseRecordsSnapshot = await getDocs(collection(firestoreDB, 'routes'));
                const firebaseRecords = firebaseRecordsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                console.log("從 Firebase 中獲取的記錄: ", firebaseRecords);

                // 刪除 Firebase 中多餘的記錄
                for (let firebaseRecord of firebaseRecords) {
                    if (!indexedDbRecords.some(record => record.recordId === firebaseRecord.recordId)) {
                        console.log("刪除 Firebase 中的記錄: ", firebaseRecord);
                        await deleteDoc(doc(firestoreDB, 'routes', firebaseRecord.id));
                    }
                }

                // 添加 IndexedDB 中不存在於 Firebase 的記錄
                for (let indexedDbRecord of indexedDbRecords) {
                    const existsInFirebase = firebaseRecords.some(record => record.recordId === indexedDbRecord.recordId);
                    if (!existsInFirebase) {
                        console.log("添加到 Firebase 的記錄: ", indexedDbRecord);
                        await addDoc(collection(firestoreDB, 'routes'), indexedDbRecord);
                    }
                }

                console.log("資料同步完成");
            } catch (error) {
                console.error("同步過程中發生錯誤: ", error);
            }
        };
    };

    dbRequest.onerror = function (event) {
        console.error("無法開啟 IndexedDB", event);
    };
}

// 監聽網路狀態變更事件，當從離線變為在線時進行同步
window.addEventListener('online', syncIndexedDBToFirebase);

// 不論何時都進行同步
syncIndexedDBToFirebase();
