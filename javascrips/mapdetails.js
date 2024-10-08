document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([25.0330, 121.5654], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('routeId');

    if (routeId) {
        loadRouteDetailsFromIndexedDB(routeId);
    }

    function loadRouteDetailsFromIndexedDB(routeId) {
        const dbRequest = indexedDB.open('gomtDB', 2);

        dbRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["routeRecords"], "readonly");
            const store = transaction.objectStore("routeRecords");
            const request = store.get(parseInt(routeId));

            request.onsuccess = function (event) {
                const route = event.target.result;
                if (route) {
                    document.getElementById("routeName").textContent = route.routeName;
                    document.getElementById("duration").textContent = route.duration;
                    document.getElementById("distance").textContent = route.distance;
                    document.getElementById("elevationGain").textContent = route.elevationGain;
                    document.getElementById("elevationLoss").textContent = route.elevationLoss;

                    const gpxLayer = new L.GPX(route.gpx, { async: true }).addTo(map);
                    gpxLayer.on('loaded', function (e) {
                        map.fitBounds(e.target.getBounds());
                    });

                    // 將 GPX 加載到地圖的邏輯
                    document.getElementById("loadToMap").addEventListener("click", function () {
                        // 將 GPX 資料保存到 localStorage
                        localStorage.setItem('gpxData', route.gpx);
                        // 重定向至 map.html
                        window.location.href = 'map.html';
                    });
                } else {
                    console.error("未找到對應的資料");
                }
            };

            request.onerror = function (event) {
                console.error("無法從 IndexedDB 中讀取資料", event.target.errorCode);
            };
        };

        dbRequest.onerror = function (event) {
            console.error("無法開啟資料庫", event.target.errorCode);
        };
    }
});
