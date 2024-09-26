document.addEventListener("DOMContentLoaded", function () {
    // 初始化 Leaflet 地圖
    var map = L.map('map').setView([25.0330, 121.5654], 13); // 初始位置設置為台北市

    // 添加 OpenStreetMap 圖層
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 用於記錄路徑的多邊線（polyline）
    var pathCoordinates = [];
    var polyline = L.polyline(pathCoordinates, { color: 'red' }).addTo(map);

    // 記錄狀態
    var isRecording = false;

    // 時間、距離、海拔等數據
    var startTime, totalDistance = 0, totalElevationGain = 0, totalElevationLoss = 0, prevLatLng = null;

    // 更新時間函數
    function updateTime() {
        var currentTime = new Date();
        var elapsedTime = Math.floor((currentTime - startTime) / 1000);
        var hours = Math.floor(elapsedTime / 3600);
        var minutes = Math.floor((elapsedTime % 3600) / 60);
        var seconds = elapsedTime % 60;
        document.getElementById("time").innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 更新路徑距離
    function updateDistance(lat, lon) {
        if (prevLatLng) {
            var newLatLng = L.latLng(lat, lon);
            var distance = prevLatLng.distanceTo(newLatLng) / 1000; // 轉換為公里
            totalDistance += distance;
            document.getElementById("distance").innerText = totalDistance.toFixed(2) + " KM";

            // 模擬爬升和下降（實際應使用精確的高程數據）
            var elevationChange = Math.random() * 10 - 5; // 模擬高程變化
            if (elevationChange > 0) {
                totalElevationGain += elevationChange;
                document.getElementById("elevationGain").innerText = totalElevationGain.toFixed(2) + " M";
            } else {
                totalElevationLoss += Math.abs(elevationChange);
                document.getElementById("elevationLoss").innerText = totalElevationLoss.toFixed(2) + " M";
            }
        }
        prevLatLng = L.latLng(lat, lon);
    }

    // 地圖上的標記
    var marker = L.marker([25.0330, 121.5654]).addTo(map).bindPopup('移動中...').openPopup();

    // 首次定位
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            map.setView([lat, lon], 13);
            marker.setLatLng([lat, lon]);
        });
    }

    // 開始/停止記錄
    var recordButton = document.getElementById("recordButton");

    recordButton.addEventListener("click", function () {
        if (!isRecording) {
            // 開始記錄
            isRecording = true;
            recordButton.innerText = "停止記錄";
            startTime = new Date();
            setInterval(updateTime, 1000);

            // 第二次定位
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(function (position) {
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;

                    // 更新標記位置
                    marker.setLatLng([lat, lon]);
                    map.setView([lat, lon], map.getZoom());

                    // 添加到路徑
                    pathCoordinates.push([lat, lon]);
                    polyline.setLatLngs(pathCoordinates);

                    // 更新數據
                    updateDistance(lat, lon);
                });
            }
        } else {
            // 停止記錄並跳出儲存視窗
            isRecording = false;
            recordButton.innerText = "開始記錄";
            openSaveWindow(); // 彈出視窗的功能還保留，但不執行儲存
        }
    });

    // 彈出儲存視窗
    function openSaveWindow() {
        const saveWindowHtml = `
            <div class="modal" tabindex="-1" id="saveModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">建立路線檔</h5>
                        </div>
                        <div class="modal-body">
                            <label for="routeName">輸入檔名:</label>
                            <input type="text" id="routeName" class="form-control" placeholder="輸入檔名" />
                            <label for="routeCity">選擇城市:</label>
                            <select id="routeCity" class="form-select">
                                <option value="台北">台北</option>
                                <option value="高雄">高雄</option>
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" id="saveRoute">儲存</button>
                            <button class="btn btn-secondary" id="cancelRoute">取消</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', saveWindowHtml);
        document.getElementById("saveRoute").addEventListener("click", function () {
            alert("儲存功能已被移除");
            document.getElementById("saveModal").remove();
        });
        document.getElementById("cancelRoute").addEventListener("click", function () {
            document.getElementById("saveModal").remove();
        });
        new bootstrap.Modal(document.getElementById("saveModal")).show();
    }
});
