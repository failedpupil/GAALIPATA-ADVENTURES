// ============================================================
// admin.js — Admin Panel CRUD Operations
// Karnataka Travel Recommendation Website
// ============================================================

let adminAuthenticated = false;
let editingLocationId = null;

// ---------- Initialize Admin Panel ----------

function initAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (!panel) return;

    if (!adminAuthenticated) {
        renderAdminGate(panel);
    } else {
        renderAdminDashboard(panel);
    }
}

// ---------- Admin Gate (Password) ----------

function renderAdminGate(panel) {
    panel.innerHTML = `
        <div class="admin-gate">
            <div class="lock-icon">🔒</div>
            <h3>Admin Access</h3>
            <p>Enter the admin password to manage locations</p>
            <div class="admin-password-group">
                <input type="password" class="form-input" id="admin-password"
                       placeholder="Password" onkeydown="if(event.key==='Enter')authenticateAdmin()">
                <button class="btn btn-primary" onclick="authenticateAdmin()">→</button>
            </div>
            <p style="margin-top: 12px; font-size: 0.7rem; color: var(--text-tertiary)">
                Default: admin123
            </p>
        </div>
    `;
}

function authenticateAdmin() {
    const input = document.getElementById('admin-password');
    if (!input) return;

    if (input.value === ADMIN_PASSWORD) {
        adminAuthenticated = true;
        showToast('✅ Admin access granted', 'success');
        initAdminPanel();
    } else {
        showToast('❌ Wrong password', 'error');
        input.value = '';
        input.focus();
    }
}

// ---------- Admin Dashboard ----------

function renderAdminDashboard(panel) {
    const locations = DataStore.getAll();
    const catCounts = {};
    locations.forEach(loc => {
        catCounts[loc.category] = (catCounts[loc.category] || 0) + 1;
    });

    panel.innerHTML = `
        <div class="panel-header">
            <h2>🔧 Admin Panel</h2>
            <p>Manage locations & destinations</p>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${locations.length}</div>
                <div class="stat-label">Locations</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.keys(catCounts).length}</div>
                <div class="stat-label">Categories</div>
            </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px;">
            <button class="btn btn-primary btn-block" onclick="openAddLocationForm()">
                ＋ Add Location
            </button>
            <button class="btn btn-secondary" onclick="resetData()" title="Reset to defaults">
                ↺
            </button>
        </div>

        <hr class="divider">

        <!-- Location list -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h3 style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 600;">
                All Locations
            </h3>
            <span style="font-size: 0.75rem; color: var(--text-tertiary)">${locations.length} total</span>
        </div>

        <input type="text" class="form-input" id="admin-search"
               placeholder="🔍 Search locations..."
               oninput="filterAdminList(this.value)"
               style="margin-bottom: 12px;">

        <div id="admin-location-list">
            ${renderAdminLocationList(locations)}
        </div>

        <hr class="divider">

        <button class="btn btn-secondary btn-block btn-sm" onclick="logoutAdmin()" style="margin-top: 8px;">
            🔒 Lock Admin
        </button>
    `;
}

