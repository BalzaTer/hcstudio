document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.feature-animate');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // On arrête d'observer une fois visible
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => {
        // Ajoute la classe left ou right selon la position de l'image
        if (section.querySelector('.feature-img.left')) {
            section.classList.add('left');
        } else {
            section.classList.add('right');
        }
        observer.observe(section);
    });

    // Ajout de l'année dynamique dans le footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Carrousel automatique + lightbox
    const carousels = document.querySelectorAll('.gallery-carousel');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const closeBtn = document.querySelector('.lightbox .close');
    const arrowLeft = document.querySelector('.lightbox-arrow-left');
    const arrowRight = document.querySelector('.lightbox-arrow-right');
    let currentGallery = null;
    let currentIndex = 0;
    let autoSlideInterval = [];
    let isLightboxOpen = false;
    const lightboxDotsContainer = document.querySelector('.lightbox-dots');
    let lightboxDots = [];

    carousels.forEach((carousel, idx) => {
        const images = carousel.querySelectorAll('.gallery-img');
        let index = 0;

        // Création des points
        let dotsContainer = carousel.querySelector('.gallery-dots');
        if (!dotsContainer) {
            dotsContainer = document.createElement('div');
            dotsContainer.className = 'gallery-dots';
            carousel.appendChild(dotsContainer);
        }
        dotsContainer.innerHTML = '';
        images.forEach((img, i) => {
            const dot = document.createElement('span');
            dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(i);
            });
            dotsContainer.appendChild(dot);
        });
        const dots = dotsContainer.querySelectorAll('.gallery-dot');

        // Fonction pour afficher l'image courante et mettre à jour les points
        function showImage(i) {
            images.forEach((img, j) => {
                img.classList.toggle('active', j === i);
            });
            dots.forEach((dot, j) => {
                dot.classList.toggle('active', j === i);
            });
            index = i;
        }

        // Carrousel automatique
        function startAutoSlide() {
            autoSlideInterval[idx] = setInterval(() => {
                let next = (index + 1) % images.length;
                showImage(next);
            }, 4000);
        }
        function stopAutoSlide() {
            clearInterval(autoSlideInterval[idx]);
        }
        startAutoSlide();

        // Clic pour ouvrir la lightbox
        images.forEach((img, i) => {
            img.addEventListener('click', () => {
                isLightboxOpen = true;
                stopAutoSlide();
                lightbox.style.display = 'flex';
                lightboxImg.src = img.src;
                currentGallery = images;
                currentIndex = i;

                // Génère les points pour la lightbox
                lightboxDotsContainer.innerHTML = '';
                lightboxDots = [];
                for (let j = 0; j < currentGallery.length; j++) {
                    const dot = document.createElement('span');
                    dot.className = 'lightbox-dot' + (j === currentIndex ? ' active' : '');
                    dot.addEventListener('click', (e) => {
                        e.stopPropagation();
                        currentIndex = j;
                        lightboxImg.src = currentGallery[currentIndex].src;
                        updateLightboxDots();
                    });
                    lightboxDotsContainer.appendChild(dot);
                    lightboxDots.push(dot);
                }
            });
        });

        // Glissement tactile dans la galerie (mobile)
        let startX = 0;
        carousel.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        });
        carousel.addEventListener('touchend', e => {
            let dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) {
                let next = dx < 0 ? (index + 1) % images.length : (index - 1 + images.length) % images.length;
                showImage(next);
            }
        });
    });

    // Lightbox : fermer
    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
        isLightboxOpen = false;
        // Relancer le carrousel de la galerie ouverte
        carousels.forEach((carousel, idx) => {
            if (carousel.querySelector('.gallery-img.active').src === lightboxImg.src) {
                autoSlideInterval[idx] = setInterval(() => {
                    let images = carousel.querySelectorAll('.gallery-img');
                    let current = Array.from(images).findIndex(img => img.classList.contains('active'));
                    let next = (current + 1) % images.length;
                    images.forEach((img, j) => img.classList.toggle('active', j === next));
                }, 2500);
            }
        });
    });

    // Lightbox : navigation par glissement ou clic
    let startX = 0;
    lightboxImg.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    lightboxImg.addEventListener('touchend', e => {
        let dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50 && currentGallery) {
            currentIndex = dx < 0 ? (currentIndex + 1) % currentGallery.length : (currentIndex - 1 + currentGallery.length) % currentGallery.length;
            lightboxImg.src = currentGallery[currentIndex].src;
            updateLightboxDots();
        }
    });
    lightboxImg.addEventListener('click', e => {
        if (!currentGallery) return;
        let rect = lightboxImg.getBoundingClientRect();
        if (e.clientX < rect.left + rect.width / 2) {
            currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        } else {
            currentIndex = (currentIndex + 1) % currentGallery.length;
        }
        lightboxImg.src = currentGallery[currentIndex].src;
        updateLightboxDots();
    });

    // Navigation par les flèches dans la lightbox
    arrowLeft.addEventListener('click', () => {
        if (!currentGallery) return;
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        lightboxImg.src = currentGallery[currentIndex].src;
        updateLightboxDots();
    });
    arrowRight.addEventListener('click', () => {
        if (!currentGallery) return;
        currentIndex = (currentIndex + 1) % currentGallery.length;
        lightboxImg.src = currentGallery[currentIndex].src;
        updateLightboxDots();
    });

    function updateLightboxDots() {
        if (!lightboxDots.length) return;
        lightboxDots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }
});