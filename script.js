let debounceTimer;
let fuse = null;
let allData = [];
let fullData = [];
let allEventos = [];
let selectedEvento = null;

// Endpoint directo
// const DATA_URL = 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/pdv_nutresa';

// Endpoint de Railway (proxy Nutresa)
const DATA_URL = 'https://pdvnutresa-production.up.railway.app/api/nutresa/pdv';

// Endpoints anteriores de Kimby (descomentar para usar):
// const KIMBY_PDV_URL = 'https://kimby-production.up.railway.app/api/kimby/pdv';

async function loadData() {
    try {
        if (!allData.length) {
            const response = await fetch(DATA_URL);
            const json = await response.json();
            allData = json.result || [];
            extractEventos();
            populateEventDropdown();
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
        document.getElementById('results').innerHTML = `
            <p style="color:red;"> No se pudo cargar la información. 
            Es posible que los permisos de CORS o el servidor estén bloqueando la conexión.</p>`;
    }
}

function extractEventos() {
    const eventosSet = new Set();
    allData.forEach(item => {
        if (item.EVENTO) {
            eventosSet.add(item.EVENTO);
        }
    });
    allEventos = Array.from(eventosSet).sort();
}

function populateEventDropdown() {
    const eventSelect = document.getElementById('eventSelect');
    eventSelect.innerHTML = '<option value="">Selecciona un evento</option>';
    allEventos.forEach(evento => {
        const option = document.createElement('option');
        option.value = evento;
        option.textContent = evento;
        eventSelect.appendChild(option);
    });
}

function updateEventSelection() {
    const evento = document.getElementById('eventSelect').value;
    const searchInput = document.getElementById('searchInput');
    
    selectedEvento = evento;
    searchInput.value = '';
    document.getElementById('results').innerHTML = '';
    
    if (evento) {
        searchInput.disabled = false;
        fullData = allData.filter(item => item.EVENTO === evento);
        initializeFuse();
    } else {
        searchInput.disabled = true;
        fullData = [];
    }
}

function initializeFuse() {
    const options = {
        keys: ['SAP', 'PDV', 'CIUDAD', 'DIRECCION', 'MARCA'],
        threshold: 0.3,
    };
    fuse = new Fuse(fullData, options);
}

function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        if (searchInput.trim()) {
            performSearch(searchInput);
        } else {
            document.getElementById('results').innerHTML = '';
        }
    }, 300);
}

function performSearch(query) {
    if (!fuse) return;
    const results = fuse.search(query).map(result => result.item);
    renderResults(results);
}

function renderResults(results) {
    let output = `<h2>Resultados (${results.length} encontrados):</h2>`;

    if (results.length > 0) {
        results.forEach(result => {
            const nombre = result.PDV || 'Sin nombre';

            output += `
                <div class="result-item pdv" role="region" aria-label="${nombre}">
                    <h3>
                        <i class="material-icons icon-tipo">store</i>
                        ${nombre}
                    </h3>
                    <div class="tags">
                        ${result.CIUDAD ? `<span class="tag ciudad">${result.CIUDAD}</span>` : ''}
                        ${result.MARCA ? `<span class="tag marca">${result.MARCA}</span>` : ''}
                    </div>
                    <ul>
                        <li><strong>SAP:</strong> ${result.SAP}
                            <i class="material-icons copy-icon" role="button" tabindex="0" aria-label="Copiar SAP" onclick="copyToClipboard('${result.SAP}')">content_copy</i>
                        </li>
                        <li><strong>Dirección:</strong> ${result.DIRECCION || 'N/A'}</li>
                    </ul>
                </div>
            `;
        });
    } else {
        output += '<p>No se encontraron resultados.</p>';
    }

    document.getElementById('results').innerHTML = output;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert('SAP copiado al portapapeles');
        })
        .catch(err => {
            alert('Error al copiar el SAP');
            console.error('Error:', err);
        });
}

function toggleDarkMode() {
    const isDark = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeLabel').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

window.onload = () => {
    const darkModeSetting = localStorage.getItem('darkMode');
    const isDark = darkModeSetting === 'enabled';
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeToggle').checked = isDark;
    document.getElementById('darkModeLabel').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
};

loadData();