function renderAdminLocationList(locations) {
    if (locations.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-icon">📍</div>
                <h3>No locations yet</h3>
                <p>Click "Add Location" to get started</p>
            </div>
        `;
    }

    return locations.map(loc => {
        const cat = CATEGORIES[loc.category] || CATEGORIES.heritage;
        return `
            <div class="admin-location-item" id="admin-item-${loc.id}">
                <div class="item-icon">${cat.icon}</div>
                <div class="item-info" onclick="flyToLocation('${loc.id}')" style="cursor:pointer">
                    <h4>${loc.name}</h4>
                    <span>${loc.district} · ${cat.label}</span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditLocationForm('${loc.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="btn btn-danger btn-icon btn-sm" onclick="deleteLocation('${loc.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterAdminList(query) {
    const locations = DataStore.getAll();
    const q = query.toLowerCase().trim();
    const filtered = q
        ? locations.filter(loc =>
            loc.name.toLowerCase().includes(q) ||
            loc.district.toLowerCase().includes(q) ||
            loc.category.toLowerCase().includes(q)
        )
        : locations;

    const list = document.getElementById('admin-location-list');
    if (list) {
        list.innerHTML = renderAdminLocationList(filtered);
    }
}

// ---------- Add / Edit Location Form ----------

function openAddLocationForm() {
    editingLocationId = null;
    showLocationFormModal({});
}

function openEditLocationForm(id) {
    const loc = DataStore.get(id);
    if (!loc) return;
    editingLocationId = id;
    showLocationFormModal(loc);
}

function showLocationFormModal(loc) {
    const overlay = document.getElementById('admin-form-overlay');
    if (!overlay) return;

    const isEdit = !!editingLocationId;

    overlay.innerHTML = `
        <div class="admin-form-modal">
            <h3>${isEdit ? '✏️ Edit' : '📍 Add'} Location</h3>

            <div class="form-group">
                <label>Location Name</label>
                <input type="text" class="form-input" id="loc-name" value="${loc.name || ''}" placeholder="e.g. Hampi, Coorg...">
            </div>

            <div class="form-group">
                <label>Category</label>
                <select class="form-select" id="loc-category">
                    ${Object.entries(CATEGORIES).map(([key, cat]) =>
                        `<option value="${key}" ${loc.category === key ? 'selected' : ''}>${cat.icon} ${cat.label}</option>`
                    ).join('')}
                </select>
            </div>

            <div class="form-group">
                <label>District</label>
                <input type="text" class="form-input" id="loc-district" value="${loc.district || ''}" placeholder="e.g. Mysore, Kodagu...">
            </div>

            <div class="form-group">
                <label>Description</label>
                <textarea class="form-textarea" id="loc-description" placeholder="Describe this destination...">${loc.description || ''}</textarea>
            </div>

            <div class="form-group">
                <label>Coordinates (click map or enter manually)</label>
                <div class="coord-display">
                    <div class="coord-field">
                        <label>Latitude</label>
                        <input type="number" step="0.001" class="form-input" id="loc-lat" value="${loc.lat || ''}" placeholder="e.g. 15.335">
                    </div>
                    <div class="coord-field">
                        <label>Longitude</label>
                        <input type="number" step="0.001" class="form-input" id="loc-lng" value="${loc.lng || ''}" placeholder="e.g. 76.460">
                    </div>
                </div>
                <button class="btn btn-secondary btn-sm" style="margin-top: 8px;" onclick="startPickLocation()">
                    📌 Pick on Map
                </button>
            </div>

            <div class="form-group">
                <label>Best Seasons</label>
                <div class="checkbox-group">
                    ${SEASONS.map(s => `
                        <label class="checkbox-chip ${(loc.bestSeasons || []).includes(s) ? 'checked' : ''}" data-value="${s}">
                            <input type="checkbox" name="loc-seasons" value="${s}" ${(loc.bestSeasons || []).includes(s) ? 'checked' : ''}>
                            <span>${s}</span>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label>Transport Options</label>
                <div class="checkbox-group">
                    ${TRANSPORT.map(t => {
                        const icons = { Car: '🚗', Bus: '🚌', Train: '🚂', Flight: '✈️' };
                        return `
                            <label class="checkbox-chip ${(loc.transport || []).includes(t) ? 'checked' : ''}" data-value="${t}">
                                <input type="checkbox" name="loc-transport" value="${t}" ${(loc.transport || []).includes(t) ? 'checked' : ''}>
                                <span>${icons[t]} ${t}</span>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="form-group">
                <label>Estimated Cost (₹ per person)</label>
                <input type="number" class="form-input" id="loc-cost" value="${loc.estimatedCost || ''}" placeholder="e.g. 5000">
            </div>

            <div class="form-group">
                <label>Recommended Duration</label>
                <select class="form-select" id="loc-duration">
                    <option value="">Select...</option>
                    ${DURATIONS.map(d =>
                        `<option value="${d}" ${loc.duration === d ? 'selected' : ''}>${d}</option>`
                    ).join('')}
                </select>
            </div>

            <div class="form-group">
                <label>Rating</label>
                <div class="star-rating" id="loc-rating">
                    ${[1, 2, 3, 4, 5].map(i => `
                        <span class="star ${i <= (loc.rating || 0) ? 'active' : ''}"
                              data-value="${i}"
                              onclick="setStarRating(${i})">★</span>
                    `).join('')}
                </div>
            </div>

            <div class="form-group">
                <label>Highlights (comma separated)</label>
                <input type="text" class="form-input" id="loc-highlights"
                       value="${(loc.highlights || []).join(', ')}"
                       placeholder="e.g. Sunset Point, Ancient Temple, Trekking">
            </div>

            <div class="form-group">
                <label>Image URL (optional)</label>
                <input type="text" class="form-input" id="loc-image" value="${loc.image || ''}" placeholder="https://...">
            </div>

            <div class="modal-actions">
                <button class="btn btn-primary btn-block" onclick="saveLocation()">
                    ${isEdit ? '💾 Update' : '✅ Add'} Location
                </button>
                <button class="btn btn-secondary" onclick="closeLocationForm()">Cancel</button>
            </div>
        </div>
    `;

    overlay.classList.add('active');

    // Setup chip toggles in modal
    overlay.querySelectorAll('.checkbox-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            const input = this.querySelector('input');
            if (input) {
                setTimeout(() => {
                    this.classList.toggle('checked', input.checked);
                }, 0);
            }
        });
    });
}

function closeLocationForm() {
    const overlay = document.getElementById('admin-form-overlay');
    if (overlay) overlay.classList.remove('active');
    editingLocationId = null;
    disableClickMode();
}

function setStarRating(value) {
    const stars = document.querySelectorAll('#loc-rating .star');
    stars.forEach(star => {
        const v = parseInt(star.dataset.value);
        star.classList.toggle('active', v <= value);
    });
    document.getElementById('loc-rating').dataset.selectedRating = value;
}

function startPickLocation() {
    showToast('📌 Click on the map to set coordinates', 'success');
    enableClickMode((lat, lng) => {
        const latInput = document.getElementById('loc-lat');
        const lngInput = document.getElementById('loc-lng');
        if (latInput) latInput.value = lat.toFixed(4);
        if (lngInput) lngInput.value = lng.toFixed(4);
        showToast(`📍 Location set: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'success');
    });
}

// ---------- Save Location ----------

function saveLocation() {
    const name = document.getElementById('loc-name')?.value.trim();
    const category = document.getElementById('loc-category')?.value;
    const district = document.getElementById('loc-district')?.value.trim();
    const description = document.getElementById('loc-description')?.value.trim();
    const lat = parseFloat(document.getElementById('loc-lat')?.value);
    const lng = parseFloat(document.getElementById('loc-lng')?.value);
    const estimatedCost = parseInt(document.getElementById('loc-cost')?.value) || 0;
    const duration = document.getElementById('loc-duration')?.value;
    const image = document.getElementById('loc-image')?.value.trim();
    const ratingEl = document.getElementById('loc-rating');
    const rating = parseInt(ratingEl?.dataset.selectedRating) || 0;

    const bestSeasons = Array.from(document.querySelectorAll('input[name="loc-seasons"]:checked')).map(i => i.value);
    const transport = Array.from(document.querySelectorAll('input[name="loc-transport"]:checked')).map(i => i.value);
    const highlights = (document.getElementById('loc-highlights')?.value || '')
        .split(',').map(h => h.trim()).filter(Boolean);

    // Validation
    if (!name) { showToast('❌ Name is required', 'error'); return; }
    if (!district) { showToast('❌ District is required', 'error'); return; }
    if (isNaN(lat) || isNaN(lng)) { showToast('❌ Valid coordinates are required', 'error'); return; }

    const locationData = {
        name, category, district, description, lat, lng,
        estimatedCost, duration, image, rating,
        bestSeasons, transport, highlights
    };

    if (editingLocationId) {
        DataStore.update(editingLocationId, locationData);
        showToast(`✅ "${name}" updated successfully`, 'success');
    } else {
        DataStore.add(locationData);
        showToast(`✅ "${name}" added successfully`, 'success');
    }

    closeLocationForm();
    refreshMarkers();
    renderAdminDashboard(document.getElementById('admin-panel'));
}

// ---------- Delete Location ----------

function deleteLocation(id) {
    const loc = DataStore.get(id);
    if (!loc) return;

    if (confirm(`Delete "${loc.name}"? This cannot be undone.`)) {
        DataStore.delete(id);
        refreshMarkers();
        renderAdminDashboard(document.getElementById('admin-panel'));
        showToast(`🗑️ "${loc.name}" deleted`, 'success');
    }
}

// ---------- Reset Data ----------

function resetData() {
    if (confirm('Reset all locations to default seed data? This will remove any custom locations.')) {
        DataStore.reset();
        refreshMarkers();
        renderAdminDashboard(document.getElementById('admin-panel'));
        showToast('↺ Data reset to defaults', 'success');
    }
}

// ---------- Logout ----------

function logoutAdmin() {
    adminAuthenticated = false;
    initAdminPanel();
    showToast('🔒 Admin locked', 'success');
}

// Expose renderAdminDashboard for internal refresh
function refreshAdminPanel() {
    if (adminAuthenticated) {
        renderAdminDashboard(document.getElementById('admin-panel'));
    }
}
