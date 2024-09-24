document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');
    mobileMenu.addEventListener('click', function () {
        navbar.style.left = (navbar.style.left === '0px') ? '-100%' : '0px';
    });
});
