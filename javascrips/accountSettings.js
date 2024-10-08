document.addEventListener("DOMContentLoaded", function () {
    fetchUserData();

    document.getElementById("accountSettingsForm").addEventListener("submit", function (event) {
        event.preventDefault();
        updateUserSettings();
    });

    function fetchUserData() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const dbRequest = indexedDB.open('gomtDB', 2);
            dbRequest.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction('users', 'readonly');
                const store = transaction.objectStore('users');
                const getUser = store.get(loggedInUser);

                getUser.onsuccess = function () {
                    const user = getUser.result;
                    document.getElementById("username").value = user.username;
                    document.getElementById("email").value = user.email;
                };
            };
        } else {
            window.location.href = "login.html"; // 未登入時重導到登入頁
        }
    }

    function updateUserSettings() {
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const dbRequest = indexedDB.open('gomtDB', 2);
        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction('users', 'readwrite');
            const store = transaction.objectStore('users');

            const loggedInUser = localStorage.getItem('loggedInUser');
            const getUser = store.get(loggedInUser);

            getUser.onsuccess = function () {
                const user = getUser.result;
                user.username = username;
                user.email = email;
                if (password) {
                    user.password = password; // 更新密碼（如果填寫）
                }

                store.put(user).onsuccess = function () {
                    alert("帳號設定已更新！");
                    window.location.href = "profile.html";
                };
            };
        };
    }
});
