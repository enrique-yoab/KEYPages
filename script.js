/**
 * KEYpages — script.js
 * Lógica Vanilla JS altamente optimizada. Ruleta 100% Responsiva.
 */
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // --- 1. NAVBAR STICKY & SCROLL EFFECT ---
    const navbar = document.getElementById("navbar");
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };
    window.addEventListener("scroll", () => requestAnimationFrame(handleScroll), { passive: true });

    // --- 2. REVEAL ANIMATIONS (Intersection Observer) ---
    const revealElements = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 3. RULETA DE CASINO (Navegación Circular Elástica) ---
    const roulette = document.getElementById('menu-roulette');
    if (roulette) {
        const items = roulette.querySelectorAll('.roulette-item');
        const totalItems = items.length;
        let currentRotation = 0;
        let activeIndex = 0;

        // Función para posicionar elementos con radio verdaderamente dinámico
        const positionItems = () => {
            const screenWidth = window.innerWidth;
            let radius = 160; // Desktop
            
            // Ajuste hiper-dinámico para evitar desbordes
            if (screenWidth < 380) {
                radius = 95; // Pantallas muy pequeñas (ej. iPhone SE)
            } else if (screenWidth < 480) {
                radius = 125; // Celulares estándar
            }

            items.forEach((item, index) => {
                const angle = (index / totalItems) * (2 * Math.PI);
                const x = Math.round(radius * Math.sin(angle));
                const y = Math.round(-radius * Math.cos(angle));
                
                // Mantenemos la contra-rotación actual si se redimensiona la pantalla
                item.style.transform = `translate(${x}px, ${y}px) rotate(${-currentRotation}deg)`;
            });
        };

        const updateRoulette = (direction) => {
            items[activeIndex].classList.remove('active');

            // Calcular nuevo índice
            if (direction === 'right') {
                activeIndex = (activeIndex + 1) % totalItems;
                currentRotation -= (360 / totalItems);
            } else {
                activeIndex = (activeIndex - 1 + totalItems) % totalItems;
                currentRotation += (360 / totalItems);
            }

            items[activeIndex].classList.add('active');
            
            // Renderizado por GPU
            requestAnimationFrame(() => {
                roulette.style.transform = `rotate(${currentRotation}deg)`;
                
                // Contrarrestar la rotación para que el texto siempre se lea derecho
                items.forEach(item => {
                    // Limpiamos la rotación anterior y aplicamos la nueva
                    const currentTransform = item.style.transform.replace(/rotate\(.*?\)/g, '').trim(); 
                    item.style.transform = `${currentTransform} rotate(${-currentRotation}deg)`;
                });
            });
        };

        document.getElementById('btn-spin-left').addEventListener('click', () => updateRoulette('left'));
        document.getElementById('btn-spin-right').addEventListener('click', () => updateRoulette('right'));

        // Recalcular el radio exacto si el usuario gira o voltea el celular
        window.addEventListener('resize', () => {
            requestAnimationFrame(positionItems);
        });

        // Inicialización
        positionItems();
    }
});