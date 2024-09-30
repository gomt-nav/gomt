document.addEventListener("DOMContentLoaded", function () {
    // 初始化 Leaflet 地圖
    var map = L.map('map').setView([25.0330, 121.5654], 13); // 初始位置設置為台北市

    // 添加 OpenStreetMap 圖層
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 用於記錄路徑的多邊線（polyline）
    var pathCoordinates = [];
    var polyline = L.polyline(pathCoordinates, { color: 'red' }).addTo(map);

    // 記錄狀態
    var isRecording = false;

    // 時間、距離、海拔等數據
    var startTime, totalDistance = 0, prevLatLng = null;

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
        }
        prevLatLng = L.latLng(lat, lon);
    }

    // 更新高度函數
    function updateElevation(altitude) {
        if (altitude !== null) {
            document.getElementById("elevation").innerText = altitude.toFixed(2) + " M";
        } else {
            document.getElementById("elevation").innerText = "無法獲取高度";
        }
    }

    // 地圖上的標記
    var marker = L.marker([25.0330, 121.5654]).addTo(map).bindPopup('現在位置...').openPopup();

    // 首次定位
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            var altitude = position.coords.altitude;  // 獲取海拔高度
            map.setView([lat, lon], 13);
            marker.setLatLng([lat, lon]);
            updateElevation(altitude); // 更新海拔
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
                    var altitude = position.coords.altitude;  // 獲取海拔高度

                    // 更新標記位置
                    marker.setLatLng([lat, lon]);
                    map.setView([lat, lon], map.getZoom());

                    // 添加到路徑
                    pathCoordinates.push([lat, lon]);
                    polyline.setLatLngs(pathCoordinates);

                    // 更新數據
                    updateDistance(lat, lon);
                    updateElevation(altitude); // 更新海拔高度
                }, 
                function(error) {
                    console.error("定位失敗: ", error);
                }, 
                { enableHighAccuracy: true });  // 啟用高精度模式
            }
        } else {
            // 停止記錄
            isRecording = false;
            recordButton.innerText = "開始記錄";
            openSaveWindow();
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
        document.getElementById("saveRoute").addEventListener("click", saveRouteToGpx);
        document.getElementById("cancelRoute").addEventListener("click", function () {
            document.getElementById("saveModal").remove();
        });
        new bootstrap.Modal(document.getElementById("saveModal")).show();
    }

    // 將路徑存為 GPX 並儲存到 IndexedDB
    function saveRouteToGpx() {
        const routeName = document.getElementById("routeName").value;
        const routeCity = document.getElementById("routeCity").value;

        // 獲取預估時間、距離、海拔高度等數據
        const duration = document.getElementById("time").innerText;
        const distance = document.getElementById("distance").innerText;

        // 檢查必填欄位是否都有值
        if (!routeName || !routeCity) {
            alert("請輸入路線名稱並選擇城市！");
            return;
        }

        // 將路徑數據轉為 GPX 格式
        let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1" creator="GoMT" xmlns="http://www.topografix.com/GPX/1/1">
            <trk><name>${routeName}</name><trkseg>`;
        pathCoordinates.forEach(coord => {
            gpxData += `<trkpt lat="${coord[0]}" lon="${coord[1]}"></trkpt>`;
        });
        gpxData += `</trkseg></trk></gpx>`;

        // 打開 IndexedDB
        var dbRequest = indexedDB.open('gomtDB', 1);

        dbRequest.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (!db.objectStoreNames.contains('routeRecords')) {
                db.createObjectStore('routeRecords', { keyPath: 'recordId', autoIncrement: true });
            }
        };

        dbRequest.onsuccess = function (event) {
            var db = event.target.result;
            var transaction = db.transaction(["routeRecords"], "readwrite");
            var store = transaction.objectStore("routeRecords");

            // 準備要插入的數據
            var data = {
                routeName: routeName,
                date: new Date().toISOString(),
                duration: duration,
                distance: distance,
                mtPlace: routeCity,
                gpx: gpxData
            };

            // 確保資料有正確的數據
            if (data.routeName && data.date && data.gpx) {
                store.add(data).onsuccess = function () {
                    alert("路線已成功儲存！");
                    location.reload();  // 儲存後刷新頁面
                };

                // 處理插入時的錯誤
                store.onerror = function (event) {
                    console.error("新增資料時發生錯誤: ", event.target.error);
                };
            } else {
                console.error("資料缺少必要欄位，無法儲存。");
            }
        };

        dbRequest.onerror = function (event) {
            console.error("無法開啟資料庫: ", event.target.errorCode);
        };

        // 移除彈窗
        document.getElementById("saveModal").remove();
    }

    // 同步 IndexedDB 資料到 Firebase
    window.addEventListener('online', syncIndexedDBToFirebase);

    async function syncIndexedDBToFirebase() {
        const dbRequest = indexedDB.open('gomtDB', 1);

        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(['routeRecords'], 'readonly');
            const store = transaction.objectStore('routeRecords');
            const getAllRecords = store.getAll();

            getAllRecords.onsuccess = function () {
                const records = getAllRecords.result;
                records.forEach(record => {
                    // 將每條記錄同步至 Firebase
                    syncRecordToFirebase(record);
                });
            };
        };

        dbRequest.onerror = function (event) {
            console.error("無法開啟 IndexedDB: ", event.target.errorCode);
        };
    }

    async function syncRecordToFirebase(record) {
        try {
            const docRef = await addDoc(collection(db, "routes"), {
                routeName: record.routeName,
                date: record.date,
                duration: record.duration,
                distance: record.distance,
                mtPlace: record.mtPlace,
                gpx: record.gpx
            });
            console.log("資料已同步至 Firebase，記錄 ID:", docRef.id);
        } catch (error) {
            console.error("同步到 Firebase 時發生錯誤:", error);
        }
    }
});
