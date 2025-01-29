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

function startTimer() {
    timerInterval = setInterval(() => {
        if (isPageVisible) {
            totalTime = Date.now() - startTime;
            const minutes = Math.floor(totalTime / 60000);
            const seconds = Math.floor((totalTime % 60000) / 1000);
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
    }, 1000);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isPageVisible = false;
    } else {
        startTime = Date.now() - totalTime;
        isPageVisible = true;
    }
});
window.addEventListener('focus', () => {
    if (!timerInterval) {
        startTimer();
    }
});

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

loadImagesBtn.addEventListener('click', async () => {
    for (let i = 0; i < 2; i++) {
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            const img = createImageElement(data.message, () => enterFullscreen(images.indexOf(data.message)));
            gallery.appendChild(img);
            images.push(data.message);
            saveGalleryToLocalStorage();
        } catch (error) {
            console.error('Помилка завантаження фото:', error);
        }
    }
});

function enterFullscreen(index) {
    currentIndex = index;
    fullscreenDiv = document.createElement('div');
    fullscreenDiv.classList.add('fullscreen');

    const imgElement = createImageElement(images[currentIndex], null);
    const exitBtn = document.createElement('button');
    exitBtn.classList.add('exit-fullscreen');
    exitBtn.textContent = 'Вийти';
    exitBtn.addEventListener('click', exitFullscreen);
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('navigation-btn', 'prev-btn');
    prevBtn.textContent = '<';
    prevBtn.addEventListener('click', () => navigateImage(-1));
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('navigation-btn', 'next-btn');
    nextBtn.textContent = '>';
    nextBtn.addEventListener('click', () => navigateImage(1));

    fullscreenDiv.append(imgElement, exitBtn, prevBtn, nextBtn);
    document.body.appendChild(fullscreenDiv);
    document.body.style.overflow = 'hidden';
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

function saveGalleryToLocalStorage() {
    localStorage.setItem('galleryImages', JSON.stringify(images));
}

window.addEventListener('load', () => {
    images.forEach(src => {
        const img = createImageElement(src, () => enterFullscreen(images.indexOf(src)));
        gallery.appendChild(img);
    });
});
