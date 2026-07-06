/* ============================================================
   FindYourQari — Teacher Directory Rendering & Filtering
   Used on teachers.html (full directory) and index.html (preview)
   ============================================================ */

function renderRoster(data, gridId = "qari-grid", emptyId = "qari-empty-state", countId = "displayed-qaris-count") {
    const grid = document.getElementById(gridId);
    const emptyState = document.getElementById(emptyId);
    const countLabel = document.getElementById(countId);

    if (!grid) return;
    grid.innerHTML = "";
    if (countLabel) countLabel.textContent = data.length;

    if (data.length === 0) {
        grid.classList.add("hidden");
        if (emptyState) emptyState.classList.remove("hidden");
        return;
    }

    grid.classList.remove("hidden");
    if (emptyState) emptyState.classList.add("hidden");

    data.forEach(qari => {
        const card = document.createElement("div");
        card.className = "bg-qari-warm rounded-3xl border border-qari-gold/20 hover:border-qari-gold hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group";

        let specTagsHTML = "";
        qari.specTags.forEach(tag => {
            specTagsHTML += `<span class="bg-qari-green/5 text-qari-green text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border border-qari-green/5">${escapeHTML(tag)}</span>`;
        });

        card.innerHTML = `
            <div class="p-6 relative">
                <div class="absolute top-6 right-6 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    <i class="fa-solid fa-circle-check"></i> Verified
                </div>

                <div class="flex items-center gap-4 mb-5">
                    <div class="w-16 h-16 rounded-full bg-qari-navy border-2 border-qari-gold/30 flex items-center justify-center text-white text-3xl font-extrabold relative overflow-hidden shrink-0 group-hover:scale-105 duration-300">
                        <i class="fa-solid fa-user-graduate text-qari-gold"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-qari-green group-hover:text-qari-gold transition-colors">${escapeHTML(qari.name)}</h3>
                        <p class="text-xs text-gray-500 font-medium">${escapeHTML(qari.origin)}</p>
                    </div>
                </div>

                <p class="text-xs text-qari-dark/70 leading-relaxed mb-4">${escapeHTML(qari.bio || "")}</p>

                <div class="grid grid-cols-2 gap-y-3 gap-x-2 border-y border-gray-100 py-4 mb-5 text-xs text-qari-dark">
                    <div class="flex items-center gap-2">
                        <span class="text-qari-gold"><i class="fa-solid fa-briefcase"></i></span>
                        <span class="font-semibold text-gray-500">Exp: <span class="text-qari-dark font-extrabold">${qari.experience} Years</span></span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-qari-gold"><i class="fa-solid fa-star"></i></span>
                        <span class="font-semibold text-gray-500">Rating: <span class="text-qari-dark font-extrabold">${qari.rating} Verified</span></span>
                    </div>
                    <div class="flex items-center gap-2 col-span-2">
                        <span class="text-qari-gold"><i class="fa-solid fa-language"></i></span>
                        <span class="font-semibold text-gray-500">Fluent: <span class="text-qari-dark font-extrabold">${qari.languages.join(", ")}</span></span>
                    </div>
                </div>

                <div class="flex flex-wrap gap-1.5 mb-2">
                    ${specTagsHTML}
                </div>
            </div>

            <div class="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
                <div class="flex flex-col">
                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hourly Rate</span>
                    <span class="text-lg font-extrabold text-qari-green">$${qari.price}<span class="text-xs font-normal text-gray-500">/hr</span></span>
                </div>
                <button onclick="triggerBookingModal(${qari.id})" class="flex-1 bg-qari-green hover:bg-qari-greenLight text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all duration-200 text-center flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-calendar-days text-qari-gold"></i> Book Trial
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterQaris() {
    const searchEl = document.getElementById("directory-search");
    const specialtyEl = document.getElementById("filter-specialty");
    const genderEl = document.getElementById("filter-gender");

    const query = searchEl ? searchEl.value.toLowerCase() : "";
    const specialty = specialtyEl ? specialtyEl.value : "all";
    const gender = genderEl ? genderEl.value : "all";

    const filtered = qariRoster.filter(qari => {
        const matchesSearch = qari.name.toLowerCase().includes(query) ||
                              qari.origin.toLowerCase().includes(query) ||
                              qari.languages.join(" ").toLowerCase().includes(query);
        const matchesSpecialty = (specialty === "all") || qari.specs.includes(specialty);
        const matchesGender = (gender === "all") || (qari.gender === gender);
        return matchesSearch && matchesSpecialty && matchesGender;
    });

    renderRoster(filtered);
}

function resetDirectoryFilters() {
    const searchEl = document.getElementById("directory-search");
    const specialtyEl = document.getElementById("filter-specialty");
    const genderEl = document.getElementById("filter-gender");

    if (searchEl) searchEl.value = "";
    if (specialtyEl) specialtyEl.value = "all";
    if (genderEl) genderEl.value = "all";
    renderRoster(qariRoster);
    showToast("Filters Reset", "Directory filters reset to default", "info");
}

// ---- Recitation player simulation (hero widget) ----
let recitationPlaying = false;
let audioInterval = null;

function toggleRecitationPlay() {
    const playIcon = document.getElementById("recitation-play-icon");
    const playBtn = document.getElementById("recitation-play-btn");
    const statusLabel = document.getElementById("recitation-status");
    const bars = document.querySelectorAll("#soundwave-container div");

    recitationPlaying = !recitationPlaying;

    if (recitationPlaying) {
        playIcon.className = "fa-solid fa-pause";
        statusLabel.textContent = "Playing Demo Animation...";
        playBtn.classList.add("scale-105", "shadow-lg");

        audioInterval = setInterval(() => {
            bars.forEach(bar => {
                const randomHeight = Math.floor(Math.random() * 5) + 2;
                bar.style.height = `${randomHeight * 4}px`;
            });
        }, 150);
        showToast("Visual Demo", "This is a visual demo of waveform style — audio sample coming soon.", "info");
    } else {
        clearInterval(audioInterval);
        playIcon.className = "fa-solid fa-play ml-0.5";
        statusLabel.textContent = "Sample Waveform Demo";
        playBtn.classList.remove("scale-105", "shadow-lg");

        bars.forEach((bar, index) => {
            const heights = ["12px", "20px", "24px", "16px", "20px", "12px", "24px", "16px", "8px"];
            bar.style.height = heights[index];
        });
    }
}

// Auto-render on directory pages
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById("qari-grid")) {
        renderRoster(qariRoster);
    }
});
