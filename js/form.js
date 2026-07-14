// ============================================================
// form.js — User Preference Form + Filtering
// Karnataka Travel Recommendation Website
// ============================================================

// ---------- All Karnataka Districts (from GeoJSON) ----------

const KARNATAKA_DISTRICTS = [
    'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
    'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal',
    'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga',
    'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'
];

// ---------- Init ----------

function initFormPanel() {
    const panel = document.getElementById('explore-panel');
    if (!panel) return;

    panel.innerHTML = `
        <div class="panel-header">
            <h2><i class="ri-compass-3-line"></i> Explore Karnataka</h2>
            <p>Tell us your preferences — we'll find the perfect destinations</p>
        </div>

        <!-- Season / When -->
        <div class="form-group">
            <label><span class="label-icon"><i class="ri-calendar-line"></i></span> When do you want to travel?</label>
            <div class="checkbox-group" id="season-filters">
                ${SEASONS.map(s => `
                    <label class="checkbox-chip" data-value="${s}">
                        <input type="checkbox" value="${s}" onchange="onFilterChange()">
                        <span>${s === 'Summer' ? '<i class="ri-sun-line"></i>' : s === 'Monsoon' ? '<i class="ri-rainy-line"></i>' : s === 'Winter' ? '<i class="ri-snowy-line"></i>' : '<i class="ri-earth-line"></i>'}</span>
                        <span>${s}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <!-- Category / Where -->
        <div class="form-group">
            <label><span class="label-icon"><i class="ri-map-pin-line"></i></span> What type of place?</label>
            <div class="checkbox-group" id="category-filters">
                ${Object.entries(CATEGORIES).map(([key, cat]) => `
                    <label class="checkbox-chip" data-value="${key}">
                        <input type="checkbox" value="${key}" onchange="onFilterChange()">
                        <span class="chip-icon">${cat.icon}</span>
                        <span>${cat.label}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <!-- District / Multi-select -->
        <div class="form-group">
            <label><span class="label-icon"><i class="ri-map-2-line"></i></span> Select District</label>
            <div class="district-multiselect" id="district-multiselect">
                <div class="district-trigger" onclick="toggleDistrictDropdown()">
                    <span class="district-trigger-text" id="district-trigger-text">All Districts</span>
                    <span class="district-trigger-arrow">▾</span>
                </div>
                <div class="district-dropdown" id="district-dropdown">
                    <div class="district-dropdown-header">
                        <span class="district-selected-count" id="district-selected-count">0 selected</span>
                        <button class="district-clear-btn" onclick="clearDistrictSelection(event)">Clear</button>
                    </div>
                    <div class="district-dropdown-list" id="district-dropdown-list">
                        ${KARNATAKA_DISTRICTS.map(d => `
                            <label class="district-option">
                                <input type="checkbox" value="${d}" onchange="onDistrictChange()">
                                <span class="district-check">✓</span>
                                <span>${d}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Transport / How -->
        <div class="form-group">
            <label><span class="label-icon"><i class="ri-car-line"></i></span> How will you travel?</label>
            <div class="checkbox-group" id="transport-filters">
                ${TRANSPORT.map(t => {
                    const icons = { Car: '<i class="ri-car-line"></i>', Bus: '<i class="ri-bus-line"></i>', Train: '<i class="ri-train-line"></i>', Flight: '<i class="ri-flight-takeoff-line"></i>' };
                    return `
                        <label class="checkbox-chip" data-value="${t}">
                            <input type="checkbox" value="${t}" onchange="onFilterChange()">
                            <span class="chip-icon">${icons[t]}</span>
                            <span>${t}</span>
                        </label>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- Budget -->
        <div class="form-group">
            <label><span class="label-icon"><i class="ri-money-dollar-circle-line"></i></span> Budget (per person)</label>
            <div class="range-container">
                <input type="range" class="range-slider" id="budget-slider"
                       min="500" max="50000" step="500" value="50000"
                       oninput="onBudgetChange(this.value)">
                <div class="range-value" id="budget-value">Up to ₹50,000</div>
                <div class="range-labels">
                    <span>₹500</span>
                    <span>₹50,000</span>
                </div>
            </div>
        </div>

        <!-- Duration -->
        <div class="form-group">
            <label><span class="label-icon"><i class="ri-time-line"></i></span> Duration</label>
            <div class="checkbox-group" id="duration-filters">
                ${DURATIONS.map(d => `
                    <label class="checkbox-chip" data-value="${d}">
                        <input type="checkbox" value="${d}" onchange="onFilterChange()">
                        <span>${d}</span>
                    </label>
                `).join('')}
            </div>
        </div>

        <hr class="divider">

        <!-- Action buttons -->
        <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary btn-block" onclick="applyFilters()">
                <i class="ri-search-line"></i> Find Destinations
            </button>
            <button class="btn btn-secondary" onclick="clearFilters()" title="Reset">
                <i class="ri-refresh-line"></i>
            </button>
        </div>

        <hr class="divider">

        <!-- Results -->
        <div id="results-section">
            <div class="results-bar">
                <span class="results-count" id="results-count">Showing <strong>all</strong> locations</span>
            </div>
            <div id="results-list"></div>
        </div>
    `;

    // Setup chip toggle behavior
    setupChipToggles();
    renderResults(DataStore.getAll());

    // Close district dropdown on outside click
    document.addEventListener('click', handleDistrictOutsideClick);
}

// ---------- District Multi-Select ----------

function toggleDistrictDropdown() {
    const dropdown = document.getElementById('district-dropdown');
    if (dropdown) dropdown.classList.toggle('open');
}

function handleDistrictOutsideClick(e) {
    const multiselect = document.getElementById('district-multiselect');
    if (multiselect && !multiselect.contains(e.target)) {
        const dropdown = document.getElementById('district-dropdown');
        if (dropdown) dropdown.classList.remove('open');
    }
}

function getDistrictSelections() {
    const list = document.getElementById('district-dropdown-list');
    if (!list) return [];
    return Array.from(list.querySelectorAll('input:checked')).map(i => i.value);
}

function onDistrictChange() {
    updateDistrictTrigger();
    onFilterChange();
}

function updateDistrictTrigger() {
    const selected = getDistrictSelections();
    const triggerText = document.getElementById('district-trigger-text');
    const countText = document.getElementById('district-selected-count');

    if (triggerText) {
        if (selected.length === 0) {
            triggerText.textContent = 'All Districts';
        } else if (selected.length <= 2) {
            triggerText.textContent = selected.join(', ');
        } else {
            triggerText.textContent = `${selected.length} districts selected`;
        }
    }
    if (countText) {
        countText.textContent = `${selected.length} selected`;
    }
}

function clearDistrictSelection(e) {
    if (e) e.stopPropagation();
    const list = document.getElementById('district-dropdown-list');
    if (list) {
        list.querySelectorAll('input').forEach(input => input.checked = false);
    }
    updateDistrictTrigger();
    onFilterChange();
}

// ---------- Chip Toggle Behavior ----------

function setupChipToggles() {
    document.querySelectorAll('.checkbox-chip, .radio-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            const input = this.querySelector('input');
            if (input) {
                // Toggle happens via the input's onchange, but we style the chip
                setTimeout(() => {
                    this.classList.toggle('checked', input.checked);
                }, 0);
            }
        });
    });
}

// ---------- Budget Slider ----------

function onBudgetChange(value) {
    const display = document.getElementById('budget-value');
    if (display) {
        display.textContent = `Up to ₹${parseInt(value).toLocaleString('en-IN')}`;
    }
}

// ---------- Filter Logic ----------

function getActiveFilters() {
    const getChecked = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return [];
        return Array.from(container.querySelectorAll('input:checked')).map(i => i.value);
    };

    const budgetSlider = document.getElementById('budget-slider');

    return {
        seasons: getChecked('season-filters'),
        categories: getChecked('category-filters'),
        districts: getDistrictSelections(),
        transport: getChecked('transport-filters'),
        durations: getChecked('duration-filters'),
        maxBudget: budgetSlider ? parseInt(budgetSlider.value) : 50000
    };
}

function onFilterChange() {
    applyFilters();
}

function applyFilters() {
    const filters = getActiveFilters();

    const filterFn = (loc) => {
        // Season filter
        if (filters.seasons.length > 0) {
            const locSeasons = loc.bestSeasons || [];
            if (!filters.seasons.some(s => locSeasons.includes(s))) return false;
        }

        // Category filter
        if (filters.categories.length > 0) {
            if (!filters.categories.includes(loc.category)) return false;
        }

        // District filter
        if (filters.districts.length > 0) {
            if (!filters.districts.includes(loc.district)) return false;
        }

        // Transport filter
        if (filters.transport.length > 0) {
            const locTransport = loc.transport || [];
            if (!filters.transport.some(t => locTransport.includes(t))) return false;
        }

        // Duration filter
        if (filters.durations.length > 0) {
            if (!filters.durations.includes(loc.duration)) return false;
        }

        // Budget filter
        if (loc.estimatedCost > filters.maxBudget) return false;

        return true;
    };

    const results = refreshMarkers(filterFn);
    renderResults(results);
}

function clearFilters() {
    // Uncheck all chips
    document.querySelectorAll('.checkbox-chip input').forEach(input => {
        input.checked = false;
    });
    document.querySelectorAll('.checkbox-chip').forEach(chip => {
        chip.classList.remove('checked');
    });

    // Reset district multi-select
    clearDistrictSelection();

    // Reset budget
    const slider = document.getElementById('budget-slider');
    if (slider) {
        slider.value = 50000;
        onBudgetChange(50000);
    }

    // Show all
    const results = refreshMarkers();
    renderResults(results);

    showToast('Filters cleared', 'success');
}

// ---------- Render Results List ----------

function renderResults(locations) {
    const list = document.getElementById('results-list');
    const count = document.getElementById('results-count');
    if (!list) return;

    if (count) {
        const total = DataStore.getAll().length;
        if (locations.length === total) {
            count.innerHTML = `Showing <strong>all ${total}</strong> locations`;
        } else {
            count.innerHTML = `Found <strong>${locations.length}</strong> of ${total} locations`;
        }
    }

    if (locations.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="ri-search-line"></i></div>
                <h3>No destinations found</h3>
                <p>Try adjusting your filters to discover more places</p>
            </div>
        `;
        return;
    }

    // Sort by rating desc
    const sorted = [...locations].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    list.innerHTML = sorted.map(loc => {
        const cat = CATEGORIES[loc.category] || CATEGORIES.heritage;
        const stars = '★'.repeat(Math.min(loc.rating || 0, 5));
        return `
            <div class="location-card" onclick="flyToLocation('${loc.id}')" id="card-${loc.id}">
                <div class="card-icon" style="background: ${cat.color}15; color: ${cat.color}">
                    ${cat.icon}
                </div>
                <div class="card-info">
                    <h4>${loc.name}</h4>
                    <div class="card-district">${loc.district}</div>
                    <div class="card-meta">
                        <span style="color: ${cat.color}">${cat.label}</span>
                        <span>₹${(loc.estimatedCost || 0).toLocaleString('en-IN')}</span>
                        <span style="color: var(--accent-gold)">${stars}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
