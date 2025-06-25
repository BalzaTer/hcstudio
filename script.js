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
});