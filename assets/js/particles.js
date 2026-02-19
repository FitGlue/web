/**
 * FitGlue Showcase Animations
 * Multi-mode canvas animation system for showcase pages.
 * Modes: particles (constellation), pulse (wave rings), aurora (northern lights),
 *        rain (digital rain), none (static).
 *
 * Usage:
 *   initParticles('canvas-id');
 *   // Later, after theme loads:
 *   window.setShowcaseAnimation('aurora');
 */
function initParticles(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var animId = null;
    var currentMode = 'particles';

    // Read accent colour from CSS custom property
    function getAccent() {
        var page = document.querySelector('.showcase-page');
        if (!page) return '#FF1B8D';
        return getComputedStyle(page).getPropertyValue('--sc-accent').trim() || '#FF1B8D';
    }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        return { r: r, g: g, b: b };
    }

    function resize() {
        var parent = canvas.parentElement;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }

    // ========== MODE: Constellation Particles ==========
    var particles = [];
    var PARTICLE_COUNT = 60;
    var CONNECTION_DIST = 120;

    function initConstellation() {
        particles = [];
        var accent = hexToRgb(getAccent());
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            // Vary colours around the accent
            var rShift = Math.floor((Math.random() - 0.5) * 60);
            var gShift = Math.floor((Math.random() - 0.5) * 60);
            var bShift = Math.floor((Math.random() - 0.5) * 60);
            var r = Math.max(0, Math.min(255, accent.r + rShift));
            var g = Math.max(0, Math.min(255, accent.g + gShift));
            var b = Math.max(0, Math.min(255, accent.b + bShift));
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 2 + 0.5,
                colour: 'rgba(' + r + ',' + g + ',' + b + ',0.5)',
            });
        }
    }

    function drawConstellation() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var accent = hexToRgb(getAccent());

        // Draw connections
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    var alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                    ctx.strokeStyle = 'rgba(' + accent.r + ',' + accent.g + ',' + accent.b + ',' + alpha + ')';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw and update particles
        for (var k = 0; k < particles.length; k++) {
            var p = particles[k];
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.colour;
            ctx.fillStyle = p.colour;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.y > canvas.height + 10) p.y = -10;
        }
    }

    // ========== MODE: Pulse Waves ==========
    var pulseRings = [];
    var pulseTimer = 0;

    function drawPulse() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var accent = hexToRgb(getAccent());
        pulseTimer++;

        // Spawn new ring periodically
        if (pulseTimer % 90 === 0) {
            pulseRings.push({
                x: canvas.width * (0.2 + Math.random() * 0.6),
                y: canvas.height * (0.2 + Math.random() * 0.6),
                radius: 0,
                maxRadius: 200 + Math.random() * 200,
                life: 1,
            });
        }

        for (var i = pulseRings.length - 1; i >= 0; i--) {
            var ring = pulseRings[i];
            ring.radius += 1.5;
            ring.life = 1 - ring.radius / ring.maxRadius;

            if (ring.life <= 0) {
                pulseRings.splice(i, 1);
                continue;
            }

            ctx.strokeStyle = 'rgba(' + accent.r + ',' + accent.g + ',' + accent.b + ',' + (ring.life * 0.3) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner shimmer ring
            if (ring.radius > 20) {
                ctx.strokeStyle = 'rgba(' + accent.r + ',' + accent.g + ',' + accent.b + ',' + (ring.life * 0.1) + ')';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.radius * 0.7, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    // ========== MODE: Aurora ==========
    var auroraTime = 0;

    function drawAurora() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var accent = hexToRgb(getAccent());
        auroraTime += 0.005;
        var w = canvas.width;
        var h = canvas.height;

        // Draw 3 aurora bands
        for (var band = 0; band < 3; band++) {
            var yBase = h * (0.2 + band * 0.2);
            var alphaBase = 0.04 - band * 0.01;

            ctx.beginPath();
            ctx.moveTo(0, yBase);
            for (var x = 0; x <= w; x += 4) {
                var wave = Math.sin(x * 0.003 + auroraTime + band * 1.5) * 60 +
                    Math.sin(x * 0.007 + auroraTime * 1.3 + band) * 30 +
                    Math.sin(x * 0.001 + auroraTime * 0.7) * 40;
                ctx.lineTo(x, yBase + wave);
            }
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();

            var gradient = ctx.createLinearGradient(0, yBase - 80, 0, yBase + 120);
            gradient.addColorStop(0, 'rgba(' + accent.r + ',' + accent.g + ',' + accent.b + ',' + alphaBase + ')');
            gradient.addColorStop(0.5, 'rgba(' + accent.r + ',' + accent.g + ',' + accent.b + ',' + (alphaBase * 2) + ')');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // Faint vertical shimmer streaks
        for (var s = 0; s < 5; s++) {
            var sx = w * (0.1 + s * 0.2) + Math.sin(auroraTime * 2 + s) * 30;
            var shimmerAlpha = (Math.sin(auroraTime * 3 + s * 1.7) + 1) * 0.015;
            var shimmerGrad = ctx.createLinearGradient(sx, 0, sx, h * 0.6);
            shimmerGrad.addColorStop(0, 'rgba(' + accent.r + ',' + accent.g + ',' + accent.b + ',' + shimmerAlpha + ')');
            shimmerGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = shimmerGrad;
            ctx.fillRect(sx - 15, 0, 30, h * 0.6);
        }
    }

    // ========== MODE: Digital Rain ==========
    var rainDrops = [];
    var RAIN_COLUMNS = 40;

    function initRain() {
        rainDrops = [];
        var colW = canvas.width / RAIN_COLUMNS;
        for (var i = 0; i < RAIN_COLUMNS; i++) {
            rainDrops.push({
                x: i * colW + colW / 2,
                y: Math.random() * canvas.height * -1,
                speed: 1 + Math.random() * 2,
                length: 60 + Math.random() * 120,
                delay: Math.random() * 200,
                timer: 0,
            });
        }
    }

    function drawRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var accent = hexToRgb(getAccent());

        for (var i = 0; i < rainDrops.length; i++) {
            var d = rainDrops[i];
            d.timer++;
            if (d.timer < d.delay) continue;

            d.y += d.speed;

            // Draw the drop as a vertical gradient line
            var gradient = ctx.createLinearGradient(d.x, d.y - d.length, d.x, d.y);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, 'rgba(' + accent.r + ',' + accent.g + ',' + accent.b + ',0.3)');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y - d.length);
            ctx.lineTo(d.x, d.y);
            ctx.stroke();

            // Bright tip
            ctx.fillStyle = 'rgba(' + accent.r + ',' + accent.g + ',' + accent.b + ',0.6)';
            ctx.fillRect(d.x - 0.5, d.y - 2, 1, 2);

            // Reset when off screen
            if (d.y > canvas.height + d.length) {
                d.y = -d.length;
                d.delay = 0;
                d.speed = 1 + Math.random() * 2;
            }
        }
    }

    // ========== Animation Loop ==========
    function startMode(mode) {
        if (animId) cancelAnimationFrame(animId);
        currentMode = mode;

        if (mode === 'none') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = '';

        if (mode === 'particles') initConstellation();
        if (mode === 'rain') initRain();
        pulseRings = [];
        pulseTimer = 0;
        auroraTime = 0;

        function loop() {
            switch (currentMode) {
                case 'particles': drawConstellation(); break;
                case 'pulse': drawPulse(); break;
                case 'aurora': drawAurora(); break;
                case 'rain': drawRain(); break;
                default: drawConstellation();
            }
            animId = requestAnimationFrame(loop);
        }
        loop();
    }

    resize();
    startMode('particles');

    window.addEventListener('resize', function () {
        resize();
        if (currentMode === 'particles') initConstellation();
        if (currentMode === 'rain') initRain();
    });

    // Expose setter for theme to call after async load
    window.setShowcaseAnimation = function (mode) {
        if (['particles', 'pulse', 'aurora', 'rain', 'none'].indexOf(mode) === -1) return;
        startMode(mode);
    };

    // If theme was already applied before init (rare), pick it up
    if (window._showcaseAnimation) {
        startMode(window._showcaseAnimation);
    }
}
