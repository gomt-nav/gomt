import { firestoreDB } from '../db/firebase-config.js'; // 請確認這是正確的路徑
import { collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// 開啟 IndexedDB 資料庫
const DB_NAME = 'gomtDB';
const DB_VERSION = 1;
let db;

function openDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

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

    request.onsuccess = function(event) {
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
                </div>
            `;
            routeBox.addEventListener('click', function() {
                window.location.href = `mapdetails.html?routeId=${route.recordId}`;
            });

            routeContainer.appendChild(routeBox);
        });

        // 為每個刪除按鈕加上事件監聽
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', function(event) {
                event.stopPropagation(); // 防止點擊刪除時跳轉
                const recordId = parseInt(button.getAttribute('data-id'));
                deleteRoute(recordId);
            });
        });
    };
}

// 刪除 IndexedDB 和 Firebase 中的資料
function deleteRoute(recordId) {
    // 刪除 IndexedDB 中的資料
    const transaction = db.transaction('routeRecords', 'readwrite');
    const store = transaction.objectStore('routeRecords');
    const request = store.delete(recordId);

    request.onsuccess = async function() {
        console.log(`IndexedDB 中的記錄 ${recordId} 已刪除`);
        await deleteRouteFromFirebase(recordId); // 同時刪除 Firebase 中的資料
    };

    request.onerror = function(event) {
        console.error("刪除資料時出錯", event);
    };
}

// 刪除 Firebase 中的資料
async function deleteRouteFromFirebase(recordId) {
    try {
        const q = query(collection(firestoreDB, 'routes'), where('recordId', '==', recordId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(firestoreDB, 'routes', docSnapshot.id));
        });

        console.log(`Firebase 中的記錄 ${recordId} 已刪除`);
    } catch (error) {
        console.error("刪除 Firebase 資料時出錯", error);
    }
}

// 初始化
openDatabase();
