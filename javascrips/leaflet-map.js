import { getGPXDataFromIndexedDB } from './indexeddb-helper.js';

document.addEventListener("DOMContentLoaded", function () {
    // 初始化 Leaflet 地圖
    var map = L.map('map').setView([25.0330, 121.5654], 13); // 初始位置設置為台北市

    L.Marker.prototype.options.icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    

    // 添加 OpenStreetMap 圖層
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 用於記錄路徑的多邊線（polyline）
    var pathCoordinates = []; // 在這裡初始化為全域變數
    var polyline = L.polyline(pathCoordinates, { color: 'red' }).addTo(map);

    // 解析 URL 參數，獲取 routeId
    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('routeId');

    // 初始化 GPX 路線圖層
    var gpxLayer;

    if (routeId) {
        // 從 IndexedDB 讀取對應的 GPX 資料，並顯示在地圖上
        loadGPXFromIndexedDB(routeId);
    }

    // 從 IndexedDB 讀取並顯示 GPX 路線資料
    function loadGPXFromIndexedDB(routeId) {
        const dbRequest = indexedDB.open('gomtDB', 2);

        dbRequest.onsuccess = function (event) {
            var db = event.target.result;
            var transaction = db.transaction(["routeRecords"], "readonly");
            var store = transaction.objectStore("routeRecords");
            var request = store.get(parseInt(routeId));

            request.onsuccess = function (event) {
                const route = event.target.result;
                if (route && route.gpx) {
                    const gpxLayer = new L.GPX(route.gpx, { async: true }).addTo(map);
                    gpxLayer.on('loaded', function (e) {
                        map.fitBounds(e.target.getBounds()); // 調整地圖視野到 GPX 範圍
            
                        // 確保只處理具有 getLatLngs() 方法的圖層
                        pathCoordinates = gpxLayer.getLayers().flatMap(layer => {
                            if (typeof layer.getLatLngs === 'function') {
                                return layer.getLatLngs();
                            }
                            return [];
                        });
            
                        console.log(pathCoordinates); // 檢查 pathCoordinates 是否正確取得
                    });
                } else {
                    console.error("未找到對應的 GPX 資料");
                }
            };
            

            request.onerror = function (event) {
                console.error("無法從 IndexedDB 中讀取 GPX 資料: ", event.target.errorCode);
            };
        };

        dbRequest.onerror = function (event) {
            console.error("無法開啟資料庫: ", event.target.errorCode);
        };
    }

    // 初始化地圖標記
    var marker = L.marker([25.0330, 121.5654]).addTo(map).bindPopup('現在位置').openPopup();

    // 增加「開始導航」按鈕
    const navButtonHtml = `<button id="startNavigation" class="btn btn-success">開始導航</button>`;
    document.body.insertAdjacentHTML('beforeend', navButtonHtml);

    // 導航功能
    document.getElementById("startNavigation").addEventListener("click", function () {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(function (position) {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                var userLatLng = L.latLng(lat, lon);

                // 確保 pathCoordinates 有資料且 nearestPoint 存在
                if (pathCoordinates && pathCoordinates.length > 0) {
                    var nearestPoint = getNearestPointOnRoute(userLatLng, pathCoordinates);
                    if (nearestPoint) {
                        var distanceToRoute = userLatLng.distanceTo(nearestPoint);

                        if (distanceToRoute > 20) {
                            marker.bindPopup('偏離路線，請調整方向').openPopup();
                        } else {
                            marker.bindPopup('沿著路線行走').openPopup();
                        }
                    } else {
                        marker.bindPopup('無法找到最近的路徑點').openPopup();
                    }
                } else {
                    marker.bindPopup('無路徑可供導航，請先至路線資料匯入').openPopup();
                }

                // 更新標記位置
                marker.setLatLng(userLatLng);
                map.setView(userLatLng, map.getZoom());

            }, function (error) {
                console.error("導航失敗: ", error);
            }, { enableHighAccuracy: true });
        } else {
            alert('您的裝置不支援導航功能');
        }
    });

    // 計算使用者距離路徑最近的點
    function getNearestPointOnRoute(userLatLng, pathCoordinates) {
        let nearestPoint = null;
        let minDistance = Infinity;

        pathCoordinates.forEach(function (coord) {
            var routePoint = L.latLng(coord);
            var distance = userLatLng.distanceTo(routePoint);

            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = routePoint;
            }
        });

        return nearestPoint;
    }

    // 開始/停止記錄
    var isRecording = false;
    var recordButton = document.getElementById("recordButton");

    recordButton.addEventListener("click", function () {
        if (!isRecording) {
            isRecording = true;
            recordButton.innerText = "停止記錄";

            // 開始記錄過程
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(function (position) {
                    var lat = position.coords.latitude;
                    var lon = position.coords.longitude;

                    // 更新地圖上的位置
                    marker.setLatLng([lat, lon]);
                    map.setView([lat, lon], map.getZoom());

                    // 將位置加入路徑
                    pathCoordinates.push([lat, lon]);
                    polyline.setLatLngs(pathCoordinates);

                }, function (error) {
                    console.error("定位失敗: ", error);
                }, { enableHighAccuracy: true });
            }
        } else {
            // 停止記錄並保存路徑
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

        // 獲取預估時間、距離等數據
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
        var dbRequest = indexedDB.open('gomtDB', 2);

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
});
