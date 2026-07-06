/**
 * FindYourQari — Web3Forms Submission Handler
 * Sends form data to web3forms.com which emails it to the inbox.
 * Free, no backend needed, works from any static site.
 */

const WEB3FORMS_KEY = 'c20ff25e-176a-46e8-844b-f2b7b7a7e799';

/**
 * Submit any form data to Web3Forms.
 * @param {string} subject  - Email subject line
 * @param {Object} fields   - Key/value pairs to include in the email
 * @param {Function} onSuccess
 * @param {Function} onError
 */
async function submitToWeb3Forms(subject, fields, onSuccess, onError) {
    const payload = {
        access_key: WEB3FORMS_KEY,
        subject: subject,
        from_name: 'FindYourQari Website',
        ...fields
    };

    try {
        const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            if (typeof onSuccess === 'function') onSuccess();
        } else {
            console.error('Web3Forms error:', data);
            if (typeof onError === 'function') onError(data.message || 'Submission failed.');
        }
    } catch (err) {
        console.error('Network error:', err);
        if (typeof onError === 'function') onError('Network error. Please try WhatsApp instead.');
    }
}


/* =====================================================
   FORM 1 — Contact Page
   ===================================================== */
function handleContactSubmit(e) {
    e.preventDefault();

    const name     = document.getElementById('contact-name').value.trim();
    const email    = document.getElementById('contact-email').value.trim();
    const whatsapp = document.getElementById('contact-whatsapp').value.trim();
    const topic    = document.getElementById('contact-topic').value;
    const message  = document.getElementById('contact-message').value.trim();

    // Validation
    if (!name) {
        showToast('Missing Name', 'Please enter your full name.', 'warning');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Invalid Email', 'Please enter a valid email address.', 'warning');
        return;
    }
    if (!message) {
        showToast('Missing Message', 'Please write a short message.', 'warning');
        return;
    }

    // Show loading state on button
    const btn = document.querySelector('#contact-form button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-qari-gold"></i> Sending...';
    }

    submitToWeb3Forms(
        '📩 New Contact Inquiry — FindYourQari',
        {
            name,
            email,
            'WhatsApp': whatsapp || 'Not provided',
            'Interested In': topic,
            message
        },
        function () {
            showToast(
                'Message Sent!',
                'Thank you ' + name.split(' ')[0] + '! We\'ll reply within a few hours.',
                'success'
            );
            document.getElementById('contact-form').reset();
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-paper-plane text-qari-gold"></i> Send Message';
            }
        },
        function (errMsg) {
            showToast('Sending Failed', errMsg + ' Please contact us via WhatsApp.', 'warning');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-paper-plane text-qari-gold"></i> Send Message';
            }
        }
    );
}


/* =====================================================
   FORM 2 — Book Trial (called from booking.js)
   ===================================================== */
function submitBookingToWeb3(name, email, whatsapp, teacher, date, time, onSuccess, onError) {
    submitToWeb3Forms(
        '📅 New Trial Booking — FindYourQari',
        {
            name,
            email,
            'WhatsApp': whatsapp || 'Not provided',
            'Teacher Requested': teacher,
            'Preferred Date': date,
            'Preferred Time': time
        },
        onSuccess,
        onError
    );
}


/* =====================================================
   FORM 3 — Become a Teacher (called from booking.js)
   ===================================================== */
function submitTeacherApplicationToWeb3(name, email, whatsapp, country, cert, experience, specs, onSuccess, onError) {
    submitToWeb3Forms(
        '👨‍🏫 New Teacher Application — FindYourQari',
        {
            name,
            email,
            'WhatsApp': whatsapp || 'Not provided',
            'Country': country,
            'Certification': cert,
            'Experience': experience,
            'Specializations': specs
        },
        onSuccess,
        onError
    );
}
