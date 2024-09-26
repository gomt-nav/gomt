const DB_NAME = 'gomtDB'; // 定義資料庫名稱
const DB_VERSION = 1; // 設定資料庫版本號

let db; // 儲存資料庫的變數

// 開啟資料庫
function openDatabase() {
    let request = indexedDB.open(DB_NAME, DB_VERSION); // 開啟或創建 IndexedDB 資料庫

    // 如果資料庫版本升級或第一次創建，會觸發此事件
    request.onupgradeneeded = function (event) {
        db = event.target.result;

        // 建立 routes 物件存儲（路線資料）
        if (!db.objectStoreNames.contains('routes')) {
            let routesStore = db.createObjectStore('routes', { keyPath: 'routeId' }); // 指定 routeId 為主鍵
            routesStore.createIndex('routeName', 'routeName', { unique: false }); // 建立索引 routeName
            routesStore.createIndex('date', 'date', { unique: false }); // 建立索引 date
        }

        // 建立 weatherData 物件存儲（天氣資料）
        if (!db.objectStoreNames.contains('weatherData')) {
            let weatherStore = db.createObjectStore('weatherData', { keyPath: 'cityId' }); // 指定 cityId 為主鍵
            weatherStore.createIndex('cityName', 'cityName', { unique: false }); // 建立索引 cityName
            weatherStore.createIndex('date', 'date', { unique: false }); // 建立索引 date
        }

        // 建立 waterSources 物件存儲（水源資料）
        if (!db.objectStoreNames.contains('waterSources')) {
            let waterSourcesStore = db.createObjectStore('waterSources', { keyPath: 'sourceId' }); // 指定 sourceId 為主鍵
            waterSourcesStore.createIndex('sourceName', 'sourceName', { unique: false }); // 建立索引 sourceName
            waterSourcesStore.createIndex('location', 'location', { unique: false }); // 建立索引 location
        }

        // 建立 routeRecords 物件存儲（路線紀錄）
        // 建立 routeRecords 物件存儲（路線紀錄）
        if (!db.objectStoreNames.contains('routeRecords')) {
            let routeRecordsStore = db.createObjectStore('routeRecords', { keyPath: 'recordId', autoIncrement: true });


            // 建立索引
            routeRecordsStore.createIndex('routeName', 'routeName', { unique: false }); // 索引: 路線名稱
            routeRecordsStore.createIndex('date', 'date', { unique: false }); // 索引: 記錄日期
            routeRecordsStore.createIndex('duration', 'duration', { unique: false }); // 索引: 總時間
            routeRecordsStore.createIndex('distance', 'distance', { unique: false }); // 索引: 總距離
            routeRecordsStore.createIndex('elevationGain', 'elevationGain', { unique: false }); // 索引: 爬升高度
            routeRecordsStore.createIndex('elevationLoss', 'elevationLoss', { unique: false }); // 索引: 下降高度
            routeRecordsStore.createIndex('mtPlace', 'mtPlace', { unique: false }); // 索引: 縣市
            routeRecordsStore.createIndex('gpx', 'gpx', { unique: false }); // 索引: 路徑檔案 (GPX)
        }


        // 建立 users 物件存儲（使用者資料）
        if (!db.objectStoreNames.contains('users')) {
            let usersStore = db.createObjectStore('users', { keyPath: 'userId' }); // 指定 userId 為主鍵
            usersStore.createIndex('username', 'username', { unique: false }); // 建立索引 username
            usersStore.createIndex('loginDate', 'loginDate', { unique: false }); // 建立索引 loginDate
        }
    };

    // 成功開啟資料庫時的處理
    request.onsuccess = function (event) {
        db = event.target.result; // 將資料庫物件賦值給 db
        console.log('資料庫連接成功');
    };

    // 開啟資料庫失敗時的處理
    request.onerror = function (event) {
        console.log('資料庫連接失敗', event);
    };
}

// 新增資料到指定的物件存儲
function addData(storeName, data) {
    let transaction = db.transaction([storeName], 'readwrite'); // 開啟讀寫交易
    let objectStore = transaction.objectStore(storeName); // 取得指定的物件存儲
    let request = objectStore.add(data); // 將資料新增到物件存儲

    request.onsuccess = function () {
        console.log(`${storeName} 新增資料成功`); // 新增資料成功時顯示訊息
    };

    request.onerror = function (event) {
        console.log(`${storeName} 新增資料失敗`, event); // 新增資料失敗時顯示錯誤訊息
    };
}

// 取得指定物件存儲中的所有資料
function getAllData(storeName) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction([storeName], 'readonly'); // 開啟只讀交易
        let objectStore = transaction.objectStore(storeName); // 取得指定的物件存儲
        let request = objectStore.getAll(); // 取得物件存儲中的所有資料

        request.onsuccess = function (event) {
            resolve(event.target.result); // 成功取得資料時回傳結果
        };

        request.onerror = function (event) {
            reject('取得資料失敗', event); // 取得資料失敗時回傳錯誤
        };
    });
}

// 刪除指定主鍵的資料
function deleteData(storeName, key) {
    let transaction = db.transaction([storeName], 'readwrite'); // 開啟讀寫交易
    let objectStore = transaction.objectStore(storeName); // 取得指定的物件存儲
    let request = objectStore.delete(key); // 刪除對應主鍵的資料

    request.onsuccess = function () {
        console.log(`${storeName} 刪除資料成功`); // 刪除資料成功時顯示訊息
    };

    request.onerror = function (event) {
        console.log(`${storeName} 刪除資料失敗`, event); // 刪除資料失敗時顯示錯誤訊息
    };
}

// 更新指定資料
function updateData(storeName, data) {
    let transaction = db.transaction([storeName], 'readwrite'); // 開啟讀寫交易
    let objectStore = transaction.objectStore(storeName); // 取得指定的物件存儲
    let request = objectStore.put(data); // 更新資料，若不存在則新增

    request.onsuccess = function () {
        console.log(`${storeName} 更新資料成功`); // 更新資料成功時顯示訊息
    };

    request.onerror = function (event) {
        console.log(`${storeName} 更新資料失敗`, event); // 更新資料失敗時顯示錯誤訊息
    };
}

// 開啟資料庫
openDatabase();
