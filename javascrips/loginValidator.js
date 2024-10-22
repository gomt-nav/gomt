import { openDatabase } from '../db/gomtdb.js';

// 確保資料庫已初始化
openDatabase().then(() => {
    checkLoginStatus((isLoggedIn, user) => {
        if (isLoggedIn) {
            console.log("使用者已登入：", user);
        } else {
            console.log("未登入");
        }
    });
}).catch((error) => {
    console.error("資料庫初始化失敗", error);
});

export function checkLoginStatus(callback) {
    const dbRequest = indexedDB.open('gomtDB', 3);

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('sessions')) {
            console.error("'sessions' 物件存儲不存在");
            callback(false, null);
            return;
        }

        const transaction = db.transaction(["sessions"], "readonly");
        const store = transaction.objectStore("sessions");
        const getUserRequest = store.get('currentUser');

        getUserRequest.onsuccess = function (event) {
            const user = event.target.result;
            if (user) {
                callback(true, user);
            } else {
                callback(false, null);
            }
        };

        getUserRequest.onerror = function () {
            console.error("無法檢查登入狀態");
            callback(false, null);
        };
    };

    dbRequest.onerror = function (event) {
        console.error("無法打開 IndexedDB 資料庫: ", event.target.errorCode);
        callback(false, null);
    };
}
