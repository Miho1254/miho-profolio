/**
 * Hero Title Typewriter Animation
 * Cycles through Vietnamese, English, and Japanese phrases for the hero section.
 */

const phrases = [
    {
        line1: "Sáng tạo và",
        line2: "nỗ lực không ngừng"
    },
    {
        line1: "Creativity and",
        line2: "Relentless Effort"
    },
    {
        line1: "創造性と",
        line2: "絶え間ない努力"
    }
];

const typingSpeed = 100;    // ms per char
const erasingSpeed = 50;    // ms per char
const delayBetweenLines = 300; // delay before typing line 2
const pauseDuration = 3000; // ms to wait before erasing

let currentPhraseIndex = 0;
let isDeleting = false;
let charIndex1 = 0;
let charIndex2 = 0;
let isLine1Complete = false;

const elementLine1 = document.getElementById('hero-title-1');
const elementLine2 = document.getElementById('hero-title-2');

function typeEffect() {
    if (!elementLine1 || !elementLine2) return;

    const currentPhrase = phrases[currentPhraseIndex];

    // Typing Logic
    if (!isDeleting) {
        // Type Line 1 first
        if (!isLine1Complete) {
            elementLine1.textContent = currentPhrase.line1.substring(0, charIndex1 + 1);
            charIndex1++;

            if (charIndex1 === currentPhrase.line1.length) {
                isLine1Complete = true;
                setTimeout(typeEffect, delayBetweenLines);
                return;
            }
        }
        // Then Type Line 2
        else {
            elementLine2.textContent = currentPhrase.line2.substring(0, charIndex2 + 1);
            charIndex2++;
        }

        // Check if full phrase is complete
        if (isLine1Complete && charIndex2 === currentPhrase.line2.length) {
            isDeleting = true;
            setTimeout(typeEffect, pauseDuration);
        } else {
            setTimeout(typeEffect, typingSpeed);
        }
    }
    // Erasing Logic
    else {
        // Erase Line 2 first
        if (charIndex2 > 0) {
            elementLine2.textContent = currentPhrase.line2.substring(0, charIndex2 - 1);
            charIndex2--;
            setTimeout(typeEffect, erasingSpeed);
        }
        // Then Erase Line 1
        else if (charIndex1 > 0) {
            isLine1Complete = false; // Reset line 1 status
            elementLine1.textContent = currentPhrase.line1.substring(0, charIndex1 - 1);
            charIndex1--;
            setTimeout(typeEffect, erasingSpeed);
        }
        // Move to next phrase
        else {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            setTimeout(typeEffect, 500);
        }
    }
}

// Start animation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Clear initial content to avoid flash
    if (elementLine1) elementLine1.textContent = '';
    if (elementLine2) elementLine2.textContent = '';

    // Initial delay before starting
    setTimeout(typeEffect, 1000);
});
