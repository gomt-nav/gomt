// 引入寄驗證信功能
import { sendVerificationEmail } from './sendEmail.js';

document.addEventListener("DOMContentLoaded", function () {
    const updateForm = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const nameInput = document.getElementById("name");

    function loadCurrentUser() {
        const dbRequest = indexedDB.open("gomtDB", 2);
        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["users", "sessions"], "readonly");
            const sessionStore = transaction.objectStore("sessions");
            const userStore = transaction.objectStore("users");

            const sessionRequest = sessionStore.get("currentUser");
            sessionRequest.onsuccess = function (event) {
                const sessionData = event.target.result;
                if (sessionData && sessionData.userId) {
                    const userRequest = userStore.get(sessionData.userId);
                    userRequest.onsuccess = function (event) {
                        const userData = event.target.result;
                        if (userData) {
                            emailInput.value = userData.email;
                            nameInput.value = userData.username;
                        } else {
                            alert("無法加載使用者資料，請重新登入！");
                            window.location.href = "login.html";
                        }
                    };
                } else {
                    alert("尚未登入，請重新登入！");
                    window.location.href = "login.html";
                }
            };
        };
    }

    updateForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newEmail = emailInput.value.trim();
        const newName = nameInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (newPassword !== confirmPassword) {
            alert("新密碼與確認密碼不一致！");
            return;
        }

        const dbRequest = indexedDB.open("gomtDB", 2);
        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["users", "sessions"], "readwrite");
            const sessionStore = transaction.objectStore("sessions");
            const userStore = transaction.objectStore("users");

            const sessionRequest = sessionStore.get("currentUser");

            sessionRequest.onsuccess = function (event) {
                const sessionData = event.target.result;
                if (sessionData && sessionData.userId) {
                    const userRequest = userStore.get(sessionData.userId);
                    userRequest.onsuccess = function (event) {
                        const userData = event.target.result;
                        if (userData) {
                            if (userData.password === newPassword) {
                                alert("新密碼不可與舊密碼相同！");
                                return;
                            }

                            userData.username = newName;
                            userData.email = newEmail;
                            userData.password = newPassword;

                            const updateUserRequest = userStore.put(userData);

                            updateUserRequest.onsuccess = function () {
                                alert("帳號資訊更新成功！");
                                sendVerificationEmail(newEmail); // 呼叫發送驗證信功能
                            };
                        }
                    };
                }
            };
        };
    });

    loadCurrentUser();
});
