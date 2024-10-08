// 引入 Firebase Firestore 所需的庫
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firestoreDB } from '../db/firebase-config.js';// 從 firebase-config 導入 firestoreDB

// 開啟 IndexedDB 資料庫
const DB_NAME = 'gomtDB';
const DB_VERSION = 2;
let db;

function openDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function(event) {
        db = event.target.result;

        // 確保 routeRecords object store 存在
        if (!db.objectStoreNames.contains('routeRecords')) {
            db.createObjectStore('routeRecords', { keyPath: 'recordId', autoIncrement: true });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        loadRoutesFromDB(); // 開啟資料庫後加載資料
    };

    request.onerror = function(event) {
        console.error("無法開啟資料庫", event);
    };
}

// 加載資料並顯示
function loadRoutesFromDB() {
    const transaction = db.transaction('routeRecords', 'readonly');
    const store = transaction.objectStore('routeRecords');
    const request = store.getAll();

    request.onsuccess = function (event) {
        const routes = event.target.result;
        const routeContainer = document.getElementById('routeContainer');
        routeContainer.innerHTML = ''; // 清空舊資料

        routes.forEach(route => {
            const routeBox = document.createElement('div');
            routeBox.className = 'route-box';
            routeBox.innerHTML = `
                <div class="route-info">
                    <h2>${route.routeName}</h2>
                    <p>日期: ${route.date}</p>
                    <p>地點: ${route.mtPlace}</p>
                    <button class="delete-button" data-id="${route.recordId}">刪除</button>
                    <button class="download-button" data-id="${route.recordId}">下載</button>
                </div>
            `;
            // 點擊進入 map.html 並傳遞 routeId 作為 URL 參數
            routeBox.addEventListener('click', function () {
                window.location.href = `mapdetails.html?routeId=${route.recordId}`;
            });

            routeContainer.appendChild(routeBox);
        });

        // 為每個刪除按鈕加上事件監聽
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function (event) {
                event.stopPropagation(); // 防止點擊刪除時跳轉
                const recordId = parseInt(button.getAttribute('data-id'));
                deleteRoute(recordId);
            });
        });

        // 為每個下載按鈕加上事件監聽
        document.querySelectorAll('.download-button').forEach(button => {
            button.addEventListener('click', function (event) {
                event.stopPropagation(); // 防止點擊下載時跳轉
                const recordId = parseInt(button.getAttribute('data-id'));
                downloadRouteFromFirebase(recordId);
            });
        });
    };
}


// 刪除 IndexedDB 和 Firebase 中的資料
function deleteRoute(recordId) {
    const transaction = db.transaction('routeRecords', 'readwrite');
    const store = transaction.objectStore('routeRecords');
    const request = store.delete(recordId);

    request.onsuccess = async function() {
        console.log(`IndexedDB 中的記錄 ${recordId} 已刪除`);
        await deleteRouteFromFirebase(recordId); // 同時刪除 Firebase 中的資料

        // 刪除成功後刷新頁面
        location.reload();
    };

    request.onerror = function(event) {
        console.error("刪除資料時出錯", event);
    };
}

// 從 Firebase 刪除資料
async function deleteRouteFromFirebase(recordId) {
    try {
        const q = query(collection(firestoreDB, 'routes'), where('recordId', '==', recordId));
        const snapshot = await getDocs(q);

        snapshot.forEach(doc => {
            deleteDoc(doc.ref);
        });

        console.log(`Firebase 中的記錄 ${recordId} 已刪除`);
    } catch (error) {
        console.error("刪除 Firebase 資料時出錯", error);
    }
}

// 從 Firebase 下載資料到 IndexedDB
async function downloadRouteFromFirebase(recordId) {
    try {
        const q = query(collection(firestoreDB, 'routes'), where('recordId', '==', recordId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const firebaseRecord = snapshot.docs[0].data();

            // 檢查本地是否已有相同的資料
            const transaction = db.transaction('routeRecords', 'readonly');
            const store = transaction.objectStore('routeRecords');
            const request = store.get(recordId);

            request.onsuccess = function(event) {
                const localRecord = event.target.result;
                if (localRecord) {
                    alert('本地已有相同資料，無需下載');
                } else {
                    // 本地無相同資料，進行下載
                    addRecordToIndexedDB(firebaseRecord);
                    alert('已成功下載');
                }
            };
        } else {
            console.error(`Firebase 中找不到記錄 ${recordId}`);
        }
    } catch (error) {
        console.error('從 Firebase 下載資料時發生錯誤', error);
    }
}

// 將資料加入 IndexedDB
function addRecordToIndexedDB(record) {
    const transaction = db.transaction('routeRecords', 'readwrite');
    const store = transaction.objectStore('routeRecords');
    const request = store.add(record);

    request.onsuccess = function() {
        console.log(`資料已成功下載到 IndexedDB`);
        alert('資料已成功下載到本地');
    };

    request.onerror = function(event) {
        console.error('資料下載到 IndexedDB 時出錯', event);
    };
}

// 初始化
openDatabase();
