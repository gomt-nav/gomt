document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("contactForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        // 處理表單提交邏輯，例如發送電子郵件或保存訊息
        alert(`感謝您的聯絡！\n我們會盡快回覆您。`);
        window.location.href = "profile.html"; // 返回個人資料頁面
    });
});
