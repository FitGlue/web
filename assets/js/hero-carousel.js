/**
 * Hero Carousel — fetches the demo-hero-carousel.json, parses
 * the description into rendered section cards, and crossfades
 * through them in randomised order.
 */
(function () {
    'use strict';

    const CROSSFADE_MS = 4000;
    const TRANSITION_MS = 600;

    /* ---- Section Parsers ---- */

    /** Detect section boundaries using the G40 emoji-header pattern. */
    function parseSections(desc) {
        const lines = desc.split('\n');
        const sections = [];
        let current = null;

        for (const line of lines) {
            // Match "emoji Title:" or "emoji Title" at start of line
            const headerMatch = line.match(
                /^([\p{Emoji_Presentation}\p{Extended_Pictographic}][\uFE0F\u200D]*(?:[\p{Emoji_Presentation}\p{Extended_Pictographic}][\uFE0F\u200D]*)*)\s+(.+?):\s*$/u
            );
            if (headerMatch) {
                if (current) sections.push(current);
                current = {
                    emoji: headerMatch[1],
                    title: headerMatch[2].trim(),
                    content: '',
                };
                continue;
            }
            // Second pattern: lines like "emoji Title" without trailing colon but with content on next lines
            const headerMatch2 = line.match(
                /^([\p{Emoji_Presentation}\p{Extended_Pictographic}][\uFE0F\u200D]*(?:[\p{Emoji_Presentation}\p{Extended_Pictographic}][\uFE0F\u200D]*)*)\s+(.+)/u
            );
            if (
                headerMatch2 &&
                !line.startsWith('•') &&
                !line.startsWith('  ') &&
                !current
            ) {
                if (current) sections.push(current);
                current = {
                    emoji: headerMatch2[1],
                    title: headerMatch2[2].replace(/:$/, '').trim(),
                    content: '',
                };
                continue;
            }
            if (current) {
                if (line.trim() === '' && current.content.trim() === '') continue;
                current.content += line + '\n';
            }
        }
        if (current) sections.push(current);
        return sections;
    }

    /* ---- Section Renderers ---- */

    /** Pick which renderer to use based on section title. */
    function renderSection(section) {
        const t = section.title.toLowerCase();
        if (t.includes('heart rate zones')) return renderHRZones(section);
        if (t.includes('heart rate')) return renderHeartRate(section);
        if (t.includes('personal record')) return renderPRs(section);
        if (t.includes('muscle heatmap')) return renderMuscleHeatmap(section);
        if (t.includes('goal progress')) return renderGoalProgress(section);
        if (t.includes('streak')) return renderStreak(section);
        if (t.includes('effort score')) return renderEffortScore(section);
        if (t.includes('elevation')) return renderElevation(section);
        if (t.includes('calories')) return renderCalories(section);
        if (t.includes('training load')) return renderTrainingLoad(section);
        if (t.includes('recovery')) return renderRecovery(section);
        if (t.includes('intervals')) return renderIntervals(section);
        if (t.includes('parkrun')) return renderParkrun(section);
        if (t.includes('milestones')) return renderMilestones(section);
        if (t.includes('running dynamics')) return renderRunningDynamics(section);
        if (t.includes('workout summary')) return renderWorkoutSummary(section);
        if (t.includes('conditions') || t.includes('location') || t.includes('weather'))
            return renderConditions(section);
        // Default: text card
        return renderTextCard(section);
    }

    function card(emoji, title, inner) {
        return `<div class="hc-card">
      <div class="hc-card-header"><h3>${emoji} ${title}</h3></div>
      <div class="hc-card-body">${inner}</div>
    </div>`;
    }

    function renderTextCard(s) {
        const text = s.content.trim().split('\n').slice(0, 3).join('<br>');
        return card(s.emoji, s.title, `<p class="hc-text">${text}</p>`);
    }

    function renderHeartRate(s) {
        const lines = s.content.trim().split('\n');
        const vals = {};
        for (const l of lines) {
            const m = l.match(/(\d+)\s*bpm\s*(min|avg|max)/i);
            if (m) vals[m[2].toLowerCase()] = m[1];
            const dm = l.match(/Drift:\s*([+-]?\d+)\s*bpm\s*\((.+)\)/);
            if (dm) { vals.drift = dm[1]; vals.driftLabel = dm[2]; }
        }
        return card(s.emoji, s.title, `
      <div class="hc-hr-grid">
        <div class="hc-hr-stat"><span class="hc-hr-val">${vals.min || '-'}</span><span class="hc-hr-label">MIN</span></div>
        <div class="hc-hr-stat hc-hr-avg"><span class="hc-hr-val">${vals.avg || '-'}</span><span class="hc-hr-label">AVG</span></div>
        <div class="hc-hr-stat"><span class="hc-hr-val">${vals.max || '-'}</span><span class="hc-hr-label">MAX</span></div>
      </div>
      ${vals.drift ? `<div class="hc-hr-drift">${vals.drift} bpm drift · ${vals.driftLabel}</div>` : ''}`);
    }

    function renderHRZones(s) {
        const zones = [];
        for (const l of s.content.trim().split('\n')) {
            const m = l.match(/Zone\s+(\d)\s*\(([^)]+)\):\s*(.*)/);
            if (m) {
                const filled = (m[3].match(/🟦|🟩|🟨|🟧|🟥/g) || []).length;
                const colors = ['#4CC9F0', '#22C55E', '#EAB308', '#F97316', '#EF4444'];
                zones.push({ num: m[1], name: m[2], filled, color: colors[parseInt(m[1]) - 1] || '#888' });
            }
        }
        const bars = zones
            .map(
                (z) =>
                    `<div class="hc-zone-row">
        <span class="hc-zone-label">Z${z.num}</span>
        <div class="hc-zone-bar"><div class="hc-zone-fill" style="width:${z.filled * 20}%;background:${z.color}"></div></div>
        <span class="hc-zone-name">${z.name}</span>
      </div>`
            )
            .join('');
        return card(s.emoji, s.title, `<div class="hc-zones">${bars}</div>`);
    }

    function renderPRs(s) {
        const lines = s.content.trim().split('\n').filter(l => l.startsWith('•'));
        const chips = lines.slice(0, 4).map((l) => {
            const stripped = l.replace(/^•\s*/, '');
            const emoji = [...stripped][0] || '🏆';
            let rest = stripped.slice(emoji.length).trim();
            // Try to parse "Name Type: value (improvement)"
            const m = rest.match(/^(.+?):\s*(.+?)(?:\s*\(.*?([+-][\d.]+%)\))?$/);
            if (m) {
                const isPos = !m[3] || !m[3].startsWith('-');
                return `<div class="hc-pr-chip">
          <span class="hc-pr-val">${m[2].trim()}</span>
          <span class="hc-pr-name">${m[1].trim()}</span>
          ${m[3] ? `<span class="hc-pr-imp ${isPos ? 'pos' : 'neg'}">${isPos ? '▲' : '▼'} ${m[3]}</span>` : ''}
        </div>`;
            }
            return `<div class="hc-pr-chip"><span class="hc-pr-val">${rest}</span></div>`;
        }).join('');
        return card(s.emoji, s.title, `<div class="hc-pr-grid">${chips}</div>`);
    }

    function renderMuscleHeatmap(s) {
        const muscles = [];
        for (const l of s.content.trim().split('\n')) {
            const m = l.match(/^(.+?):\s*(🟪*)/);
            if (m) muscles.push({ name: m[1].trim(), level: m[2].length });
        }
        const bars = muscles
            .map(
                (m) =>
                    `<div class="hc-muscle-row">
        <span class="hc-muscle-name">${m.name}</span>
        <div class="hc-muscle-bar"><div class="hc-muscle-fill" style="width:${m.level * 20}%"></div></div>
      </div>`
            )
            .join('');
        return card(s.emoji, s.title, `<div class="hc-muscles">${bars}</div>`);
    }

    function renderGoalProgress(s) {
        const lines = s.content.trim().split('\n');
        let pct = 0, label = '';
        for (const l of lines) {
            const pm = l.match(/(\d+)%/);
            if (pm) pct = parseInt(pm[1]);
            const km = l.match(/([\d.]+)\/([\d.]+)\s*km/);
            if (km) label = `${km[1]} / ${km[2]} km`;
        }
        return card(s.emoji, s.title, `
      <div class="hc-goal">
        <div class="hc-goal-bar"><div class="hc-goal-fill" style="width:${pct}%"></div></div>
        <div class="hc-goal-info"><span class="hc-goal-pct">${pct}%</span><span class="hc-goal-label">${label}</span></div>
      </div>`);
    }

    function renderStreak(s) {
        const m = s.content.match(/(\d+)-day/);
        const days = m ? m[1] : '?';
        const isPB = /personal best/i.test(s.content);
        return card(s.emoji, s.title, `
      <div class="hc-streak">
        <div class="hc-streak-num">${days}</div>
        <div class="hc-streak-label">day streak 🔥</div>
        ${isPB ? '<div class="hc-streak-pb">🏆 New personal best!</div>' : ''}
      </div>`);
    }

    function renderEffortScore(s) {
        const m = s.content.match(/(\d+)\/100\s*\((\w+)\)/);
        const score = m ? parseInt(m[1]) : 0;
        const label = m ? m[2] : '';
        return card(s.emoji, s.title, `
      <div class="hc-effort">
        <svg class="hc-effort-gauge" viewBox="0 0 100 60">
          <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="8" stroke-linecap="round"/>
          <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="url(#effortGrad)" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="${score * 1.26} 126"/>
          <defs><linearGradient id="effortGrad"><stop offset="0%" stop-color="#22C55E"/><stop offset="50%" stop-color="#EAB308"/><stop offset="100%" stop-color="#EF4444"/></linearGradient></defs>
        </svg>
        <div class="hc-effort-val">${score}<span>/100</span></div>
        <div class="hc-effort-label">${label}</div>
      </div>`);
    }

    function renderElevation(s) {
        const gm = s.content.match(/\+(\d+)m gain/);
        const lm = s.content.match(/-(\d+)m loss/);
        const mm = s.content.match(/(\d+)m max/);
        const profile = s.content.match(/(▁[▁▂▃▄▅▆▇█]+)/);
        return card(s.emoji, s.title, `
      <div class="hc-elev">
        <div class="hc-elev-stats">
          <span>↑ ${gm ? gm[1] : '-'}m</span>
          <span>↓ ${lm ? lm[1] : '-'}m</span>
          <span>⛰ ${mm ? mm[1] : '-'}m</span>
        </div>
        ${profile ? `<div class="hc-elev-profile">${profile[1]}</div>` : ''}
      </div>`);
    }

    function renderCalories(s) {
        const m = s.content.match(/([\d,]+)\s*kcal/);
        const eq = s.content.match(/≈\s*(.+)/);
        return card(s.emoji, s.title, `
      <div class="hc-cal">
        <div class="hc-cal-val">${m ? m[1] : '-'}<span>kcal</span></div>
        ${eq ? `<div class="hc-cal-eq">${eq[1].trim()}</div>` : ''}
      </div>`);
    }

    function renderTrainingLoad(s) {
        const m = s.content.match(/(\d+)\s*\((\w+)\)/);
        return card(s.emoji, s.title, `
      <div class="hc-load">
        <div class="hc-load-val">${m ? m[1] : '-'}</div>
        <div class="hc-load-label">${m ? m[2] : 'TRIMP'}</div>
      </div>`);
    }

    function renderRecovery(s) {
        const m = s.content.match(/(\d+)\s*hours/);
        return card(s.emoji, s.title, `
      <div class="hc-recovery">
        <div class="hc-recovery-val">${m ? m[1] : '36'}<span>h</span></div>
        <div class="hc-recovery-label">suggested recovery</div>
      </div>`);
    }

    function renderIntervals(s) {
        const lines = s.content.trim().split('\n');
        // Find sprint set summary lines
        const sets = lines.filter(l => /^\s*💨\s*\d+×/.test(l)).slice(0, 3);
        const items = sets.map(l => {
            const m = l.match(/💨\s*(.+?):\s*avg\s*(.+?),/);
            if (m) return `<div class="hc-int-row"><span class="hc-int-set">${m[1]}</span><span class="hc-int-pace">${m[2]}</span></div>`;
            return '';
        }).join('');
        return card(s.emoji, s.title, `<div class="hc-intervals">${items}</div>`);
    }

    function renderParkrun(s) {
        const tm = s.content.match(/Time:\s*([\d:]+)/);
        const isPB = /PB/i.test(s.content);
        const pm = s.content.match(/Position:\s*([\d/]+)/);
        return card(s.emoji, s.title, `
      <div class="hc-parkrun">
        <div class="hc-parkrun-time">${tm ? tm[1] : '-'}</div>
        ${isPB ? '<div class="hc-parkrun-pb">🏆 All-time PB!</div>' : ''}
        ${pm ? `<div class="hc-parkrun-pos">Position: ${pm[1]}</div>` : ''}
      </div>`);
    }

    function renderMilestones(s) {
        const km = s.content.match(/([\d.]+)\s*km total/);
        const next = s.content.match(/Next milestone:\s*(.+?)(?:\n|$)/);
        return card(s.emoji, s.title, `
      <div class="hc-miles">
        <div class="hc-miles-val">${km ? km[1] : '-'}<span>km</span></div>
        ${next ? `<div class="hc-miles-next">🎯 ${next[1].trim()}</div>` : ''}
      </div>`);
    }

    function renderRunningDynamics(s) {
        const gct = s.content.match(/GCT:\s*(\d+)\s*ms/);
        const stride = s.content.match(/Stride:\s*([\d.]+)\s*m/);
        const vert = s.content.match(/Vert:\s*([\d.]+)\s*cm/);
        return card(s.emoji, s.title, `
      <div class="hc-dynamics">
        <div class="hc-dyn-stat"><span class="hc-dyn-val">${gct ? gct[1] : '-'}</span><span class="hc-dyn-label">GCT (ms)</span></div>
        <div class="hc-dyn-stat"><span class="hc-dyn-val">${stride ? stride[1] : '-'}</span><span class="hc-dyn-label">Stride (m)</span></div>
        <div class="hc-dyn-stat"><span class="hc-dyn-val">${vert ? vert[1] : '-'}</span><span class="hc-dyn-label">Vert (cm)</span></div>
      </div>`);
    }

    function renderWorkoutSummary(s) {
        const lines = s.content.trim().split('\n');
        const headline = lines[0] || '';
        const exercises = lines.filter(l => l.startsWith('•')).slice(0, 4);
        const exHtml = exercises.map(e =>
            `<div class="hc-ws-ex">${e.replace(/^•\s*/, '')}</div>`
        ).join('');
        return card(s.emoji, s.title, `
      <div class="hc-workout">
        <div class="hc-ws-headline">${headline}</div>
        <div class="hc-ws-list">${exHtml}</div>
      </div>`);
    }

    function renderConditions(s) {
        const loc = s.content.match(/Location:\s*(.+?)(?:\n|$)/);
        const weather = s.content.match(/Weather:\s*(.+?)(?:\n|$)/);
        // Merge the two sub-sections
        const locLine = loc ? loc[1].trim() : '';
        const wxLine = weather ? weather[1].trim() : '';
        // From description, location and weather are separate sections; combine them
        const parts = s.content.trim().split('\n').filter(l => l.trim());
        return card(s.emoji, s.title, `
      <div class="hc-conditions">
        ${parts.map(p => `<div class="hc-cond-line">${p.replace(/^•\s*/, '')}</div>`).join('')}
      </div>`);
    }

    /* ---- Carousel Engine ---- */

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function initCarousel(container, slides) {
        if (!slides.length) return;
        let idx = 0;
        const order = shuffle([...Array(slides.length).keys()]);

        // Insert first slide
        container.innerHTML = slides[order[0]];
        const first = container.firstElementChild;
        if (first) first.classList.add('hc-active');

        setInterval(() => {
            idx = (idx + 1) % order.length;
            const next = document.createElement('div');
            next.innerHTML = slides[order[idx]];
            const newSlide = next.firstElementChild;
            if (!newSlide) return;
            newSlide.classList.add('hc-entering');
            container.appendChild(newSlide);

            // Force reflow
            newSlide.offsetHeight;
            newSlide.classList.remove('hc-entering');
            newSlide.classList.add('hc-active');

            const old = container.querySelector('.hc-active:not(:last-child)');
            if (old) {
                old.classList.remove('hc-active');
                old.classList.add('hc-exiting');
                setTimeout(() => old.remove(), TRANSITION_MS);
            }
        }, CROSSFADE_MS);
    }

    /* ---- Init ---- */

    async function boot() {
        const container = document.getElementById('hero-carousel');
        if (!container) return;

        try {
            const resp = await fetch('/demo-hero-carousel.json');
            if (!resp.ok) return;
            const data = await resp.json();
            const desc = data.description || '';

            // Split on double newlines that precede emoji section headers
            const sections = parseSections(desc);

            // Filter to the most visually interesting sections
            const wanted = [
                'heart rate zones',
                'personal record',
                'muscle heatmap',
                'effort score',
                'goal progress',
                'streak',
                'heart rate',
                'elevation',
                'calories',
                'training load',
                'intervals',
                'parkrun',
                'running dynamics',
                'milestones',
                'workout summary',
                'recovery',
            ];

            const filtered = sections.filter((s) => {
                const t = s.title.toLowerCase();
                return wanted.some((w) => t.includes(w));
            });

            const slides = filtered.map(renderSection);
            initCarousel(container, slides);
        } catch (e) {
            // Silently degrade — carousel just stays empty
            console.warn('Hero carousel failed to load:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
