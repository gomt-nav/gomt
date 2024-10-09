document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-form");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // 阻止表單自動提交

        const usernameOrEmail = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // 打開 IndexedDB
        const dbRequest = indexedDB.open("gomtDB", 2);

        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["users"], "readonly");
            const store = transaction.objectStore("users");

            let matchFound = false;

            // 使用游標查找符合 username 或 email 的資料
            const cursorRequest = store.openCursor();

            cursorRequest.onsuccess = function (event) {
                const cursor = event.target.result;

                if (cursor) {
                    const userData = cursor.value;

                    // 比對 username 或 email 且密碼正確
                    if ((userData.username === usernameOrEmail || userData.email === usernameOrEmail) && userData.password === password) {
                        matchFound = true;

                        // 使用者登入成功，儲存登入狀態到 IndexedDB 的 sessions
                        saveSession(userData);

                        // 跳轉到個人資料頁面
                        window.location.href = "profile.html";
                    } else {
                        cursor.continue(); // 繼續查找下一個游標
                    }
                } else {
                    if (!matchFound) {
                        alert("帳號或密碼錯誤，請重新嘗試！");
                    }
                }
            };

            cursorRequest.onerror = function (event) {
                console.error("查找過程中出現錯誤: ", event.target.error);
                alert("登入過程中出現問題，請稍後再試！");
            };
        };

        dbRequest.onerror = function (event) {
            console.error("無法開啟 IndexedDB: ", event.target.errorCode);
            alert("資料庫無法開啟，請稍後再試！");
        };
    });

    // 儲存當前使用者登入狀態到 sessions
    function saveSession(userData) {
        const dbRequest = indexedDB.open('gomtDB', 2);

        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["sessions"], "readwrite");
            const sessionStore = transaction.objectStore("sessions");

            const sessionData = {
                sessionId: "currentUser", // 固定使用 currentUser 來表示當前登入的用戶
                userId: userData.userId,  // 儲存用戶的 userId
                username: userData.username, // 使用者名稱
                email: userData.email, // 使用者的電子郵件
                loginDate: new Date().toISOString() // 登入時間
            };

            const request = sessionStore.put(sessionData);

            request.onsuccess = function () {
                console.log("登入狀態已儲存到 sessions");
            };

            request.onerror = function (event) {
                console.error("儲存登入狀態失敗: ", event.target.error);
            };
        };

        dbRequest.onerror = function (event) {
            console.error("無法打開資料庫: ", event.target.errorCode);
        };
    }
});
