/* ============================================================
   FindYourQari — Booking & Application Modal Logic
   Shared by any page that includes the modal markup.
   ============================================================ */

let selectedDate = null;
let selectedTime = null;
let currentBookingQari = null;
let activeBookingStep = 1;
let activeWizardStep = 1;

// Dynamically compute upcoming scheduler dates
function setupBookingDates() {
    const dateContainer = document.querySelector('#booking-step-1 .grid-cols-4');
    if (!dateContainer) return;
    dateContainer.innerHTML = '';
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();

    for (let i = 1; i <= 4; i++) {
        const nextDate = new Date();
        nextDate.setDate(today.getDate() + i);

        const dayName = days[nextDate.getDay()];
        const dayNum = String(nextDate.getDate()).padStart(2, '0');
        const monthName = months[nextDate.getMonth()];

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.onclick = function () { selectBookingDate(this); };
        btn.setAttribute('aria-label', `Select ${dayName} ${dayNum} ${monthName}`);
        btn.className = "booking-date-btn border border-qari-green/20 bg-qari-beige text-qari-green py-2 px-3 rounded-lg text-xs font-semibold hover:border-qari-gold focus:outline-none transition-all text-center";
        btn.innerHTML = `
            <span class="block text-gray-500 font-medium">${dayName}</span>
            <span class="block text-base font-bold">${dayNum}</span>
            <span class="block text-[9px] text-gray-400">${monthName}</span>
        `;
        dateContainer.appendChild(btn);
    }
}

function triggerBookingModal(qariId) {
    const qari = qariRoster.find(item => item.id === qariId);
    if (!qari) return;

    currentBookingQari = qari;
    document.getElementById("modal-qari-name").textContent = qari.name;
    document.getElementById("modal-qari-specs").textContent = qari.specTags.slice(0, 2).join(" / ");

    activeBookingStep = 1;
    selectedDate = null;
    selectedTime = null;

    document.querySelectorAll(".booking-date-btn").forEach(btn => {
        btn.classList.remove("border-qari-gold", "bg-qari-gold/20");
        btn.classList.add("border-qari-green/20", "bg-qari-beige");
    });
    document.querySelectorAll(".booking-time-btn").forEach(btn => {
        btn.classList.remove("border-qari-green", "bg-qari-green", "text-white");
        btn.classList.add("border-gray-100", "bg-gray-50");
    });

    updateBookingStepUI();
    const modal = document.getElementById("booking-modal");
    modal.classList.remove("hidden");
    trapFocus(modal);
}

function closeBookingModal() {
    const modal = document.getElementById("booking-modal");
    modal.classList.add("hidden");
    releaseFocusTrap(modal);
}

function selectBookingDate(btn) {
    document.querySelectorAll(".booking-date-btn").forEach(button => {
        button.classList.remove("border-qari-gold", "bg-qari-gold/20");
        button.classList.add("border-qari-green/20", "bg-qari-beige");
    });
    btn.classList.remove("border-qari-green/20", "bg-qari-beige");
    btn.classList.add("border-qari-gold", "bg-qari-gold/20");
    const spans = btn.querySelectorAll("span");
    const day = spans[1] ? spans[1].textContent.trim() : '';
    const month = spans[2] ? spans[2].textContent.trim() : '';
    selectedDate = day + " " + month;
}

function selectBookingTime(btn) {
    document.querySelectorAll(".booking-time-btn").forEach(button => {
        button.classList.remove("border-qari-green", "bg-qari-green", "text-white");
        button.classList.add("border-gray-100", "bg-gray-50");
    });
    btn.classList.remove("border-gray-100", "bg-gray-50");
    btn.classList.add("border-qari-green", "bg-qari-green", "text-white");
    selectedTime = btn.textContent;
}

