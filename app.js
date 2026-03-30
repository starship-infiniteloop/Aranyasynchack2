// --- ARANYASYNC CORE LOGIC ---

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize System Clock
    const timeDisplay = document.getElementById("sysTime");
    if (timeDisplay) {
        setInterval(() => {
            const now = new Date();
            timeDisplay.innerText = now.toLocaleTimeString("en-US", { hour12: false }) + " UTC";
        }, 1000);
    }
    
    // 2. Dashboard SPA View Toggling
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const views = document.querySelectorAll('.view-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update Active Nav Link
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch Views
            const targetId = item.getAttribute('data-target');
            views.forEach(view => {
                view.classList.remove('active');
                view.classList.add('hidden'); // Use inline display hide
                view.style.display = "none";
            });
            
            const activeView = document.getElementById(targetId);
            if (activeView) {
                activeView.classList.remove('hidden');
                activeView.classList.add('active');
                activeView.style.display = "block";
                
                // Re-render charts if analytics view opened to ensure accurate sizing
                if (targetId === 'view-analytics' && !window.chartsRendered) {
                    renderCharts();
                    window.chartsRendered = true;
                }
            }
        });
    });
    
    // Hide all initially except active
    views.forEach(view => {
        if (!view.classList.contains('active')) {
            view.style.display = "none";
        }
    });

    // 3. Render Mini Chart (Dashboard Overview)
    const ctxMini = document.getElementById('miniDensityChart');
    if (ctxMini && window.Chart) {
        new Chart(ctxMini, {
            type: 'line',
            data: {
                labels: ['0', '1', '2', '3', '4', '5'],
                datasets: [{
                    label: 'Density',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#4F6F65',
                    backgroundColor: 'rgba(79, 111, 101, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    // 4. Initialize Vehicle Simulation Table
    const tbody = document.getElementById('vehicleTableBody');
    if (tbody) {
        const vehicles = [
            { id: 'V-04', speed: 32, loc: 'Core Zone 1', driver: 'Arjun K.', status: 'OK' },
            { id: 'V-12', speed: 45, loc: 'Buffer South', driver: 'Samir N.', status: 'OVERSPEED' },
            { id: 'V-09', speed: 0, loc: 'Sector 4G', driver: 'Priya R.', status: 'SOS' },
            { id: 'V-22', speed: 28, loc: 'River Bank', driver: 'Karan V.', status: 'OK' }
        ];
        
        const renderVehicles = () => {
            tbody.innerHTML = '';
            vehicles.forEach(v => {
                // Simulate slight speed changes naturally
                if (v.status !== 'SOS') v.speed = Math.max(0, v.speed + (Math.random() * 4 - 2));
                const speedClass = v.speed > 40 ? 'status-danger' : 'status-ok';
                const sLabel = v.speed > 40 ? 'OVERSPEED' : v.status;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${v.id}</td>
                    <td class="${speedClass}">${Math.round(v.speed)} km/h</td>
                    <td>${v.loc}</td>
                    <td>${v.driver}</td>
                    <td><span class="${v.status === 'SOS' || v.speed > 40 ? 'status-danger' : 'status-ok'}">${v.status === 'SOS' ? 'EMERGENCY' : sLabel}</span></td>
                `;
                tbody.appendChild(tr);
            });
        };
        
        renderVehicles();
        setInterval(renderVehicles, 3000); // 3-second heartbeat updates
    }
});

// --- CHART.JS METRICS RENDERING ---
function renderCharts() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = 'rgba(231, 226, 217, 0.6)';
    Chart.defaults.font.family = "'Rajdhani', sans-serif";
    
    const ctxBookings = document.getElementById('bookingsChart');
    if (ctxBookings) {
        new Chart(ctxBookings, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Bookings',
                    data: [120, 150, 180, 140, 210, 320, 305],
                    backgroundColor: '#B3B79C',
                    borderRadius: 4
                }]
            },
            options: { responsive: true }
        });
    }

    const ctxRev = document.getElementById('revenueChart');
    if (ctxRev) {
        new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [1.2, 1.5, 1.4, 1.8],
                    borderColor: '#4F6F65',
                    backgroundColor: 'rgba(79, 111, 101, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: { responsive: true, plugins: { tooltips: { callbacks: { label: (c) => `₹${c.raw}L` } } } }
        });
    }

    const ctxZone = document.getElementById('zoneChart');
    if (ctxZone) {
        new Chart(ctxZone, {
            type: 'doughnut',
            data: {
                labels: ['Core North', 'Core South', 'River Buffer', 'Outer Zone'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#4F6F65', '#B3B79C', '#343C4A', '#ff4757'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%' }
        });
    }
}

// --- LEAFLET.JS MAP INITIALIZATION (map.html Only) ---
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement || typeof L === 'undefined') return;
    
    // Core Coordinates (Bandipur/Nagarhole area roughly for Western Ghats context)
    const centerPoint = [11.82, 76.4];
    
    const map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView(centerPoint, 13);
    
    // CartoDB Dark Matter Base map tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    // Add custom zoom controls top-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Mock Geo-Zones
    const coreZone = L.polygon([
        [11.85, 76.38], [11.86, 76.42], [11.81, 76.43], [11.80, 76.39]
    ], { color: '#4F6F65', fillColor: '#4F6F65', fillOpacity: 0.2, weight: 2 }).addTo(map);
    coreZone.bindTooltip("Core Zone Alpha");

    const restrictZone = L.polygon([
        [11.82, 76.45], [11.84, 76.47], [11.80, 76.48], [11.79, 76.45]
    ], { color: '#ff4757', fillColor: '#ff4757', fillOpacity: 0.2, weight: 2, dashArray: '5, 10' }).addTo(map);
    restrictZone.bindTooltip("RESTRICTED: Tiger Cubs Sighted");

    const layers = {
        vehicles: L.layerGroup().addTo(map),
        wildlife: L.layerGroup().addTo(map),
        zones: L.layerGroup([coreZone, restrictZone]).addTo(map)
    };

    // Custom Map Markers
    const createLiveIcon = (colorClass) => {
        return L.divIcon({
            className: `custom-marker ${colorClass}`,
            html: '<div style="width: 14px; height: 14px;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    };

    // Add Vehicles
    const v1 = L.marker([11.83, 76.40], { icon: createLiveIcon('live-marker') }).addTo(layers.vehicles);
    v1.bindPopup('<div class="popup-title">V-04</div>Driver: Arjun K.<br>Speed: 32 km/h<br>Status: OK');
    
    const v2 = L.marker([11.81, 76.46], { icon: createLiveIcon('danger-marker') }).addTo(layers.vehicles); // Overspeed
    v2.bindPopup('<div class="popup-title">V-12 [ALERT]</div>Driver: Samir N.<br>Speed: 45 km/h<br>Status: OVERSPEED');

    // Add Wildlife (Static points)
    const tIcon = L.divIcon({ className: 'custom-animal', html: '🐅', iconSize: [20, 20] });
    const eIcon = L.divIcon({ className: 'custom-animal', html: '🐘', iconSize: [20, 20] });
    
    L.marker([11.84, 76.39], { icon: tIcon }).addTo(layers.wildlife).bindPopup("Bengal Tiger (T-41)<br>Sighted 12 mins ago");
    L.marker([11.80, 76.44], { icon: eIcon }).addTo(layers.wildlife).bindPopup("Elephant Herd<br>Sighted 3 hours ago");

    // UI Panel Interactivity
    const infoPanel = document.getElementById('targetInfo');
    map.on('popupopen', function(e) {
        if(infoPanel) infoPanel.innerHTML = e.popup.getContent();
    });
    map.on('popupclose', function() {
        if(infoPanel) infoPanel.innerHTML = "No target currently selected.";
    });

    // Layer Toggles
    const setupToggle = (id, layerName) => {
        const toggle = document.getElementById(id);
        if(toggle) {
            toggle.addEventListener('change', (e) => {
                if(e.target.checked) map.addLayer(layers[layerName]);
                else map.removeLayer(layers[layerName]);
            });
        }
    };
    setupToggle('toggleVehicles', 'vehicles');
    setupToggle('toggleWildlife', 'wildlife');
    setupToggle('toggleZones', 'zones');

    // Simulate Vehicle Movement
    setInterval(() => {
        const pos = v1.getLatLng();
        // Move randomly small amounts
        v1.setLatLng([pos.lat + (Math.random() * 0.002 - 0.001), pos.lng + (Math.random() * 0.002 - 0.001)]);
    }, 2000);
}
