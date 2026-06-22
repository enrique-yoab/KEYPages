const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let stars = [];
let meteors = [];

// Paleta naranja neón
const NEON_COLORS = ['#ff5e00', '#ff3300', '#ff9900'];

// ── Delta-time para animaciones independientes de framerate ──
let lastTime = 0;
const TARGET_FPS = 60;
const FRAME_MS  = 1000 / TARGET_FPS;

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
}

// ────────────────────────────────────────
//   CLASES DE PARTÍCULAS (con delta-time)
// ────────────────────────────────────────
class Star {
    constructor() { this.reset(); }
    reset() {
        this.x      = Math.random() * canvas.width;
        this.y      = Math.random() * canvas.height;
        this.size   = Math.random() * 1.2 + 0.2;
        this.alpha  = Math.random();
        this.dAlpha = (Math.random() * 0.012 + 0.003);   // por frame @60fps
        this.color  = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    }
    update(dt) {
        this.alpha += this.dAlpha * dt;
        if (this.alpha <= 0 || this.alpha >= 1) this.dAlpha *= -1;
    }
    draw() {
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Particle {
    constructor() {
        this.x      = Math.random() * canvas.width;
        this.y      = Math.random() * canvas.height;
        this.vx     = (Math.random() - 0.5) * 1.5;
        this.vy     = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1;
        const roll  = Math.random();
        this.color  = roll > 0.8 ? '#ffffff' : roll > 0.5 ? '#ff3300' : '#ff5e00';
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle    = this.color;
        ctx.shadowBlur   = 12;
        ctx.shadowColor  = this.color;
        ctx.fill();
        ctx.shadowBlur   = 0;
    }
}

class Meteor {
    constructor() { this.spawn(); }
    spawn() {
        this.x      = Math.random() * canvas.width  * 0.6;
        this.y      = Math.random() * canvas.height * 0.4;
        this.length = Math.random() * 100 + 60;
        this.speed  = Math.random() * 5 + 4;          // px/frame @60fps
        this.alpha  = 1;
        this.active = false;
        this.delay  = (Math.random() * 400 + 150);    // frames @60fps
    }
    update(dt) {
        if (this.delay > 0) { this.delay -= dt; return; }
        if (!this.active) this.active = true;
        this.x     += this.speed * dt;
        this.y     += this.speed * 0.45 * dt;
        this.alpha -= 0.022 * dt;
        if (this.alpha <= 0 || this.x > canvas.width || this.y > canvas.height) this.spawn();
    }
    draw() {
        if (!this.active || this.alpha <= 0) return;
        const grad = ctx.createLinearGradient(
            this.x, this.y,
            this.x - this.length, this.y - this.length * 0.45
        );
        grad.addColorStop(0, `rgba(255, 94, 0, ${this.alpha})`);
        grad.addColorStop(1, 'rgba(255, 94, 0, 0)');
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.length, this.y - this.length * 0.45);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
    }
}

// ────────────────────────────────────────
//   INIT
// ────────────────────────────────────────
function init() {
    particles = []; stars = []; meteors = [];
    const area          = canvas.width * canvas.height;
    const particleCount = Math.min(Math.floor(area / 14000), 120);
    const starCount     = Math.floor(area / 4000);
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    for (let i = 0; i < starCount;    i++) stars.push(new Star());
    for (let i = 0; i < 3;            i++) meteors.push(new Meteor());
}

// ────────────────────────────────────────
//   LOOP PRINCIPAL con delta-time
// ────────────────────────────────────────
function animate(timestamp) {
    requestAnimationFrame(animate);

    const elapsed = timestamp - lastTime;
    // Cap a 100 ms para evitar saltos tras alt-tab / lag puntual
    const dt = Math.min(elapsed, 100) / FRAME_MS;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s    => { s.update(dt); s.draw(); });
    meteors.forEach(m  => { m.update(dt); m.draw(); });
    particles.forEach(p => { p.update(dt); p.draw(); });

