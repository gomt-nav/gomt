// emergency-sms.js
document.addEventListener("DOMContentLoaded", function () {
    // 偵測 "發送緊急簡訊" 按鈕的點擊事件
    document.getElementById('sendEmergencySms').addEventListener('click', function () {
        // 檢查是否已有定位資料
        if (currentPosition) {
            sendEmergencyMessage(currentPosition);
        } else {
            alert('無法取得您的位置，請確認定位功能是否開啟。');
        }
    });

    // 發送緊急簡訊函數
    function sendEmergencyMessage(position) {
        const latitude = position.latitude;
        const longitude = position.longitude;
        const accuracy = position.accuracy;

        // 組裝簡訊內容
        const message = `緊急情況！我的當前位置是：\nhttps://maps.google.com/?q=${latitude},${longitude}\n位置準確度：${accuracy} 公尺。`;

        // 使用 SMS URL 協議發送簡訊
        const emergencyNumber = '112'; // 設置緊急聯絡電話號碼
        const smsUrl = `sms:${emergencyNumber}?body=${encodeURIComponent(message)}`;

        // 打開手機的簡訊應用
        window.location.href = smsUrl;
    }
});
