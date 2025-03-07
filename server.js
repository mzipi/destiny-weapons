import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/armas', async (req, res) => {
    const searchTerm = req.query.search || '';

    const url = 'https://www.bungie.net/common/destiny2_content/json/es-mx/DestinyInventoryItemDefinition-180d19ec-32f8-4b44-8b2a-fcc5163f4db0.json';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Error al obtener datos de Bungie' });
        }

        const data = await response.json();

        if (data) {
            const armas = Object.values(data)
                .filter(item => item.itemType === 3);

            const filteredArmas = armas.filter(arma => 
                arma.displayProperties.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            res.json(filteredArmas);
        } else {
            res.status(404).json({ error: 'No se encontraron armas' });
        }
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
