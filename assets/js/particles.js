/**
 * FitGlue Particle Constellation
 * Lightweight canvas particle system with connecting lines.
 * Usage: initParticles('canvas-id')
 */
function initParticles(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 60;
    var CONNECTION_DIST = 120;

    // Brand colours with low alpha
    var COLOURS = [
        'rgba(255, 0, 110, 0.6)',   // pink
        'rgba(131, 56, 236, 0.5)',  // purple
        'rgba(58, 134, 255, 0.4)',  // blue accent
        'rgba(255, 77, 148, 0.4)',  // light pink
        'rgba(157, 92, 245, 0.35)', // light purple
    ];

    function resize() {
        var parent = canvas.parentElement;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 2 + 0.5,
            colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
        };
    }

    function init() {
        resize();
        particles = [];
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        for (var i = 0; i < particles.length; i++) {
            for (var j = i + 1; j < particles.length; j++) {
                var dx = particles[i].x - particles[j].x;
                var dy = particles[i].y - particles[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DIST) {
                    var alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                    ctx.strokeStyle = 'rgba(131, 56, 236, ' + alpha + ')';
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

            // Glow effect
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.colour;
            ctx.fillStyle = p.colour;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = canvas.height + 10;
            if (p.y > canvas.height + 10) p.y = -10;
        }

        requestAnimationFrame(draw);
    }

    init();
    draw();

    window.addEventListener('resize', resize);
}
