document.addEventListener("DOMContentLoaded", function () {
  const registerButton = document.getElementById("registerButton");

  registerButton.addEventListener("click", function () {
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // 確保所有欄位都已填寫
      if (!username || !email || !password) {
          alert("請填寫所有欄位！");
          return;
      }

      // 創建用戶資料物件
      const userData = {
          userId: new Date().getTime(),  // 使用唯一值作為 userId
          username: username,
          email: email,
          password: password
      };

      // 打開 IndexedDB 資料庫
      const dbRequest = indexedDB.open('gomtDB', 2);

      dbRequest.onupgradeneeded = function (event) {
          const db = event.target.result;

          // 創建 `users` ObjectStore，如果不存在的話
          if (!db.objectStoreNames.contains('users')) {
              db.createObjectStore('users', { keyPath: 'userId', autoIncrement: false });
          }
      };

      dbRequest.onsuccess = function (event) {
          const db = event.target.result;
          const transaction = db.transaction(['users'], 'readwrite');
          const store = transaction.objectStore('users');

          // 添加用戶資料到 `users` ObjectStore 中
          const addRequest = store.add(userData);

          addRequest.onsuccess = function () {
              console.log("用戶資料已成功加入 IndexedDB");
              alert("註冊成功！");
          };

          addRequest.onerror = function (event) {
              console.error("無法加入用戶資料: ", event.target.error);
          };
      };

      dbRequest.onerror = function (event) {
          console.error("無法開啟資料庫: ", event.target.errorCode);
      };
  });
});
