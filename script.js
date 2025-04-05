// Initialize map with a modern style
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([0, 0], 2);

// Add zoom controls to the top right
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Define base maps with modern styling
const baseMaps = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
    }),
    cartodb: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors & CartoDB'
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors & CartoDB'
    })
};

// Add default base map
baseMaps.osm.addTo(map);

// DOM elements
const geojsonInput = document.getElementById('geojson-input');
const geojsonName = document.getElementById('geojson-name');
const visualizeBtn = document.getElementById('visualize-btn');
const resetBtn = document.getElementById('reset-btn');
const baseMapSelect = document.getElementById('base-map');
const errorMessage = document.getElementById('error-message');

// Store the current GeoJSON layer
let currentLayer = null;

// Function to validate GeoJSON
function isValidGeoJSON(str) {
    try {
        const geojson = JSON.parse(str);
        return geojson.type === 'Feature' || geojson.type === 'FeatureCollection' || geojson.type === 'GeometryCollection';
    } catch (e) {
        return false;
    }
}

// Function to show error message with animation
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('animate-fade-in');
    setTimeout(() => {
        errorMessage.classList.remove('animate-fade-in');
    }, 300);
}

// Function to hide error message with animation
function hideError() {
    errorMessage.classList.add('animate-fade-out');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
        errorMessage.classList.remove('animate-fade-out');
    }, 300);
}

// Function to reset the application
function resetApplication() {
    // Clear input fields with animation
    geojsonInput.value = '';
    geojsonName.value = '';
    
    // Remove current layer from map
    if (currentLayer) {
        map.removeLayer(currentLayer);
        currentLayer = null;
    }
    
    // Reset map view
    map.setView([0, 0], 2);
    
    // Hide any error messages
    hideError();
}

// Function to visualize GeoJSON with modern styling
function visualizeGeoJSON() {
    const name = geojsonName.value.trim();
    const geojsonStr = geojsonInput.value.trim();

    if (!name) {
        showError('Please enter a name for your layer');
        return;
    }

    if (!geojsonStr) {
        showError('Please paste some GeoJSON data');
        return;
    }

    if (!isValidGeoJSON(geojsonStr)) {
        showError('Invalid GeoJSON format. Please check your input.');
        return;
    }

    try {
        const geojsonData = JSON.parse(geojsonStr);
        
        // Remove existing layer if any
        if (currentLayer) {
            map.removeLayer(currentLayer);
        }

        // Add new layer with modern styling
        currentLayer = L.geoJSON(geojsonData, {
            style: function(feature) {
                return {
                    color: '#2094f3',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.2
                };
            },
            onEachFeature: function(feature, layer) {
                if (feature.properties) {
                    layer.bindTooltip(JSON.stringify(feature.properties), {
                        className: 'custom-tooltip',
                        offset: [0, -10]
                    });
                }
            }
        }).addTo(map);

        // Fit bounds to show all features with padding
        const bounds = currentLayer.getBounds();
        map.fitBounds(bounds, {
            padding: [50, 50]
        });

        hideError();
    } catch (e) {
        showError('Error processing GeoJSON: ' + e.message);
    }
}

// Function to change base map with smooth transition
function changeBaseMap() {
    const selectedBaseMap = baseMapSelect.value;
    map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
            map.removeLayer(layer);
        }
    });
    baseMaps[selectedBaseMap].addTo(map);
}

// Event listeners with modern interaction handling
visualizeBtn.addEventListener('click', () => {
    visualizeBtn.classList.add('scale-95');
    setTimeout(() => {
        visualizeBtn.classList.remove('scale-95');
    }, 100);
    visualizeGeoJSON();
});

resetBtn.addEventListener('click', () => {
    resetBtn.classList.add('scale-95');
    setTimeout(() => {
        resetBtn.classList.remove('scale-95');
    }, 100);
    resetApplication();
});

baseMapSelect.addEventListener('change', changeBaseMap);

// Add keyboard shortcut (Ctrl/Cmd + Enter)
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        visualizeGeoJSON();
    }
}); 