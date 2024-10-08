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

            // 檢查是否有符合 username 或 email 的資料
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
                        // 使用者登入成功，儲存登入狀態並跳轉至個人資料頁面
                        localStorage.setItem("loggedInUser", JSON.stringify(userData)); // 保存登入的使用者資料到 localStorage
                        window.location.href = "profile.html"; // 跳轉到個人資料頁面
                    } else {
                        // 如果未找到，繼續查找下一個游標
                        cursor.continue();
                    }
                } else {
                    // 游標結束，未找到匹配資料
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
});
