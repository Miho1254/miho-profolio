/**
 * Simple i18n logic for vanilla JS
 * Handles loading JSON language files and updating data-i18n attributes
 */

const VALID_LANGUAGES = ['vi', 'en', 'ja'];
const DEFAULT_LANGUAGE = 'vi';
let currentLang = localStorage.getItem('lang') || DEFAULT_LANGUAGE;
let langData = {};

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
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translatedValue = getNestedValue(langData, key);

        if (translatedValue) {
            // Handle HTML content if needed (for things like <strong>)
            // or just textContent for safety. 
            // Since we control JSON, innerHTML is relatively safe here 
            // if we trust our own translation files.
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translatedValue;
            } else {
                el.innerHTML = translatedValue;
            }
        }
    });
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
            setLanguage(lang);
        });
    });

    setLanguage(currentLang);
});
