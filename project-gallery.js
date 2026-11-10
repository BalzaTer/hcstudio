document.addEventListener('DOMContentLoaded', function () {
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    const maxPhotos = 12;

    document.querySelectorAll('.project-gallery[data-project]').forEach(gallery => {
        initializeProjectGallery(gallery, extensions, maxPhotos);
    });
});

async function initializeProjectGallery(gallery, extensions, maxPhotos) {
    const project = gallery.dataset.project;
    const emptyMessage = gallery.nextElementSibling;
    const images = [];

    for (let index = 1; index <= maxPhotos; index += 1) {
        const image = await loadProjectPhoto(project, index, extensions);
        if (!image) {
            break;
        }

        image.alt = `Photo ${index} du projet ${project}`;
        image.className = `gallery-img${index === 1 ? ' active' : ''}`;
        gallery.appendChild(image);
        images.push(image);
    }

    if (images.length === 0) {
        return;
    }

    if (emptyMessage) {
        emptyMessage.hidden = true;
    }

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'gallery-dots';
    gallery.appendChild(dotsContainer);

    const dots = images.map((image, index) => {
        const dot = document.createElement('span');
        dot.className = `gallery-dot${index === 0 ? ' active' : ''}`;
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label', `Afficher la photo ${index + 1}`);
        dot.addEventListener('click', () => showImage(index));
        dot.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                showImage(index);
            }
        });
        dotsContainer.appendChild(dot);
        image.addEventListener('click', () => openLightbox(index));
        return dot;
    });

    let activeIndex = 0;
    let interval;

    function showImage(index) {
        activeIndex = index;
        images.forEach((image, imageIndex) => {
            image.classList.toggle('active', imageIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === index);
        });
    }

    function startSlideshow() {
        if (images.length > 1) {
            interval = window.setInterval(() => {
                showImage((activeIndex + 1) % images.length);
            }, 4000);
        }
    }

    function stopSlideshow() {
        window.clearInterval(interval);
    }

    function openLightbox(index) {
        stopSlideshow();
        getProjectLightbox().open(images, index, startSlideshow);
    }

    startSlideshow();
}

function getProjectLightbox() {
    let element = document.querySelector('.project-lightbox');
    if (element) {
        return element.lightboxControls;
    }

    element = document.createElement('div');
    element.className = 'lightbox project-lightbox';
    element.style.display = 'none';
    element.innerHTML = `
        <button class="lightbox-arrow lightbox-arrow-left" type="button" aria-label="Photo précédente">❮</button>
        <img class="lightbox-img" src="" alt="">
        <button class="lightbox-arrow lightbox-arrow-right" type="button" aria-label="Photo suivante">❯</button>
        <button class="close" type="button" aria-label="Fermer">&times;</button>
        <div class="lightbox-dots"></div>
    `;
    document.body.appendChild(element);

    const imageElement = element.querySelector('.lightbox-img');
    const dotsContainer = element.querySelector('.lightbox-dots');
    const dots = [];
    let images = [];
    let activeIndex = 0;
    let onClose;

    function showImage(index) {
        activeIndex = (index + images.length) % images.length;
        imageElement.src = images[activeIndex].src;
        imageElement.alt = images[activeIndex].alt;
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === activeIndex);
        });
    }

    function close() {
        element.style.display = 'none';
        if (onClose) {
            onClose();
        }
    }

    element.querySelector('.lightbox-arrow-left').addEventListener('click', () => showImage(activeIndex - 1));
    element.querySelector('.lightbox-arrow-right').addEventListener('click', () => showImage(activeIndex + 1));
    element.querySelector('.close').addEventListener('click', close);
    element.addEventListener('click', event => {
        if (event.target === element) {
            close();
        }
    });
    document.addEventListener('keydown', event => {
        if (element.style.display === 'none') {
            return;
        }

        if (event.key === 'Escape') {
            close();
        } else if (event.key === 'ArrowLeft') {
            showImage(activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
            showImage(activeIndex + 1);
        }
    });

    element.lightboxControls = {
        open(galleryImages, index, closeCallback) {
            images = galleryImages;
            onClose = closeCallback;
            dotsContainer.replaceChildren();
            dots.length = 0;
            images.forEach((_, dotIndex) => {
                const dot = document.createElement('span');
                dot.className = `lightbox-dot${dotIndex === index ? ' active' : ''}`;
                dot.addEventListener('click', () => showImage(dotIndex));
                dotsContainer.appendChild(dot);
                dots.push(dot);
            });
            showImage(index);
            element.style.display = 'flex';
        }
    };

    return element.lightboxControls;
}

function loadProjectPhoto(project, index, extensions) {
    return new Promise(resolve => {
        let extensionIndex = 0;
        const image = new Image();

        function tryNextExtension() {
            if (extensionIndex >= extensions.length) {
                resolve(null);
                return;
            }

            image.src = `img/projects/${project}/photo-${index}.${extensions[extensionIndex]}`;
            extensionIndex += 1;
        }

        image.onload = () => resolve(image);
        image.onerror = tryNextExtension;
        tryNextExtension();
    });
}
