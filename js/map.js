// ============================================================
// map.js — Leaflet Map Engine
// Karnataka Travel Recommendation Website
// ============================================================

let map;
let markersLayer;
let geoJsonLayer;
let markerMap = {};        // locationId -> marker
let routeLayer = null;     // Polyline for plans
let clickMode = false;     // For admin click-to-place
let clickCallback = null;

// ---------- Initialize Map ----------

function initMap() {
    map = L.map('map', {
        center: [15.0, 76.0],
        zoom: 7,
        minZoom: 6,
        maxZoom: 17,
        zoomControl: false,
        attributionControl: true
    });

    // Standard Road Map — OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Zoom control on the right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Markers layer group
    markersLayer = L.layerGroup().addTo(map);

    // Load GeoJSON
    loadGeoJSON();

    // Map click handler (for admin mode)
    map.on('click', onMapClick);

    // Load markers from data
    refreshMarkers();

    console.log('🗺️ Map initialized');
}

// ---------- Load Karnataka GeoJSON ----------

function loadGeoJSON() {
    fetch('data/karnataka.geojson')
        .then(res => {
            if (!res.ok) throw new Error('GeoJSON not found');
            return res.json();
        })
        .then(data => {
            geoJsonLayer = L.geoJSON(data, {
                style: geoJsonStyle,
                onEachFeature: onEachDistrict
            }).addTo(map);
            console.log('✅ GeoJSON loaded');
        })
        .catch(err => {
            console.warn('⚠️ Could not load GeoJSON:', err.message);
            // Map still works without boundaries
        });
}

function geoJsonStyle(feature) {
    return {
        fillColor: 'rgba(232, 168, 56, 0.04)',
        weight: 1.2,
        opacity: 0.5,
        color: 'rgba(232, 168, 56, 0.2)',
        fillOpacity: 0.04,
        dashArray: ''
    };
}

function highlightDistrict(e) {
    const layer = e.target;
    layer.setStyle({
        weight: 2.5,
        color: 'rgba(232, 168, 56, 0.7)',
        fillOpacity: 0.1,
        fillColor: 'rgba(232, 168, 56, 0.15)'
    });
    layer.bringToFront();
}

function resetDistrictHighlight(e) {
    if (geoJsonLayer) {
        geoJsonLayer.resetStyle(e.target);
    }
}

function onEachDistrict(feature, layer) {
    const name = feature.properties.NAME_2 ||
                 feature.properties.name ||
                 feature.properties.district ||
                 feature.properties.DISTRICT ||
                 feature.properties.dtname ||
                 feature.properties.NAME_1 ||
                 'Unknown';

    layer.bindTooltip(name, {
        className: 'district-tooltip',
        sticky: true,
        direction: 'top',
        offset: [0, -10]
    });

    layer.on({
        mouseover: highlightDistrict,
        mouseout: resetDistrictHighlight
    });
}

// ---------- Markers ----------

function refreshMarkers(filterFn) {
    markersLayer.clearLayers();
    markerMap = {};

    let locations = DataStore.getAll();

    if (filterFn && typeof filterFn === 'function') {
        locations = locations.filter(filterFn);
    }

    locations.forEach(loc => {
        addMarker(loc);
    });

    // Update count badge
    const badge = document.getElementById('map-location-count');
    if (badge) {
        badge.textContent = `${locations.length} locations`;
    }

    // Update recommendation bar
    updateRecommendationBar(locations);

    return locations;
}

function addMarker(loc) {
    const cat = CATEGORIES[loc.category] || CATEGORIES.heritage;
    const color = cat.color;

    const markerHtml = `
        <div class="custom-marker">
            <div class="marker-pulse" style="color: ${color}"></div>
            <div class="marker-dot" style="background: ${color}; color: ${color}"></div>
        </div>
    `;

    const icon = L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20]
    });

    const marker = L.marker([loc.lat, loc.lng], { icon })
        .addTo(markersLayer);

    marker.bindPopup(() => createPopupContent(loc), {
        maxWidth: 280,
        closeButton: true,
        autoPan: true,
        autoPanPaddingTopLeft: [50, 80]
    });

    markerMap[loc.id] = marker;
    return marker;
}