    // Líneas de conexión entre partículas
    const D = 155;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < D) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 94, 0, ${(1 - d / D) * 0.35})`;
                ctx.lineWidth   = 0.7;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
requestAnimationFrame(ts => { lastTime = ts; animate(ts); });

// ════════════════════════════════════════
//   ANIMACIÓN DE TEXTO (Neon Glitch)
// ════════════════════════════════════════
const textElement      = document.getElementById('text-display');
const typingContainer  = document.getElementById('typing-container');
const phrases          = ["KEYpagine"];
const DECODE_CHARS     = '█▓▒░▄▀■□▪▫◆◇○●0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&?<>[]{}|/\\^*+-=_~';

let phraseIndex       = 0;
let charIndex         = 0;
let isTyping          = false;
let passiveGlitchTimer = null;
let isTitleVisible    = true;

// Intersection Observer – pausa cuando no es visible
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        isTitleVisible = entry.isIntersecting;
        if (isTitleVisible) {
            typingContainer.classList.remove('render-paused');
            schedulePassiveGlitch();
        } else {
            typingContainer.classList.add('render-paused');
            clearTimeout(passiveGlitchTimer);
        }
    });
}, { threshold: 0 });

if (typingContainer) observer.observe(typingContainer);

// ── Render ──
function render(text, glitchIndices = new Set()) {
    // Reusar spans existentes en lugar de recrear el DOM completo
    const existingSpans = textElement.children;
    const needed        = text.length;

    // Ajustar cantidad de spans
    while (textElement.childElementCount > needed) textElement.removeChild(textElement.lastChild);
    while (textElement.childElementCount < needed) {
        textElement.appendChild(document.createElement('span'));
    }

    for (let i = 0; i < needed; i++) {
        const span = existingSpans[i];
        span.textContent = text[i];

        if (glitchIndices.has(i)) {
            span.className = 'glitch-char';
        } else if (phrases[phraseIndex].startsWith('KEYpagine') && i < 3) {
            span.className = 'resolved-char key-highlight';
        } else {
            span.className = 'resolved-char';
        }
    }
}

// ── Glitch pasivo ──
function runPassiveGlitch() {
    if (isTyping || !isTitleVisible) return;

    const currentText = phrases[phraseIndex].substring(0, charIndex);
    if (!currentText) return;

    const glitchDurationMs = Math.random() > 0.7 ? 300 : 120;
    const roll = Math.random();
    const numberOfGlitchChars = roll > 0.85
        ? currentText.length
        : Math.min(currentText.length, Math.floor(Math.random() * 3) + 2);

    const glitchIndices = new Set();
    while (glitchIndices.size < numberOfGlitchChars) {
        glitchIndices.add(Math.floor(Math.random() * currentText.length));
    }

    const corruptText = currentText.split('');
    glitchIndices.forEach(idx => {
        corruptText[idx] = DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
    });

    render(corruptText.join(''), glitchIndices);

    setTimeout(() => {
        if (!isTyping && isTitleVisible) render(currentText);
        schedulePassiveGlitch();
    }, glitchDurationMs);
}

function schedulePassiveGlitch() {
    clearTimeout(passiveGlitchTimer);
    if (isTitleVisible) {
        passiveGlitchTimer = setTimeout(runPassiveGlitch, Math.random() * 1700 + 800);
    }
}

// ── Escritura ──
function typeNext() {
    if (!isTitleVisible) { setTimeout(typeNext, 500); return; }

    isTyping = true;
    clearTimeout(passiveGlitchTimer);

    const phrase = phrases[phraseIndex];

    if (charIndex < phrase.length) {
        const frames  = 4;
        const frameMs = 30;
        let f = 0;

        const tick = setInterval(() => {
            f++;
            const fakeChar    = DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
            const textSoFar   = phrase.substring(0, charIndex) + fakeChar;
            render(textSoFar, new Set([charIndex]));

            if (f >= frames) {
                clearInterval(tick);
                charIndex++;
                render(phrase.substring(0, charIndex));
                setTimeout(typeNext, Math.random() * 80 + 40);
            }
        }, frameMs);

    } else {
        isTyping = false;
        schedulePassiveGlitch();
        setTimeout(eraseNext, 6000);
    }
}

// ── Borrado ──
function eraseNext() {
    if (!isTitleVisible) { setTimeout(eraseNext, 500); return; }

    isTyping = true;
    clearTimeout(passiveGlitchTimer);

    if (charIndex > 0) {
        const currentText = phrases[phraseIndex].substring(0, charIndex);
        const frames  = 2;
        const frameMs = 25;
        let f = 0;

        const tick = setInterval(() => {
            f++;
            const fakeChar  = DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
            const textSoFar = currentText.substring(0, charIndex - 1) + fakeChar;
            render(textSoFar, new Set([charIndex - 1]));

            if (f >= frames) {
                clearInterval(tick);
                charIndex--;
                render(currentText.substring(0, charIndex));
                setTimeout(eraseNext, 30);
            }
        }, frameMs);

    } else {
        isTyping = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeNext, 800);
    }
}

setTimeout(typeNext, 500);

// ════════════════════════════════════════
//   MENÚ HAMBURGUESA
// ════════════════════════════════════════
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });
}