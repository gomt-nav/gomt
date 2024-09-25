document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.getElementById('navbar');
    const toggleButton = document.querySelector('.navbar-toggler');
    const body = document.querySelector('body'); 

    toggleButton.addEventListener('click', function () {
        navbar.classList.toggle('show-nav');
        body.classList.toggle('nav-open'); /* 當選單打開時，調整頁面填充 */
    });
});
