// js/home.js

document.addEventListener('DOMContentLoaded', () => {
    const startOrderBtn = document.getElementById('start-order-btn');

    startOrderBtn.addEventListener('click', () => {
        window.location.href = 'ordering.html';
    });
});