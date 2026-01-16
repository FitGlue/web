/**
 * FitGlue Magic Animations
 * Handles rotating platform labels, counter animations, and interactive effects
 */

(function () {
  'use strict';

  // Platform rotation data
  const sources = [
    { icon: '🏋️', label: 'Hevy' },
    { icon: '⌚', label: 'Fitbit' },
    { icon: '⌚', label: 'Garmin' },
    { icon: '🍎', label: 'Apple Health' }
  ];

  const destinations = [
    { icon: '🚴', label: 'Strava' },
    { icon: '📊', label: 'TrainingPeaks' },
    { icon: '📈', label: 'Intervals.icu' }
  ];

  let sourceIndex = 0;
  let destIndex = 0;

  /**
   * Rotate platform labels with smooth fade transition
   */
  function rotatePlatforms() {
    const sourceEl = document.getElementById('flow-source');
    const destEl = document.getElementById('flow-destination');

    if (!sourceEl || !destEl) return;

    const sourceIcon = sourceEl.querySelector('.flow-icon');
    const sourceLabel = sourceEl.querySelector('.flow-label');
    const destIcon = destEl.querySelector('.flow-icon');
    const destLabel = destEl.querySelector('.flow-label');

    if (!sourceIcon || !sourceLabel || !destIcon || !destLabel) return;

    // Fade out
    sourceIcon.style.opacity = '0';
    sourceLabel.style.opacity = '0';
    destIcon.style.opacity = '0';
    destLabel.style.opacity = '0';

    setTimeout(() => {
      // Update content
      sourceIndex = (sourceIndex + 1) % sources.length;
      destIndex = (destIndex + 1) % destinations.length;

      sourceIcon.textContent = sources[sourceIndex].icon;
      sourceLabel.textContent = sources[sourceIndex].label;
      destIcon.textContent = destinations[destIndex].icon;
      destLabel.textContent = destinations[destIndex].label;

      // Fade in
      sourceIcon.style.opacity = '1';
      sourceLabel.style.opacity = '1';
      destIcon.style.opacity = '1';
      destLabel.style.opacity = '1';
    }, 300);
  }

  /**
   * Animate counter from 0 to target value
   */
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    const suffix = element.textContent.replace(/[\d,]/g, ''); // Keep "+", etc.

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeProgress);

      element.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Initialize counter animations when elements scroll into view
   */
  function initCounterAnimations() {
    const statValues = document.querySelectorAll('.trust-stat-value');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent || '';
          const numMatch = text.match(/[\d,]+/);

          if (numMatch) {
            const target = parseInt(numMatch[0].replace(/,/g, ''), 10);
            el.textContent = '0' + text.replace(/[\d,]+/, '');
            animateCounter(el, target);
            observer.unobserve(el);
          }
        }
      });
    }, { threshold: 0.5 });

    statValues.forEach(el => observer.observe(el));
  }

  /**
   * Initialize scroll-triggered animations
   */
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .stagger-children');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => observer.observe(el));
  }

  /**
   * Add header scroll effect
   */
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /**
   * Initialize all animations
   */
  function init() {
    // Start platform rotation (every 4 seconds)
    setInterval(rotatePlatforms, 4000);

    // Initialize counters
    initCounterAnimations();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize header scroll effect
    initHeaderScroll();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
