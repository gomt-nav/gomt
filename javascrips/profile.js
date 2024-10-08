document.addEventListener("DOMContentLoaded", function() {
    // 確保所有 DOM 元素都已加載後，綁定事件監聽器
    const logoutButton = document.getElementById("logoutButton");
    const navToMapButton = document.getElementById("navToMapButton");
    const accountSettingsButton = document.getElementById("accountSettingsButton");
    const contactUsButton = document.getElementById("contactUsButton");
    const myRoutesLink = document.getElementById("myRoutesLink");
    const downloadedRoutesLink = document.getElementById("downloadedRoutesLink");

    // 確保使用者的名稱從資料庫中正確加載
    const usernameDisplay = document.getElementById("usernameDisplay");

    // 從 IndexedDB 或 Firebase 中獲取用戶資料並顯示
    function loadUserProfile() {
        const dbRequest = indexedDB.open('gomtDB', 2);

        dbRequest.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(["users"], "readonly");
            const store = transaction.objectStore("users");

            // 嘗試使用 'username' 或 'email' 來檢索資料
            const getUserRequest = store.get("currentUser"); // 假設 'currentUser' 是儲存的登入用戶

            getUserRequest.onsuccess = function(event) {
                const user = event.target.result;
                if (user) {
                    // 顯示使用者名稱
                    usernameDisplay.textContent = user.username;
                } else {
                    console.error("未找到用戶資料");
                    alert("無法加載用戶資料，請嘗試重新登入");
                }
            };

            getUserRequest.onerror = function() {
                console.error("無法加載用戶資料");
                alert("讀取用戶資料失敗");
            };
        };

        dbRequest.onerror = function(event) {
            console.error("無法打開 IndexedDB 資料庫: ", event.target.errorCode);
        };
    }

    // 觸發用戶資料加載
    loadUserProfile();

    // 綁定登出按鈕的事件監聽器
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            console.log("登出按鈕被點擊");
            // 清除用戶的本地身份驗證狀態
            localStorage.removeItem("currentUser");
            // 重定向到登錄頁面
            window.location.href = "login.html";
        });
    }

    // 綁定導航至地圖頁面的按鈕事件監聽器
    if (navToMapButton) {
        navToMapButton.addEventListener("click", function() {
            console.log("山林導航按鈕被點擊");
            window.location.href = "map.html";
        });
    }

    // 綁定帳號設定按鈕的事件監聽器
    if (accountSettingsButton) {
        accountSettingsButton.addEventListener("click", function() {
            console.log("帳號設定按鈕被點擊");
            window.location.href = "account-settings.html";
        });
    }

    // 綁定聯絡我們按鈕的事件監聽器
    if (contactUsButton) {
        contactUsButton.addEventListener("click", function() {
            console.log("聯絡我們按鈕被點擊");
            window.location.href = "contact.html";
        });
    }

    // 綁定我的路線連結的事件監聽器
    if (myRoutesLink) {
        myRoutesLink.addEventListener("click", function() {
            console.log("我的路線連結被點擊");
            window.location.href = "routeif.html?filter=myRoutes";
        });
    }

    // 綁定下載的路線連結的事件監聽器
    if (downloadedRoutesLink) {
        downloadedRoutesLink.addEventListener("click", function() {
            console.log("下載的路線連結被點擊");
            window.location.href = "routeif.html?filter=downloadedRoutes";
        });
    }
});
