const gallery = document.getElementById('gallery');
const loadImagesBtn = document.getElementById('loadImages');
const clearGalleryBtn = document.getElementById('clearGallery');
let images = JSON.parse(localStorage.getItem('galleryImages')) || [];
let currentIndex = 0;
let fullscreenDiv;

let timerElement = document.getElementById('timer');
let startTime = Date.now();
let totalTime = 0;
let timerInterval;
let isPageVisible = true;
const locationDisplay = document.getElementById("location");
function updateTimer() {
    totalTime = Date.now() - startTime;
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(timerInterval);
    } else {
        startTime = Date.now() - totalTime;
        startTimer();
    }
});
window.addEventListener('load', startTimer);
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                locationDisplay.textContent = `Широта: ${latitude.toFixed(4)}, Довгота: ${longitude.toFixed(4)}`;
            },
            (error) => {
                console.error("Помилка геолокації:", error);
                locationDisplay.textContent = "Не вдалося отримати місцезнаходження.";
            }
        );
    } else {
        locationDisplay.textContent = "Геолокація не підтримується браузером.";
    }
}
window.addEventListener("load", getLocation);

function createImageElement(src, onClick) {
    const img = document.createElement('img');
    img.src = src;
    img.addEventListener('click', onClick);
    return img;
}

async function loadImages() {
    for (let i = 0; i < 2; i++) {
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            if (!response.ok) throw new Error('Помилка сервера');
            const data = await response.json();
            const img = createImageElement(data.message, () => enterFullscreen(images.indexOf(data.message)));
            gallery.appendChild(img);
            images.push(data.message);
            saveGalleryToLocalStorage();
        } catch (error) {
            console.error('Помилка завантаження фото:', error);
            alert('Не вдалося завантажити фото. Спробуйте ще раз.');
        }
    }
}

function saveGalleryToLocalStorage() {
    try {
        localStorage.setItem('galleryImages', JSON.stringify(images));
    } catch (error) {
        console.error('Помилка збереження в локальне сховище:', error);
        alert('Не вдалося зберегти галерею.');
    }
}

loadImagesBtn.addEventListener('click', loadImages);

function initializeFullscreen(index) {
    currentIndex = index;
    fullscreenDiv = document.createElement('div');
    fullscreenDiv.classList.add('fullscreen');

    const imgElement = createImageElement(images[currentIndex], null);
    const exitBtn = createNavigationButton('Вийти', 'exit-fullscreen', exitFullscreen);
    const prevBtn = createNavigationButton('<', 'prev-btn', () => navigateImage(-1));
    const nextBtn = createNavigationButton('>', 'next-btn', () => navigateImage(1));

    fullscreenDiv.append(imgElement, exitBtn, prevBtn, nextBtn);
    document.body.appendChild(fullscreenDiv);
    document.body.style.overflow = 'hidden';
}

function createNavigationButton(text, className, onClick) {
    const button = document.createElement('button');
    button.classList.add('navigation-btn', className);
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
}

function enterFullscreen(index) {
    initializeFullscreen(index);
}

function exitFullscreen() {
    document.body.removeChild(fullscreenDiv);
    document.body.style.overflow = 'auto';
}

function navigateImage(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    fullscreenDiv.querySelector('img').src = images[currentIndex];
}

clearGalleryBtn.addEventListener('click', () => {
    images = [];
    localStorage.removeItem('galleryImages');
    gallery.innerHTML = '';
});

window.addEventListener('load', () => {
    images.forEach(src => {
        const img = createImageElement(src, () => enterFullscreen(images.indexOf(src)));
        gallery.appendChild(img);
    });
});
