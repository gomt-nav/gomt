import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firestoreDB } from './firebase-config.js';

// 啟用 Firebase Firestore 離線持久化
enableIndexedDbPersistence(firestoreDB)
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.error("無法啟用持久化：多個分頁開啟。");
        } else if (err.code == 'unimplemented') {
            console.error("目前的瀏覽器不支援持久化。");
        }
    });

// 同步會員和路線資料到 Firebase
async function syncIndexedDBToFirebase() {
    const dbRequest = indexedDB.open('gomtDB', 2);

    dbRequest.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('routeRecords')) {
            db.createObjectStore('routeRecords', { keyPath: 'recordId', autoIncrement: true });
            console.log("routeRecords object store 已創建");
        }
        if (!db.objectStoreNames.contains('users')) {
            db.createObjectStore('users', { keyPath: 'userId', autoIncrement: false });
            console.log("users object store 已創建");
        }
    };

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;

        // 確認 ObjectStore 是否存在
        if (!db.objectStoreNames.contains('routeRecords') || !db.objectStoreNames.contains('users')) {
            console.error("routeRecords 或 users object store 不存在。");
            return;
        }

        // 同步 routeRecords
        syncRoutes(db);

        // 同步 users
        syncUsers(db);
    };

    dbRequest.onerror = function (event) {
        console.error("無法開啟 IndexedDB", event);
    };
}

// 同步路線資料
async function syncRoutes(db) {
    const transaction = db.transaction(['routeRecords'], 'readonly');
    const store = transaction.objectStore('routeRecords');
    const getAllRecords = store.getAll();

    getAllRecords.onsuccess = async function () {
        const indexedDbRecords = getAllRecords.result;

        try {
            const firebaseRecordsSnapshot = await getDocs(collection(firestoreDB, 'routes'));
            const firebaseRecords = firebaseRecordsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            // 刪除多餘資料
            for (let firebaseRecord of firebaseRecords) {
                if (!indexedDbRecords.some(record => record.recordId === firebaseRecord.recordId)) {
                    await deleteDoc(doc(firestoreDB, 'routes', firebaseRecord.id));
                    console.log(`成功刪除 Firebase 路線記錄: ${firebaseRecord.recordId}`);
                }
            }

            // 添加缺失資料
            for (let indexedDbRecord of indexedDbRecords) {
                const existsInFirebase = firebaseRecords.some(record => record.recordId === indexedDbRecord.recordId);
                if (!existsInFirebase) {
                    await addDoc(collection(firestoreDB, 'routes'), indexedDbRecord);
                    console.log(`成功新增 Firebase 路線記錄: ${indexedDbRecord.recordId}`);
                }
            }
            console.log("路線資料同步成功！");
        } catch (error) {
            console.error("同步路線資料時發生錯誤: ", error);
        }
    };

    getAllRecords.onerror = function () {
        console.error("無法從 IndexedDB 讀取路線資料。");
    };
}

// 同步會員資料
async function syncUsers(db) {
    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const getAllUsers = store.getAll();

    getAllUsers.onsuccess = async function () {
        const indexedDbUsers = getAllUsers.result;

        try {
            const firebaseUsersSnapshot = await getDocs(collection(firestoreDB, 'users'));
            const firebaseUsers = firebaseUsersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

            // 刪除多餘資料
            for (let firebaseUser of firebaseUsers) {
                if (!indexedDbUsers.some(user => user.userId === firebaseUser.userId)) {
                    await deleteDoc(doc(firestoreDB, 'users', firebaseUser.id));
                    console.log(`成功刪除 Firebase 會員資料: ${firebaseUser.userId}`);
                }
            }

            // 添加缺失資料
            for (let indexedDbUser of indexedDbUsers) {
                const existsInFirebase = firebaseUsers.some(user => user.userId === indexedDbUser.userId);
                if (!existsInFirebase) {
                    await addDoc(collection(firestoreDB, 'users'), indexedDbUser);
                    console.log(`成功新增 Firebase 會員資料: ${indexedDbUser.userId}`);
                }
            }
            console.log("會員資料同步成功！");
        } catch (error) {
            console.error("同步會員資料時發生錯誤: ", error);
        }
    };

    getAllUsers.onerror = function () {
        console.error("無法從 IndexedDB 讀取會員資料。");
    };
}

// 監聽網路狀態變更事件
window.addEventListener('online', syncIndexedDBToFirebase);

// 初次同步資料
syncIndexedDBToFirebase();