function createPopupContent(loc) {
    const cat = CATEGORIES[loc.category] || CATEGORIES.heritage;
    const stars = '★'.repeat(loc.rating || 0) + '☆'.repeat(5 - (loc.rating || 0));

    const seasonTags = (loc.bestSeasons || []).map(s =>
        `<span class="meta-tag">${s}</span>`
    ).join('');

    const transportTags = (loc.transport || []).map(t => {
        const icons = { Car: '<i class="ri-car-line"></i>', Bus: '<i class="ri-bus-line"></i>', Train: '<i class="ri-train-line"></i>', Flight: '<i class="ri-flight-takeoff-line"></i>' };
        return `<span class="meta-tag">${icons[t] || ''} ${t}</span>`;
    }).join('');

    const highlightTags = (loc.highlights || []).slice(0, 4).map(h =>
        `<span class="highlight-tag">${h}</span>`
    ).join('');

    const imageSection = loc.image
        ? `<img src="${loc.image}" alt="${loc.name}" />`
        : `<div class="placeholder-icon">${cat.icon}</div>`;

    return `
        <div class="popup-card">
            <div class="popup-card-image" style="background: linear-gradient(135deg, ${cat.color}22, ${cat.color}08)">
                ${imageSection}
                <span class="category-badge" style="background: ${cat.color}66">${cat.icon} ${cat.label}</span>
            </div>
            <div class="popup-card-body">
                <h3>${loc.name}</h3>
                <div class="district"><i class="ri-map-pin-2-line"></i> ${loc.district}</div>
                <p class="description">${loc.description || 'A beautiful destination in Karnataka.'}</p>
                <div class="popup-meta">
                    ${seasonTags}
                    ${transportTags}
                </div>
                ${highlightTags ? `<div class="highlights-list">${highlightTags}</div>` : ''}
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <div class="popup-rating">${stars}</div>
                    <span style="font-size:0.78rem; color:var(--accent-gold); font-weight:600;">₹${(loc.estimatedCost || 0).toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    `;
}

function flyToLocation(id) {
    const loc = DataStore.get(id);
    if (!loc) return;

    map.flyTo([loc.lat, loc.lng], 12, {
        duration: 1.2,
        easeLinearity: 0.4
    });

    setTimeout(() => {
        const marker = markerMap[id];
        if (marker) marker.openPopup();
    }, 1200);
}

// ---------- Route Drawing (For Plans) ----------

function drawPlanRoute(planId) {
    clearPlanRoute(); // Clear existing route if any

    const plans = DataStore.getAllPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan || !plan.route || plan.route.length === 0) return;

    // Collect coordinates for the route
    const waypoints = [];
    const validMarkers = [];

    plan.route.forEach(locId => {
        const loc = DataStore.get(locId);
        if (loc) {
            waypoints.push(L.latLng(loc.lat, loc.lng));
            const marker = markerMap[locId];
            if (marker) validMarkers.push(marker);
        }
    });

    if (waypoints.length < 2) return; // Need at least 2 points to draw a line

    // Draw route with Leaflet Routing Machine
    routeLayer = L.Routing.control({
        waypoints: waypoints,
        lineOptions: {
            styles: [{ color: '#E8A838', opacity: 0.9, weight: 5 }]
        },
        createMarker: function() { return null; }, // Hide default markers
        show: false, // Hide turn-by-turn instructions
        addWaypoints: false, // Disable dragging to add points
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        showAlternatives: false
    }).addTo(map);

    // Highlight markers on route (optional: close other popups)
    validMarkers.forEach(m => {
        // Bring these to front if possible, or add a special class
        if (m._icon) m._icon.style.filter = 'drop-shadow(0 0 12px rgba(232, 168, 56, 1))';
    });
}

function clearPlanRoute() {
    if (routeLayer) {
        if (routeLayer instanceof L.Routing.Control) {
            map.removeControl(routeLayer);
        } else {
            map.removeLayer(routeLayer); // Fallback for any old polylines
        }
        routeLayer = null;
    }
    
    // Remove glow from all markers
    Object.values(markerMap).forEach(m => {
        if (m._icon) m._icon.style.filter = '';
    });
}

// ---------- Click-to-Place Mode ----------

function enableClickMode(callback) {
    clickMode = true;
    clickCallback = callback;
    map.getContainer().style.cursor = 'crosshair';
    const indicator = document.getElementById('click-mode-indicator');
    if (indicator) indicator.classList.add('active');
}

function disableClickMode() {
    clickMode = false;
    clickCallback = null;
    map.getContainer().style.cursor = '';
    const indicator = document.getElementById('click-mode-indicator');
    if (indicator) indicator.classList.remove('active');
}

function onMapClick(e) {
    if (!clickMode || !clickCallback) return;
    clickCallback(e.latlng.lat, e.latlng.lng);
    disableClickMode();
}

// ---------- Recommendation Bar ----------

function updateRecommendationBar(locations) {
    const container = document.getElementById('reco-scroll');
    if (!container) return;

    const top = locations.slice(0).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

    container.innerHTML = top.map(loc => {
        const cat = CATEGORIES[loc.category] || CATEGORIES.heritage;
        const stars = '★'.repeat(loc.rating || 0);
        return `
            <div class="reco-card" onclick="flyToLocation('${loc.id}')">
                <div class="reco-icon">${cat.icon}</div>
                <h4>${loc.name}</h4>
                <p>${loc.district} · ${cat.label}</p>
                <div class="reco-rating">${stars} · ₹${(loc.estimatedCost || 0).toLocaleString('en-IN')}</div>
            </div>
        `;
    }).join('');
}

// ---------- Map Legend ----------

function createMapLegend() {
    const legendDiv = document.getElementById('map-legend');
    if (!legendDiv) return;

    let html = '<h4>Categories</h4>';
    for (const [key, cat] of Object.entries(CATEGORIES)) {
        html += `
            <div class="legend-item">
                <div class="legend-dot" style="background: ${cat.color}; box-shadow: 0 0 6px ${cat.color}"></div>
                <span>${cat.icon} ${cat.label}</span>
            </div>
        `;
    }
    legendDiv.innerHTML = html;
}
