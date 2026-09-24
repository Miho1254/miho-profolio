/**
 * Wayfinding Metro Line & Floating Transit HUD
 * Architecture: Dedicated Left-Gutter Wayfinding Spine & Station Branch Spurs
 * 
 * The mainline track runs along a disciplined vertical spine in the safe left gutter,
 * completely avoiding content columns and cards. At each section milestone,
 * an authentic subway turnout spur branches into the station marker.
 */

(function () {
    'use strict';

    let bedTrack = null;
    let baseTrack = null;
    let glowTrack = null;
    let activeTrack = null;
    let metroStations = null;
    let scout = null;
    let mainEl = null;

    let hudActiveTrack = null;
    let hudProgressText = null;
    let hudStations = [];

    let stationsData = [];
    let totalLength = 0;
    let isTicking = false;
    let resizeTimer = null;
    let currentActiveIndex = 0;

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const STATION_METADATA = [
        { code: '00', shortCode: 'START', label: '00 // HERO', target: '#intro' },
        { code: '01', shortCode: 'EDU', label: '01 // HỌC VẤN', target: '#education-awards' },
        { code: '02', shortCode: 'TECH', label: '02 // TOOLKIT', target: '#skills' },
        { code: '03', shortCode: 'EXP', label: '03 // KINH NGHIỆM', target: '#experience' },
        { code: '04', shortCode: 'R&D', label: '04 // NGHIÊN CỨU', target: '#research' },
        { code: '05', shortCode: 'PROJ', label: '05 // DỰ ÁN', target: '#projects' },
        { code: '06', shortCode: 'BLOG', label: '06 // BLOG', target: '#blog' },
        { code: '07', shortCode: 'HI', label: '07 // LIÊN HỆ', target: '#contact' },
    ];

    function init() {
        bedTrack = document.getElementById('metro-track-bed');
        baseTrack = document.getElementById('metro-track-base');
        glowTrack = document.getElementById('metro-track-glow');
        activeTrack = document.getElementById('metro-track-active');
        metroStations = document.getElementById('metro-stations');
        scout = document.getElementById('metro-scout');
        mainEl = document.getElementById('main-content');

        hudActiveTrack = document.getElementById('hud-active-track');
        hudProgressText = document.getElementById('hud-progress-text');
        hudStations = Array.from(document.querySelectorAll('.hud-station'));

        if (!baseTrack || !activeTrack || !metroStations || !scout || !mainEl) {
            return;
        }

        buildPath();
        initHUDInteractions();

        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        window.addEventListener('orientationchange', onResize, { passive: true });
        window.addEventListener('load', () => {
            buildPath();
            updateOnScroll();
        });

        if (window.ResizeObserver && mainEl) {
            const ro = new ResizeObserver(() => {
                onResize();
            });
            ro.observe(mainEl);
        }

        // Initial scroll position sync
        requestScrollUpdate();
    }

    function getUntransformedMainPos(el, main) {
        const elRect = el.getBoundingClientRect();
        const mainRect = main.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;

        let offTop = 0;
        let offLeft = 0;
        let curr = el;
        let foundMain = false;

        while (curr && curr !== document.body && curr !== document.documentElement) {
            if (curr === main) {
                foundMain = true;
                break;
            }
            offTop += curr.offsetTop;
            offLeft += curr.offsetLeft;
            curr = curr.offsetParent;
        }

        if (foundMain) {
            return {
                xRaw: offLeft,
                y: Math.round(offTop + (el.offsetHeight / 2)),
                absoluteTop: (mainRect.top + scrollY) + offTop
            };
        }

        return {
            xRaw: Math.round(elRect.left - mainRect.left),
            y: Math.round((elRect.top + scrollY) - (mainRect.top + scrollY) + (elRect.height / 2)),
            absoluteTop: elRect.top + scrollY
        };
    }

    function buildPath() {
        if (window.innerWidth < 768) {
            // Disabled entirely on mobile viewports (< 768px)
            if (bedTrack) bedTrack.setAttribute('d', '');
            if (baseTrack) baseTrack.setAttribute('d', '');
            if (glowTrack) glowTrack.setAttribute('d', '');
            if (activeTrack) activeTrack.setAttribute('d', '');
            if (metroStations) metroStations.innerHTML = '';
            if (scout) scout.classList.add('opacity-0');
            totalLength = 0;
            return;
        }

        const stationElements = document.querySelectorAll('[data-station]');
        if (!stationElements.length || !mainEl) return;

        stationsData = [];
        let minRawX = Infinity;

        stationElements.forEach((el, index) => {
            const pos = getUntransformedMainPos(el, mainEl);

            if (pos.xRaw < minRawX) minRawX = pos.xRaw;

            stationsData.push({
                index: index,
                xRaw: pos.xRaw,
                y: pos.y,
                absoluteTop: pos.absoluteTop
            });
        });

        if (stationsData.length < 2) return;

        // Dedicated Spine X coordinate in the left gutter
        // On desktop/tablet, place spine 44px to the left of the milestone stations.
        // On mobile, clamp to safe margin (14px).
        const isDesktopView = window.innerWidth >= 768;
        let spineX = Math.round(minRawX - (isDesktopView ? 44 : 14));
        if (spineX < 14) spineX = 14;

        stationsData.forEach((st) => {
            st.spineX = spineX;
            // Target X docks 14px before the milestone badge
            st.targetX = Math.max(spineX + 16, Math.round(st.xRaw - 14));
        });

        const firstY = stationsData[0].y;
        const lastY = stationsData[stationsData.length - 1].y;
        const startY = Math.max(0, firstY - 40);
        const endY = lastY + 60;

        // Straight, disciplined vertical mainline path
        const dMain = `M ${spineX} ${startY} L ${spineX} ${endY}`;

        if (bedTrack) bedTrack.setAttribute('d', dMain);
        if (baseTrack) baseTrack.setAttribute('d', dMain);
        if (glowTrack) glowTrack.setAttribute('d', dMain);
        activeTrack.setAttribute('d', dMain);

        totalLength = activeTrack.getTotalLength();

        if (isReducedMotion) {
            activeTrack.style.strokeDasharray = 'none';
            activeTrack.style.strokeDashoffset = '0';
            if (glowTrack) {
                glowTrack.style.strokeDasharray = 'none';
                glowTrack.style.strokeDashoffset = '0';
            }
        } else {
            activeTrack.style.strokeDasharray = `${totalLength} ${totalLength}`;
            activeTrack.style.strokeDashoffset = `${totalLength}`;
            if (glowTrack) {
                glowTrack.style.strokeDasharray = `${totalLength} ${totalLength}`;
                glowTrack.style.strokeDashoffset = `${totalLength}`;
            }
        }

        renderStations();
    }

    function renderStations() {
        if (!metroStations) return;
        metroStations.innerHTML = '';

        stationsData.forEach((st) => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'station-node-group');
            g.setAttribute('data-station-index', st.index);

            const dx = st.targetX - st.spineX;
            let spurPath = '';

            if (dx > 20) {
                // Smooth railway turnout curve
                const radius = Math.min(20, Math.floor(dx * 0.45));
                spurPath = `M ${st.spineX} ${st.y - radius} Q ${st.spineX} ${st.y}, ${st.spineX + radius} ${st.y} L ${st.targetX} ${st.y}`;
            } else {
                // Direct horizontal spur
                spurPath = `M ${st.spineX} ${st.y} L ${st.targetX} ${st.y}`;
            }

            g.innerHTML = `
                <!-- Base dashed spur (blueprint guide) -->
                <path class="station-spur-base stroke-slate-300 dark:stroke-slate-800 transition-colors duration-300" d="${spurPath}" fill="none" stroke-width="2" stroke-dasharray="4 4" />

                <!-- Active solid spur (illuminates when active) -->
                <path class="station-spur-active stroke-blue-700 dark:stroke-blue-400 opacity-0 transition-all duration-300" d="${spurPath}" fill="none" stroke-width="2.5" stroke-linecap="round" />

                <!-- Mainline junction switch dot -->
                <circle class="junction-dot transition-all duration-300 fill-slate-400 dark:fill-slate-600" cx="${st.spineX}" cy="${st.y}" r="3" />

                <!-- Station terminal at section header -->
                <g class="station-terminal" transform="translate(${st.targetX}, ${st.y})">
                    <!-- Halo pulse -->
                    <circle class="station-halo transition-all duration-300" cx="0" cy="0" r="14" fill="none" opacity="0"></circle>
                    <!-- Outer ring -->
                    <circle class="station-outer transition-all duration-300 fill-white dark:fill-brand-darkBg stroke-2 stroke-slate-400 dark:stroke-slate-600" cx="0" cy="0" r="6"></circle>
                    <!-- Inner core -->
                    <circle class="station-inner transition-all duration-300 fill-slate-400 dark:fill-slate-600" cx="0" cy="0" r="2.5"></circle>
                    <!-- Connecting tick directly docking into milestone badge -->
                    <line x1="6" y1="0" x2="14" y2="0" class="station-tick stroke-slate-300 dark:stroke-slate-700 transition-colors duration-300" stroke-width="2" stroke-linecap="round" />
                </g>
            `;

            metroStations.appendChild(g);
        });
    }

    function requestScrollUpdate() {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateOnScroll();
                isTicking = false;
            });
            isTicking = true;
        }
    }

    function updateOnScroll() {
        if (window.innerWidth < 768) return;
        if (totalLength === 0 || !activeTrack) return;

        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;

        if (!isReducedMotion) {
            const drawLength = totalLength * progress;
            const drawOffset = `${Math.max(0, totalLength - drawLength)}`;
            activeTrack.style.strokeDashoffset = drawOffset;
            if (glowTrack) glowTrack.style.strokeDashoffset = drawOffset;

            // Update scout position
            if (drawLength > 4 && scout) {
                const currentPoint = activeTrack.getPointAtLength(drawLength);
                scout.setAttribute('transform', `translate(${currentPoint.x}, ${currentPoint.y})`);
                scout.classList.remove('opacity-0');
            } else if (scout) {
                scout.classList.add('opacity-0');
            }
        }

        // Update Desktop HUD
        if (hudActiveTrack) {
            hudActiveTrack.style.height = `${Math.round(progress * 100)}%`;
        }
        if (hudProgressText) {
            hudProgressText.textContent = `${Math.round(progress * 100)}%`;
        }

        // Check station activation
        const currentViewportTriggerY = window.scrollY + (window.innerHeight * 0.52);
        let activeIdx = 0;

        stationsData.forEach((st, idx) => {
            const isReached = currentViewportTriggerY >= st.absoluteTop;
            if (isReached) {
                activeIdx = idx;
            }
            if (metroStations && metroStations.children[idx]) {
                const group = metroStations.children[idx];
                if (isReached) {
                    group.classList.add('station-active');
                } else {
                    group.classList.remove('station-active');
                }
            }
        });

        currentActiveIndex = activeIdx;

        // Update HUD station dots
        if (hudStations && hudStations.length) {
            hudStations.forEach((btn, idx) => {
                btn.classList.remove('active', 'passed');
                if (idx === activeIdx) {
                    btn.classList.add('active');
                } else if (idx < activeIdx) {
                    btn.classList.add('passed');
                }
            });
        }
    }

    function initHUDInteractions() {
        if (hudStations && hudStations.length) {
            hudStations.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetSelector = btn.getAttribute('data-target');
                    if (!targetSelector) return;
                    const targetEl = document.querySelector(targetSelector);
                    if (targetEl) {
                        const targetY = targetEl.getBoundingClientRect().top + window.scrollY - 70;
                        window.scrollTo({
                            top: Math.max(0, targetY),
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }
    }

    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            buildPath();
            updateOnScroll();
        }, 120);
    }

    // Expose global refresh function for dynamic content (e.g. blog posts loaded)
    window.refreshMetroLine = function () {
        buildPath();
        updateOnScroll();
    };

    if (document.fonts) {
        document.fonts.ready.then(() => {
            buildPath();
            updateOnScroll();
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
