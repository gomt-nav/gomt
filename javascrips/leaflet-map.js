document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('map').setView([25.0330, 121.5654], 13); 
    var pathCoordinates = [];
    var polyline = L.polyline(pathCoordinates, { color: 'red' }).addTo(map);
    var isRecording = false;
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

    // 更新路徑距離和高度變化
    function updateDistance(lat, lon) {
        if (prevLatLng) {
            var newLatLng = L.latLng(lat, lon);
            var distance = prevLatLng.distanceTo(newLatLng) / 1000; 
            totalDistance += distance;
            document.getElementById("distance").innerText = totalDistance.toFixed(2) + " KM";

            // 模擬高度變化
            var elevationChange = Math.random() * 10 - 5; 
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

    var marker = L.marker([25.0330, 121.5654]).addTo(map).bindPopup('移動中...').openPopup();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            map.setView([lat, lon], 13);
            marker.setLatLng([lat, lon]);
        });
    }

    var recordButton = document.getElementById("recordButton");
    recordButton.addEventListener("click", function () {
        if (!isRecording) {
            isRecording = true;
            recordButton.innerText = "停止記錄";
            startTime = new Date();
            setInterval(updateTime, 1000);

            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(function (position) {
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;
                    marker.setLatLng([lat, lon]);
                    map.setView([lat, lon], map.getZoom());

                    pathCoordinates.push([lat, lon]);
                    polyline.setLatLngs(pathCoordinates);
                    updateDistance(lat, lon);
                });
            }
        } else {
            isRecording = false;
            recordButton.innerText = "開始記錄";
            openSaveWindow(); 
        }
    });

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

    function saveRouteToGpx() {
        const routeName = document.getElementById("routeName").value;
        const routeCity = document.getElementById("routeCity").value;
        const duration = document.getElementById("time").innerText;
        const distance = document.getElementById("distance").innerText;
        const elevationGain = document.getElementById("elevationGain").innerText;
        const elevationLoss = document.getElementById("elevationLoss").innerText;

        if (!routeName || !routeCity) {
            alert("請輸入路線名稱並選擇城市！");
            return;
        }

        let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1" creator="GoMT" xmlns="http://www.topografix.com/GPX/1/1">
            <trk><name>${routeName}</name><trkseg>`;
        pathCoordinates.forEach(coord => {
            gpxData += `<trkpt lat="${coord[0]}" lon="${coord[1]}"></trkpt>`;
        });
        gpxData += `</trkseg></trk></gpx>`;

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

            var data = {
                routeName: routeName,
                date: new Date().toISOString(),
                duration: duration,
                distance: distance,
                elevationGain: elevationGain,
                elevationLoss: elevationLoss,
                mtPlace: routeCity,
                gpx: gpxData
            };

            store.add(data).onsuccess = function () {
                alert("路線已成功儲存！");
                document.getElementById("saveModal").remove();
                location.reload();
            };

            store.onerror = function (event) {
                console.error("新增資料時發生錯誤: ", event.target.error);
            };
        };

        dbRequest.onerror = function (event) {
            console.error("無法開啟資料庫: ", event.target.errorCode);
        };
    }
});
