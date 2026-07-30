const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT || 3000;

const AUTH_HEADERS = {
    Authorization: "Token 9b7661d9292aab2c339b95bf251063791c2a62ff",
    "Content-Type": "application/json",
};

const BAGO_URL = "https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/pdv_bago";

app.use(cors());

async function fetchPdvData(res, url) {
    try {
        const response = await fetch(url, { headers: AUTH_HEADERS });

        if (!response.ok) {
            const text = await response.text();
            const headersDump = {};
            response.headers.forEach((value, key) => { headersDump[key] = value; });
            console.error(`❌ Error HTTP ${response.status} al llamar ${url}`);
            console.error("Headers de la respuesta:", JSON.stringify(headersDump));
            console.error("Cuerpo de la respuesta:", text.substring(0, 500));
            return res.status(response.status).json({ error: `Error ${response.status}: ${text.substring(0, 200)}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("❌ Error en el proxy:", err);
        res.status(500).json({ error: "Error al obtener datos del PDV", details: err.message });
    }
}

app.get("/api/bago/pdv", (req, res) => fetchPdvData(res, BAGO_URL));

// Endpoint legacy de Kimby (para compatibilidad)
app.get("/api/kimby/pdv", (req, res) => fetchPdvData(res, BAGO_URL));

// Diagnóstico: expone la IP de salida de este contenedor para poder pedir su whitelist
app.get("/debug/egress-ip", async (req, res) => {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor proxy escuchando en http://localhost:${PORT}`);
});
