const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT || 3000;

const AUTH_HEADERS = {
    Authorization: "Token 9b7661d9292aab2c339b95bf251063791c2a62ff",
    "Content-Type": "application/json",
};

app.use(cors());

app.get("/api/nutresa/pdv", async (req, res) => {
    try {
        const response = await fetch(
            "https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/pdv_nutresa",
            { headers: AUTH_HEADERS }
        );
        
        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Error HTTP ${response.status}:`, text);
            return res.status(response.status).json({ error: `Error ${response.status}: ${text.substring(0, 200)}` });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("❌ Error en el proxy:", err);
        res.status(500).json({ error: "Error al obtener datos del PDV", details: err.message });
    }
});

// Endpoint legacy de Kimby (para compatibilidad)
app.get("/api/kimby/pdv", async (req, res) => {
    try {
        const response = await fetch(
            "https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/pdv_nutresa",
            { headers: AUTH_HEADERS }
        );
        
        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Error HTTP ${response.status}:`, text);
            return res.status(response.status).json({ error: `Error ${response.status}: ${text.substring(0, 200)}` });
        }
        
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("❌ Error en el proxy:", err);
        res.status(500).json({ error: "Error al obtener datos del PDV", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor proxy escuchando en http://localhost:${PORT}`);
});
