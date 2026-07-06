/* ============================================================
   FindYourQari — Shared JavaScript
   Roster data + nav/modal/toast logic, reused across pages.
   Path-aware: works whether loaded from / or /blog/
   ============================================================ */

// ---- Path helper: blog pages live one level deep ----
const SITE_ROOT = window.location.pathname.includes('/blog/') ? '../' : './';

// ---- Static teacher roster (single source of truth) ----
const qariRoster = [
    {
        id: 1,
        name: "Qari Muhammad Dawood",
        gender: "male",
        specs: ["hifz", "tajweed"],
        specTags: ["Hifz (Memorization)", "Tajweed Specialist", "Quran Recitation"],
        experience: 5,
        rating: 5.0,
        reviews: 1,
        price: 10,
        origin: "Pakistan (Wifaq-ul-Madaris Certified)",
        languages: ["English", "Urdu", "Arabic"],
        bio: "Founder and lead instructor. Wifaq-ul-Madaris certified with a focus on Tajweed precision and structured Hifz tracking for children and adults."
    },
    {
        id: 2,
        name: "Qari Ahmed Al-Sayed",
        gender: "male",
        specs: ["tajweed", "arabic"],
        specTags: ["Certified Reciter", "Arabic Dialects", "Qira'at"],
        experience: 8,
        rating: 5.0,
        reviews: 1,
        price: 12,
        origin: "Pakistan (Certified Islamic Educator)",
        languages: ["English", "Urdu", "Arabic"],
        bio: "Specializes in classical Qira'at and Arabic dialect coaching for adult learners aiming for precise, traditional recitation."
    },
    {
        id: 3,
        name: "Qariya Fatima Al-Zahra",
        gender: "female",
        specs: ["kids", "tajweed"],
        specTags: ["Kids Specialist", "Tajweed Recitation", "Qaida Nurania"],
        experience: 7,
        rating: 5.0,
        reviews: 1,
        price: 10,
        origin: "Pakistan (Traditional Quran Scholar)",
        languages: ["English", "Urdu", "Arabic"],
        bio: "Dedicated children's instructor using the Qaida Nurania method, known for patience and steady progress tracking with young learners."
    }
];

// ---- Mobile nav toggle ----
function toggleMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    const icon = document.getElementById("mobile-menu-icon");
    if (!menu) return;
    if (menu.classList.contains("hidden")) {
        menu.classList.remove("hidden");
        icon.className = "fa-solid fa-xmark text-2xl";
    } else {
        menu.classList.add("hidden");
        icon.className = "fa-solid fa-bars text-2xl";
    }
}

// ---- Toast notifications ----
function showToast(title, text, type = "success") {
    const wrapper = document.getElementById("toast-wrapper");
    if (!wrapper) return;

    const toast = document.createElement("div");
    toast.className = "pointer-events-auto bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 flex items-start gap-3 w-80 mb-3 animate-slide-up relative overflow-hidden";

    let iconHTML = "";
    let accentLineColor = "bg-qari-gold";

    if (type === "success") {
        iconHTML = '<span class="p-2 bg-emerald-100 text-emerald-800 rounded-lg"><i class="fa-solid fa-circle-check"></i></span>';
        accentLineColor = "bg-emerald-500";
    } else if (type === "warning") {
        iconHTML = '<span class="p-2 bg-amber-100 text-amber-800 rounded-lg"><i class="fa-solid fa-triangle-exclamation"></i></span>';
        accentLineColor = "bg-amber-500";
    } else {
        iconHTML = '<span class="p-2 bg-blue-100 text-blue-800 rounded-lg"><i class="fa-solid fa-circle-info"></i></span>';
        accentLineColor = "bg-blue-500";
    }

    toast.innerHTML = `
        <div class="absolute left-0 top-0 bottom-0 w-1.5 ${accentLineColor}"></div>
        <div class="ml-1.5">${iconHTML}</div>
        <div class="flex-1">
            <h5 class="font-bold text-qari-green text-sm">${escapeHTML(title)}</h5>
            <p class="text-xs text-qari-dark/80 mt-1 leading-relaxed">${escapeHTML(text)}</p>
        </div>
        <button onclick="this.parentElement.remove()" aria-label="Dismiss notification" class="text-gray-400 hover:text-gray-600 text-xs shrink-0 self-start">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    wrapper.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add("opacity-0", "transition-opacity", "duration-500");
            setTimeout(() => toast.remove(), 500);
        }
    }, 5000);
}

// Basic escaping so dynamic strings inserted via innerHTML can't break markup
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---- Floating chat widget ----
function toggleChatWidget() {
    const card = document.getElementById("chat-widget-card");
    const icon = document.getElementById("chat-widget-icon");
    if (!card) return;
    if (card.classList.contains("hidden")) {
        card.classList.remove("hidden");
        icon.className = "fa-solid fa-xmark text-2xl";
    } else {
        card.classList.add("hidden");
        icon.className = "fa-solid fa-comments text-2xl";
    }
}

// ---- Simple focus trap for modals (accessibility) ----
function trapFocus(modalEl) {
    const focusable = modalEl.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function handler(e) {
        if (e.key === 'Escape') {
            const closeBtn = modalEl.querySelector('[data-modal-close]');
            if (closeBtn) closeBtn.click();
            return;
        }
        if (e.key !== 'Tab') return;
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
    modalEl.addEventListener('keydown', handler);
    modalEl._focusTrapHandler = handler;
    first.focus();
}

function releaseFocusTrap(modalEl) {
    if (modalEl._focusTrapHandler) {
        modalEl.removeEventListener('keydown', modalEl._focusTrapHandler);
        delete modalEl._focusTrapHandler;
    }
}

// ---- FAQ toggle (used on multiple pages) ----
function toggleFaq(id) {
    const answer = document.getElementById(`faq-answer-${id}`);
    const icon = document.getElementById(`faq-icon-${id}`);
    if (!answer) return;

    const isHidden = answer.classList.contains('hidden');
    if (isHidden) {
        answer.classList.remove('hidden');
        if (icon) icon.innerHTML = '<i class="fa-solid fa-minus"></i>';
    } else {
        answer.classList.add('hidden');
        if (icon) icon.innerHTML = '<i class="fa-solid fa-plus"></i>';
    }
}
