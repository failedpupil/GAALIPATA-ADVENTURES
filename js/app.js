// ============================================================
// app.js — App Initialization, Navigation & Utilities
// Karnataka Travel Recommendation Website
// ============================================================

let currentView = 'explore'; // 'explore' | 'admin' | 'plans'

// ---------- App Init ----------

document.addEventListener('DOMContentLoaded', () => {
    // Seed data on first load
    DataStore.seedData();

    // Create background particles
    createParticles();

    // Initialize map
    initMap();

    // Initialize panels
    initFormPanel();
    initAdminPanel();
    initPlansPanel();

    // Create map legend
    createMapLegend();

    // Close settings dropdown on outside click
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('settings-dropdown');
        const btn = document.getElementById('nav-settings');
        if (dropdown && btn && !dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    console.log('🚀 Gaalipata Adventures initialized');
});

// ---------- Landing Page & Navigation ----------

function enterApp(view) {
    const overlay = document.getElementById('landing-overlay');
    if (!overlay) return switchView(view);

    // Initialize the selected view
    switchView(view);

    // Fade out overlay
    overlay.classList.add('fade-out');

    // Remove from DOM after animation completes
    setTimeout(() => {
        overlay.remove();
        // Trigger a map resize just in case to fix Leaflet gray tiles issue
        if (map) map.invalidateSize();
    }, 600);
}

function switchView(view) {
    currentView = view;

    // Toggle panels
    document.getElementById('plans-panel')?.classList.toggle('active', view === 'plans');
    document.getElementById('explore-panel')?.classList.toggle('active', view === 'explore');
    document.getElementById('admin-panel')?.classList.toggle('active', view === 'admin');

    // Update nav buttons
    document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Re-init admin panel if switching to it
    if (view === 'admin') {
        initAdminPanel();
    }

    // Re-init form if switching to explore
    if (view === 'explore') {
        if (typeof clearPlanRoute === 'function') clearPlanRoute();
        const results = refreshMarkers();
        renderResults(results);
    }

    // Re-init plans if switching to it
    if (view === 'plans') {
        initPlansPanel();
    } else {
        // Clear route if we leave plans view
        if (typeof clearPlanRoute === 'function') clearPlanRoute();
    }
}

// ---------- Sidebar Toggle ----------

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// ---------- Settings Menu ----------

function toggleSettingsMenu(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('settings-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
    }
}

function closeSettingsMenu() {
    const dropdown = document.getElementById('settings-dropdown');
    if (dropdown) {
        dropdown.classList.remove('open');
    }
}

// ---------- Theme Toggle (placeholder) ----------

function toggleThemeMode() {
    showToast('🌙 Theme switching coming soon!', 'success');
}

// ---------- About ----------

function showAbout() {
    showToast('<i class="ri-compass-discover-line"></i> Gaalipata Adventures v1.0 — Discover Karnataka!', 'success');
}

// ---------- Plans Panel ----------

function initPlansPanel() {
    const panel = document.getElementById('plans-panel');
    if (!panel) return;

    // Make sure we clear any active route when returning to the plans list
    if (typeof clearPlanRoute === 'function') clearPlanRoute();
    // And reset map zoom slightly to show all of Karnataka
    if (map) map.flyTo([15.0, 76.0], 7, { duration: 1 });
    
    // Make sure all markers are visible
    refreshMarkers();

    const plans = DataStore.getAllPlans();

    panel.innerHTML = `
        <div class="panel-header">
            <h2><i class="ri-route-line"></i> Gaalipata Plans</h2>
            <p>Curated itineraries for your perfect Karnataka adventure</p>
        </div>

        <div class="plans-list" style="margin-top: 15px;">
            ${plans.map(plan => {
                const icon = plan.theme === 'beach' ? '<i class="ri-sun-line"></i>' : plan.theme === 'heritage' ? '<i class="ri-ancient-gate-line"></i>' : plan.theme === 'wildlife' ? '<i class="ri-bear-smile-line"></i>' : '<i class="ri-leaf-line"></i>';
                const color = plan.theme === 'beach' ? '#42A5F5' : plan.theme === 'heritage' ? '#E8A838' : plan.theme === 'wildlife' ? '#FF6B6B' : '#00D4AA';
                
                return `
                    <div class="location-card" onclick="showPlanDetails('${plan.id}')" style="cursor:pointer; border-left: 4px solid ${color};">
                        <div class="card-icon" style="background: ${color}15; color: ${color}; font-size: 1.5rem;">
                            ${icon}
                        </div>
                        <div class="card-info">
                            <h4>${plan.title}</h4>
                            <div class="card-meta">
                                <span style="color: ${color}">${plan.days}</span>
                                <span>${plan.route.length} stops</span>
                            </div>
                            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.3;">
                                ${plan.description}
                            </p>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function showPlanDetails(planId) {
    const panel = document.getElementById('plans-panel');
    const plan = DataStore.getAllPlans().find(p => p.id === planId);
    
    if (!panel || !plan) return;

    // Draw the route on the map
    if (typeof drawPlanRoute === 'function') drawPlanRoute(planId);

    const icon = plan.theme === 'beach' ? '<i class="ri-sun-line"></i>' : plan.theme === 'heritage' ? '<i class="ri-ancient-gate-line"></i>' : plan.theme === 'wildlife' ? '<i class="ri-bear-smile-line"></i>' : '<i class="ri-leaf-line"></i>';
    const color = plan.theme === 'beach' ? '#42A5F5' : plan.theme === 'heritage' ? '#E8A838' : plan.theme === 'wildlife' ? '#FF6B6B' : '#00D4AA';

    let routeHtml = '';
    plan.route.forEach((locId, index) => {
        const loc = DataStore.get(locId);
        if (!loc) return;
        const cat = CATEGORIES[loc.category] || CATEGORIES.heritage;
        
        routeHtml += `
            <div class="plan-stop" style="display: flex; gap: 15px; margin-bottom: 20px; position: relative;">
                ${index < plan.route.length - 1 ? `<div style="position: absolute; left: 15px; top: 35px; bottom: -20px; width: 2px; background: rgba(255,255,255,0.1);"></div>` : ''}
                
                <div style="width: 32px; height: 32px; border-radius: 50%; background: ${color}22; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: ${color}; z-index: 2; flex-shrink: 0;">
                    ${index + 1}
                </div>
                
                <div class="location-card" onclick="flyToLocation('${loc.id}')" style="margin: 0; flex: 1;">
                    <div class="card-info">
                        <h4>${loc.name}</h4>
                        <div class="card-district">${loc.district}</div>
                        <div class="card-meta">
                            <span style="color: ${cat.color}">${cat.label}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    panel.innerHTML = `
        <div class="panel-header" style="padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
            <button onclick="initPlansPanel()" style="background:none; border:none; color: var(--text-secondary); cursor:pointer; display:flex; align-items:center; gap:5px; font-size:0.9rem; margin-bottom:15px; padding:0;">
                <span><i class="ri-arrow-left-line"></i></span> Back to Plans
            </button>
            <h2 style="display:flex; align-items:center; gap:8px;">
                <span style="color: ${color}">${icon}</span> ${plan.title}
            </h2>
            <div style="display:flex; gap: 10px; margin-top: 5px;">
                <span style="font-size: 0.85rem; background: ${color}22; color: ${color}; padding: 2px 8px; border-radius: 12px;">${plan.days}</span>
                <span style="font-size: 0.85rem; color: var(--text-tertiary);">${plan.route.length} Destinations</span>
            </div>
        </div>

        <div class="plan-route-timeline">
            ${routeHtml}
        </div>
    `;
}

// ---------- Background Particles ----------

function createParticles() {
    const container = document.querySelector('.bg-animation');
    if (!container) return;

    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (8 + Math.random() * 15) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;

        // Randomize color
        const colors = ['#E8A838', '#00D4AA', '#FF6B6B', '#42A5F5'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        container.appendChild(particle);
    }
}

// ---------- Toast System ----------

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '<i class="ri-check-line"></i>' : type === 'error' ? '<i class="ri-close-line"></i>' : '<i class="ri-information-line"></i>';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    container.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---------- Utility ----------

function formatCurrency(amount) {
    return '₹' + (amount || 0).toLocaleString('en-IN');
}
