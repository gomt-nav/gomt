if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js')
      .then(function(registration) {
        console.log('ServiceWorker 註冊成功:', registration);
      })
      .catch(function(error) {
        console.log('ServiceWorker 註冊失敗:', error);
      });
    });
  }
  