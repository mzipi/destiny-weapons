import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/armas', async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';

    const url = 'https://www.bungie.net/common/destiny2_content/json/es-mx/aggregate-180d19ec-32f8-4b44-8b2a-fcc5163f4db0.json';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.DestinyInventoryItemDefinition) {
            const armas = Object.values(data.DestinyInventoryItemDefinition)
                .filter(item => item.itemType === 3) // Filtrar solo armas
                .filter(arma => arma.displayProperties.name.toLowerCase().includes(searchTerm)); // Filtrar por nombre

                const armasConSockets = armas.map(arma => {
                    const sockets = [];
                
                    if (arma.sockets && arma.sockets.socketEntries) {
                        const primerosSockets = arma.sockets.socketEntries.slice(0, 5);
                
                        primerosSockets.forEach(socket => {
                            if (socket.randomizedPlugSetHash) {
                                const plugSet = data.DestinyPlugSetDefinition[socket.randomizedPlugSetHash];
                
                                if (plugSet && plugSet.reusablePlugItems) {
                                    const perks = plugSet.reusablePlugItems.map(plug => {
                                        const plugItem = data.DestinyInventoryItemDefinition[plug.plugItemHash];
                                        return plugItem ? {
                                            name: plugItem.displayProperties.name,
                                            icon: plugItem.displayProperties.icon,
                                            itemTypeDisplayName: plugItem.itemTypeDisplayName // Agregar tipo de item
                                        } : null;
                                    }).filter(perk => perk !== null);
                
                                    sockets.push({
                                        itemTypeDisplayName: perks.length > 0 ? perks[0].itemTypeDisplayName : "Desconocido", // Mostrar tipo de item
                                        perks
                                    });
                                }
                            }
                        });
                    }
                
                    return { ...arma, sockets };
                });
                
                res.json(armasConSockets);
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