function updateBookingStepUI() {
    const step1 = document.getElementById("booking-step-1");
    const step2 = document.getElementById("booking-step-2");
    const nextBtn = document.getElementById("booking-next-btn");
    const prevBtn = document.getElementById("booking-prev-btn");
    const label = document.getElementById("step-label");
    const count = document.getElementById("step-count");

    if (activeBookingStep === 1) {
        step1.classList.remove("hidden");
        step2.classList.add("hidden");
        prevBtn.classList.add("invisible");
        nextBtn.textContent = "Next";
        label.textContent = "Step 1: Choose Date & Time";
        count.textContent = "1 of 2";
    } else {
        step1.classList.add("hidden");
        step2.classList.remove("hidden");
        prevBtn.classList.remove("invisible");
        nextBtn.textContent = "Confirm Booking";
        label.textContent = "Step 2: Participant Details";
        count.textContent = "2 of 2";
    }
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidWhatsApp(value) {
    if (!value) return true; // optional field
    return /^[+\d][\d\s-]{6,}$/.test(value);
}

function nextBookingStep() {
    if (activeBookingStep === 1) {
        if (!selectedDate || !selectedTime) {
            showToast("Selection Needed", "Please select both a date and a time slot.", "warning");
            return;
        }
        activeBookingStep = 2;
        updateBookingStepUI();
    } else {
        const name = document.getElementById("booking-name").value.trim();
        const email = document.getElementById("booking-email").value.trim();
        const whatsapp = document.getElementById("booking-whatsapp").value.trim();

        if (!name || !email) {
            showToast("Incomplete Form", "Please fill in all mandatory fields.", "warning");
            return;
        }
        if (!isValidEmail(email)) {
            showToast("Invalid Email", "Please enter a valid email address.", "warning");
            return;
        }
        if (!isValidWhatsApp(whatsapp)) {
            showToast("Invalid Number", "Please enter a valid WhatsApp number, e.g. +92 301 1234567.", "warning");
            return;
        }

        // Disable button while submitting
        const nextBtn = document.getElementById("booking-next-btn");
        nextBtn.disabled = true;
        nextBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

        submitBookingToWeb3(
            name, email, whatsapp,
            currentBookingQari ? currentBookingQari.name : '',
            selectedDate, selectedTime,
            function () {
                closeBookingModal();
                showToast(
                    "Booking Confirmed!",
                    `Your free trial with ${currentBookingQari.name} on ${selectedDate} at ${selectedTime} has been received. We'll confirm via WhatsApp or email shortly.`,
                    "success"
                );
                document.getElementById("booking-name").value = "";
                document.getElementById("booking-email").value = "";
                document.getElementById("booking-whatsapp").value = "";
                nextBtn.disabled = false;
                nextBtn.textContent = "Confirm Booking";
            },
            function (errMsg) {
                showToast("Submission Failed", errMsg + " Please contact us via WhatsApp.", "warning");
                nextBtn.disabled = false;
                nextBtn.textContent = "Confirm Booking";
            }
        );
    }
}

function prevBookingStep() {
    if (activeBookingStep === 2) {
        activeBookingStep = 1;
        updateBookingStepUI();
    }
}

// ---- Become a Qari wizard ----
function openBecomeQariModal() {
    activeWizardStep = 1;
    updateWizardStepUI();
    const modal = document.getElementById("qari-modal");
    modal.classList.remove("hidden");
    trapFocus(modal);
}

function closeBecomeQariModal() {
    const modal = document.getElementById("qari-modal");
    modal.classList.add("hidden");
    releaseFocusTrap(modal);
}

function updateWizardStepUI() {
    const step1 = document.getElementById("wizard-step-1");
    const step2 = document.getElementById("wizard-step-2");
    const step3 = document.getElementById("wizard-step-3");
    const nextBtn = document.getElementById("wizard-next-btn");
    const prevBtn = document.getElementById("wizard-prev-btn");
    const label = document.getElementById("wizard-label");
    const progress = document.getElementById("wizard-progress");

    const l1 = document.getElementById("line-step-1");
    const l2 = document.getElementById("line-step-2");
    const l3 = document.getElementById("line-step-3");

    step1.classList.add("hidden");
    step2.classList.add("hidden");
    step3.classList.add("hidden");

    l1.className = "h-2 bg-gray-200 flex-1 rounded-full";
    l2.className = "h-2 bg-gray-200 flex-1 rounded-full";
    l3.className = "h-2 bg-gray-200 flex-1 rounded-full";

    if (activeWizardStep === 1) {
        step1.classList.remove("hidden");
        prevBtn.classList.add("invisible");
        nextBtn.textContent = "Next";
        label.textContent = "Step 1: Contact Details";
        progress.textContent = "Step 1 of 3";
        l1.className = "h-2 bg-qari-gold flex-1 rounded-full animate-pulse";
    } else if (activeWizardStep === 2) {
        step2.classList.remove("hidden");
        prevBtn.classList.remove("invisible");
        nextBtn.textContent = "Next";
        label.textContent = "Step 2: Educational Credentials";
        progress.textContent = "Step 2 of 3";
        l1.className = "h-2 bg-qari-green flex-1 rounded-full";
        l2.className = "h-2 bg-qari-gold flex-1 rounded-full animate-pulse";
    } else if (activeWizardStep === 3) {
        step3.classList.remove("hidden");
        prevBtn.classList.remove("invisible");
        nextBtn.textContent = "Apply to Roster";
        label.textContent = "Step 3: Declaration Check";
        progress.textContent = "Step 3 of 3";
        l1.className = "h-2 bg-qari-green flex-1 rounded-full";
        l2.className = "h-2 bg-qari-green flex-1 rounded-full";
        l3.className = "h-2 bg-qari-gold flex-1 rounded-full animate-pulse";
    }
}

function validateWizardStep1() {
    const inputs = document.querySelectorAll('#wizard-step-1 input[required]');
    for (const input of inputs) {
        if (!input.value.trim()) {
            showToast("Missing Information", "Please fill in all contact fields before continuing.", "warning");
            input.focus();
            return false;
        }
    }
    const emailInput = document.querySelector('#wizard-step-1 input[type="email"]');
    if (emailInput && !isValidEmail(emailInput.value.trim())) {
        showToast("Invalid Email", "Please enter a valid email address.", "warning");
        emailInput.focus();
        return false;
    }
    return true;
}

function nextWizardStep() {
    if (activeWizardStep === 1 && !validateWizardStep1()) {
        return;
    }

    if (activeWizardStep < 3) {
        activeWizardStep++;
        updateWizardStepUI();
    } else {
        const declare = document.getElementById("declare-check").checked;
        if (!declare) {
            showToast("Consent Required", "Please check the background evaluation declaration consent check.", "warning");
            return;
        }

        // Collect all wizard fields
        const inputs = document.querySelectorAll('#wizard-step-1 input');
        const selects2 = document.querySelectorAll('#wizard-step-2 select');

        const wName     = inputs[0] ? inputs[0].value.trim() : '';
        const wEmail    = inputs[1] ? inputs[1].value.trim() : '';
        const wWhatsapp = inputs[2] ? inputs[2].value.trim() : '';
        const wCountry  = inputs[3] ? inputs[3].value.trim() : '';
        const wCert     = selects2[0] ? selects2[0].value : '';
        const wExp      = selects2[1] ? selects2[1].value : '';
        const wSpecs    = selects2[2] ? Array.from(selects2[2].selectedOptions).map(o => o.value).join(', ') : '';

        // Disable button while submitting
        const wizBtn = document.getElementById("wizard-next-btn");
        wizBtn.disabled = true;
        wizBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

        submitTeacherApplicationToWeb3(
            wName, wEmail, wWhatsapp, wCountry, wCert, wExp, wSpecs,
            function () {
                closeBecomeQariModal();
                showToast(
                    "Application Received!",
                    "JazakAllah khair! Our verification team will review your profile within 48 hours and contact you via WhatsApp.",
                    "success"
                );
                document.getElementById("qari-form").reset();
                wizBtn.disabled = false;
                wizBtn.textContent = "Apply to Roster";
            },
            function (errMsg) {
                showToast("Submission Failed", errMsg + " Please contact us via WhatsApp.", "warning");
                wizBtn.disabled = false;
                wizBtn.textContent = "Apply to Roster";
            }
        );
    }
}

function prevWizardStep() {
    if (activeWizardStep > 1) {
        activeWizardStep--;
        updateWizardStepUI();
    }
}

// Init booking dates if modal markup is present on this page
document.addEventListener('DOMContentLoaded', function () {
    setupBookingDates();
});
