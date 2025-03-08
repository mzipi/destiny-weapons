import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

const ammoTypeMap = {
    0: "None",
    1: "Principal",
    2: "Especial",
    3: "Pesada",
    4: "Desconocida"
};

const findAmmoTypeNameFromNodeDefinition = (ammoTypeId, data) => {
    const ammoTypeNameFromMap = ammoTypeMap[ammoTypeId] || "Desconocido";
    const ammoTypeNode = Object.values(data.DestinyPresentationNodeDefinition).find(item => {
        return item.displayProperties?.name === ammoTypeNameFromMap;
    });

    if (ammoTypeNode) {
        const icon = ammoTypeNode.displayProperties.icon;
        return icon ? `https://www.bungie.net${icon}` : null;  // Concatenamos la URL de Bungie con el icono
    }

    return null;
};

app.get('/armas', async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';

    const url = 'https://www.bungie.net/common/destiny2_content/json/es-mx/aggregate-180d19ec-32f8-4b44-8b2a-fcc5163f4db0.json';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.DestinyInventoryItemDefinition) {

            const armas = Object.values(data.DestinyInventoryItemDefinition)
                .filter(item => item.itemType === 3)
                .filter(arma => arma.displayProperties.name.toLowerCase().includes(searchTerm));

            const armasConSockets = armas.map(arma => {
                const sockets = [];

                const defaultDamageTypeHash = arma.defaultDamageTypeHash;
                const damageType = data.DestinyDamageTypeDefinition[defaultDamageTypeHash];
                const damageTypeIcon = damageType ? `https://www.bungie.net${damageType.displayProperties.icon}` : null;
                const itemSubType = arma.itemTypeDisplayName || "Desconocido";
                const equippingBlock = arma.equippingBlock || {};
                const ammoTypeId = equippingBlock.ammoType || 4; // Usamos "Desconocida" por defecto si no hay valor
                const ammoTypeName = findAmmoTypeNameFromNodeDefinition(ammoTypeId, data); // Buscar nombre de ammoType
                const equipmentSlotTypeHash = arma.equippingBlock?.equipmentSlotTypeHash;
                const equipmentSlot = equipmentSlotTypeHash ? data.DestinyEquipmentSlotDefinition[equipmentSlotTypeHash] : null;
                const equipmentSlotName = equipmentSlot ? equipmentSlot.displayProperties.name : "Desconocido";
                const secondaryIcon = arma.displayProperties.secondaryIcon;

                const stats = arma.stats?.stats
                    ? Object.entries(arma.stats.stats)
                        .filter(([statHash, statData], index) => ![4, 5, 6, 7].includes(index))
                        .map(([statHash, statData]) => {
                            const statDefinition = data.DestinyStatDefinition[statHash];
                            const statName = statDefinition ? statDefinition.displayProperties.name : "Desconocido";
                            return {
                                statName,
                                value: statData.value,
                            };
                        })
                    : [];

                const breakerTypeHash = arma.breakerTypeHash ? data.DestinyBreakerTypeDefinition[arma.breakerTypeHash] : null;
                const breakerTypeIcon = breakerTypeHash?.displayProperties?.icon || null;

                if (arma.sockets && arma.sockets.socketEntries) {
                    const primerosSockets = [
                        arma.sockets.socketEntries[0],
                        arma.sockets.socketEntries[1],
                        arma.sockets.socketEntries[2],
                        arma.sockets.socketEntries[3],
                        arma.sockets.socketEntries[4],
                        arma.sockets.socketEntries[6],
                        arma.sockets.socketEntries[7],
                        arma.sockets.socketEntries[8],
                    ];

                    primerosSockets.forEach((socket, index) => {
                        const socketHash = [0, 5, 6, 7, 8].includes(index)
                            ? socket.reusablePlugSetHash
                            : socket.randomizedPlugSetHash;

                        if (socketHash) {
                            const plugSet = data.DestinyPlugSetDefinition[socketHash];

                            if (plugSet && plugSet.reusablePlugItems) {
                                const perks = plugSet.reusablePlugItems.map(plug => {
                                    const plugItem = data.DestinyInventoryItemDefinition[plug.plugItemHash];
                                    return plugItem ? {
                                        name: plugItem.displayProperties.name,
                                        icon: plugItem.displayProperties.icon,
                                        itemTypeDisplayName: plugItem.itemTypeDisplayName
                                    } : null;
                                }).filter(perk => perk !== null);

                                sockets.push({
                                    itemTypeDisplayName: perks.length > 0 ? perks[0].itemTypeDisplayName : "Desconocido",
                                    perks
                                });
                            }
                        }
                    });
                }

                return {
                    ...arma,
                    ammoTypeName,
                    damageTypeIcon,
                    itemSubType,
                    equipmentSlotName,
                    secondaryIcon,
                    stats,
                    breakerTypeIcon,
                    sockets
                };
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