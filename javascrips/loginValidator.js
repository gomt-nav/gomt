// loginValidator.js

export function checkLoginStatus(callback) {
    const dbRequest = indexedDB.open('gomtDB', 2);

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        const getUserRequest = store.get('currentUser');

        getUserRequest.onsuccess = function (event) {
            const user = event.target.result;
            if (user) {
                // 登入成功，調用回調函數
                callback(true, user);
            } else {
                // 沒有登入，調用回調函數
                callback(false, null);
            }
        };

        getUserRequest.onerror = function () {
            console.error("無法檢查登入狀態");
            callback(false, null);
        };
    };

    dbRequest.onerror = function (event) {
        console.error("無法加載用戶資料: ", event.target.errorCode);
        callback(false, null);
    };
}
