// 初始化 Leaflet 地圖
document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('map').setView([25.0330, 121.5654], 13); // 台北市位置

    // 添加 OpenStreetMap 圖層
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 定位功能
    navigator.geolocation.getCurrentPosition(success, error);
    var marker, startTime, intervalId;
    var totalDistance = 0, previousPosition = null, totalAscent = 0, totalDescent = 0;

    // 開始記錄時按鈕狀態切換
    document.querySelector('.btn-success').addEventListener('click', function () {
        if (this.innerText === "開始記錄") {
            this.innerText = "停止記錄";
            startTime = new Date(); // 開始時間
            intervalId = setInterval(updateTime, 1000); // 每秒更新時間
            navigator.geolocation.watchPosition(success, error);
        } else {
            this.innerText = "開始記錄";
            clearInterval(intervalId); // 停止時間更新
        }
    });

    // 成功定位的回調函數
    function success(position) {
        var latlng = [position.coords.latitude, position.coords.longitude];
        if (!marker) {
            marker = L.marker(latlng).addTo(map).bindPopup('移動中...');
        } else {
            marker.setLatLng(latlng);
        }
        map.setView(latlng, 13);

        // 計算距離
        if (previousPosition) {
            var distance = map.distance(latlng, previousPosition);
            totalDistance += distance / 1000; // 轉換為公里
            document.querySelector('.total-distance').innerText = totalDistance.toFixed(2) + " KM";
        }
        previousPosition = latlng;
    }

    // 錯誤處理
    function error() {
        alert('無法獲取您的位置');
    }

    // 時間格式轉換
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // 更新時間
    function updateTime() {
        var currentTime = new Date();
        var timeElapsed = Math.floor((currentTime - startTime) / 1000); // 秒
        document.querySelector('.total-time').innerText = formatTime(timeElapsed);
    }

});
