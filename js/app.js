// ============================================================
// app.js — App Initialization, Navigation & Utilities
// Karnataka Travel Recommendation Website
// ============================================================

let currentView = 'explore'; // 'explore' | 'admin'

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

    // Create map legend
    createMapLegend();

    // Set default view
    switchView('explore');

    console.log('🚀 Gaalipata Adventures initialized');
});

// ---------- Navigation ----------

function switchView(view) {
    currentView = view;

    // Toggle panels
    document.getElementById('explore-panel')?.classList.toggle('active', view === 'explore');
    document.getElementById('admin-panel')?.classList.toggle('active', view === 'admin');

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Re-init admin panel if switching to it
    if (view === 'admin') {
        initAdminPanel();
    }

    // Re-init form if switching to explore
    if (view === 'explore') {
        // Refresh results
        const results = refreshMarkers();
        renderResults(results);
    }
}

// ---------- Sidebar Toggle ----------

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
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

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
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
