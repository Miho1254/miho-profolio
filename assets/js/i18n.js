/**
 * Simple i18n logic for vanilla JS
 * Handles loading JSON language files and updating data-i18n attributes
 */

const VALID_LANGUAGES = ['vi', 'en', 'ja'];
const DEFAULT_LANGUAGE = 'vi';
let currentLang = localStorage.getItem('lang') || DEFAULT_LANGUAGE;
let langData = {};

// Store active intervals to clear them if language changes rapidly
const activeAnimations = new WeakMap();

/**
 * Check if the device is desktop (screen width >= 1024px)
 * @returns {boolean}
 */
function isDesktop() {
    return window.innerWidth >= 1024;
}

async function setLanguage(lang) {
    if (!VALID_LANGUAGES.includes(lang)) return;

    // Load language file
    try {
        const response = await fetch(`assets/lang/${lang}.json`);
        if (!response.ok) throw new Error(`Could not load ${lang}.json`);
        langData = await response.json();

        currentLang = lang;
        localStorage.setItem('lang', lang);

        // Update DOM
        updateContent();
        updateActiveButton();

        // Update HTML lang attribute for accessibility/SEO
        document.documentElement.lang = lang;

    } catch (error) {
        console.error('Error loading language:', error);
    }
}

function updateContent() {
    const elements = document.querySelectorAll('[data-i18n]');
    const isDesktopView = isDesktop();

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translatedValue = getNestedValue(langData, key);

        if (translatedValue) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translatedValue;
            } else {
                if (isDesktopView) {
                    animateTextChange(el, translatedValue);
                } else {
                    // Mobile: Instant switch
                    el.innerHTML = translatedValue;
                }
            }
        }
    });
}

/**
 * Animates text change: Backspace old text -> Typewriter new text
 * Handles HTML tags by removing/adding them as whole blocks
 * @param {HTMLElement} el 
 * @param {string} newText 
 */
function animateTextChange(el, newText) {
    // Stop any existing animation on this element
    if (activeAnimations.has(el)) {
        const { typeTimer, deleteTimer } = activeAnimations.get(el);
        clearTimeout(typeTimer);
        clearTimeout(deleteTimer);
    }

    // Identify if the content is actually changing
    if (el.innerHTML === newText) return;

    let currentHTML = el.innerHTML;
    const targetHTML = newText;

    // Config
    const deleteSpeed = 3;  // ms per char (super fast delete)
    const typeSpeed = 10;   // ms per char (fast typing)

    // Queue the steps
    const state = {
        typeTimer: null,
        deleteTimer: null
    };
    activeAnimations.set(el, state);

    // Step 1: Backspace
    function deleteStep() {
        if (currentHTML.length === 0) {
            // Done deleting, start typing
            // Small pause before typing
            state.typeTimer = setTimeout(typeStep, 100);
            return;
        }

        // Logic to remove last char or last tag
        if (currentHTML.endsWith('>')) {
            // Possible end of tag
            const openTagIndex = currentHTML.lastIndexOf('<');
            if (openTagIndex !== -1) {
                // Remove the whole tag
                currentHTML = currentHTML.substring(0, openTagIndex);
            } else {
                // Just a loose >, treat as char
                currentHTML = currentHTML.slice(0, -1);
            }
        } else if (currentHTML.endsWith(';')) {
            // Possible entity like &nbsp;
            const entityStart = currentHTML.lastIndexOf('&');
            if (entityStart !== -1 && currentHTML.length - entityStart < 10) {
                currentHTML = currentHTML.substring(0, entityStart);
            } else {
                currentHTML = currentHTML.slice(0, -1);
            }
        } else {
            currentHTML = currentHTML.slice(0, -1);
        }

        el.innerHTML = currentHTML;

        // Dynamic speed: faster if text is long
        state.deleteTimer = setTimeout(deleteStep, deleteSpeed);
    }

    // Step 2: Typewriter
    let typeIndex = 0;
    function typeStep() {
        if (typeIndex >= targetHTML.length) {
            // Ensure final state matches exactly (in case of logic drifts)
            el.innerHTML = targetHTML;
            activeAnimations.delete(el);
            return;
        }

        // Logic to add next char or next tag
        const char = targetHTML[typeIndex];

        if (char === '<') {
            // Start of tag, find end
            const closeTagIndex = targetHTML.indexOf('>', typeIndex);
            if (closeTagIndex !== -1) {
                el.innerHTML = targetHTML.substring(0, closeTagIndex + 1);
                typeIndex = closeTagIndex + 1;
            } else {
                // Malformed or just a < char
                el.innerHTML = targetHTML.substring(0, typeIndex + 1);
                typeIndex++;
            }
        } else if (char === '&') {
            // Entity
            const semiIndex = targetHTML.indexOf(';', typeIndex);
            if (semiIndex !== -1 && semiIndex - typeIndex < 10) {
                el.innerHTML = targetHTML.substring(0, semiIndex + 1);
                typeIndex = semiIndex + 1;
            } else {
                el.innerHTML = targetHTML.substring(0, typeIndex + 1);
                typeIndex++;
            }
        } else {
            el.innerHTML = targetHTML.substring(0, typeIndex + 1);
            typeIndex++;
        }

        state.typeTimer = setTimeout(typeStep, typeSpeed);
    }

    // Start
    deleteStep();
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj);
}

function updateActiveButton() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('font-bold', 'text-brand-accent');
            btn.classList.remove('text-brand-muted', 'dark:text-slate-400');
        } else {
            btn.classList.remove('font-bold', 'text-brand-accent');
            btn.classList.add('text-brand-muted', 'dark:text-slate-400');
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.dataset.lang;
            // Only update if different language
            if (lang !== currentLang) {
                setLanguage(lang);
            }
        });
    });

    // Initial load without animation
    // Force immediate update for first load or mobile
    // We can just call setLanguage but we want to skip animation on first load usually.
    // But setLanguage calls updateContent which checks isDesktop. 
    // Let's manually load payload first to avoid animating on page refresh if we want.
    // For now, let's just let it run standard logic, 
    // but maybe we want to skip animation on initial load?
    // The current logic in setLanguage sets currentLang then calls updateContent.
    // If we call setLanguage(currentLang) it will fetch and update.
    // If we want no animation on init, we can pass a flag or just handle it.
    // Since 'innerHTML' matches 'translatedValue' likely on first render (if static HTML matches), 
    // the animateTextChange early returns if content is same. 
    // BUT static HTML is in VI, if cached lang is EN, it will animate VI -> EN on load.
    // User might like that or hate it. 
    // User request: "chuyển ngôn ngữ nó sẽ có hiệu ứng". Implies explicit switch action.
    // I will refactor init to be instant.

    (async () => {
        if (!VALID_LANGUAGES.includes(currentLang)) return;
        try {
            const response = await fetch(`assets/lang/${currentLang}.json`);
            langData = await response.json();

            // Instant update for init
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const val = getNestedValue(langData, key);
                if (val) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = val;
                    else el.innerHTML = val;
                }
            });
            updateActiveButton();
            document.documentElement.lang = currentLang;
        } catch (e) { console.error(e); }
    })();
});
