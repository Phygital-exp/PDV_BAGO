let debounceTimer;
let fuse = null;
let allData = [];

// Endpoint de Bago
const DATA_URL = 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/pdv_bago';

async function loadData() {
    try {
        const response = await fetch(DATA_URL);
        const json = await response.json();
        allData = json.result || [];
        initializeFuse();
        document.getElementById('searchInput').disabled = false;
    } catch (error) {
        console.error("Error al cargar datos:", error);
        document.getElementById('results').innerHTML = `
            <p style="color:red;"> No se pudo cargar la información.
            Es posible que los permisos de CORS o el servidor estén bloqueando la conexión.</p>`;
    }
}

function initializeFuse() {
    const options = {
        keys: ['PDV', 'CUIDAD', 'REGION', 'CANAL', 'CADENA', 'ZONA', 'KEY'],
        threshold: 0.3,
    };
    fuse = new Fuse(allData, options);
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
                        ${result.CUIDAD ? `<span class="tag ciudad">${result.CUIDAD}</span>` : ''}
                        ${result.CANAL ? `<span class="tag marca">${result.CANAL}</span>` : ''}
                    </div>
                    <ul>
                        <li><strong>ID:</strong> ${result.ID}
                            <i class="material-icons copy-icon" role="button" tabindex="0" aria-label="Copiar ID" onclick="copyToClipboard('${result.ID}')">content_copy</i>
                        </li>
                        <li><strong>Región:</strong> ${result.REGION || 'N/A'}</li>
                        <li><strong>Ciudad:</strong> ${result.CUIDAD || 'N/A'}</li>
                        <li><strong>Cadena:</strong> ${result.CADENA || 'N/A'}</li>
                        <li><strong>Zona:</strong> ${result.ZONA || 'N/A'}</li>
                        <li><strong>SK Punto Venta:</strong> ${result.SKPuntoVenta || 'N/A'}</li>
                        <li><strong>Key:</strong> ${result.KEY || 'N/A'}</li>
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
            alert('ID copiado al portapapeles');
        })
        .catch(err => {
            alert('Error al copiar el ID');
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
