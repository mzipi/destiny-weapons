document.getElementById('search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const searchTerm = e.target.value;
        fetchArmas(searchTerm);

        e.target.value = '';

        const loadingMessage = document.getElementById('loading-message');
        loadingMessage.style.display = 'block';
    }
});

async function fetchArmas(searchTerm = '') {
    const response = await fetch(`/armas?search=${encodeURIComponent(searchTerm)}`);
    const armas = await response.json();

    const container = document.getElementById('armas-container');
    container.innerHTML = '';

    if (armas.length > 0) {
        armas.forEach(arma => {
            const div = document.createElement('div');
            div.classList.add('arma');

            const iconUrl = `https://www.bungie.net${arma.displayProperties.icon}`;
            const watermarkUrl = arma.iconWatermark ? `https://www.bungie.net${arma.iconWatermark}` : '';

            div.innerHTML = `
                <div class="arma-image-container">
                    <img src="${iconUrl}" alt="${arma.displayProperties.name}" class="arma-icon">
                    ${watermarkUrl ? `<img src="${watermarkUrl}" alt="watermark" class="arma-watermark">` : ''}
                </div>
                <strong>${arma.displayProperties.name}</strong><br>
                <em>${arma.flavorText || 'No hay descripción'}</em><br>
                <h4>Perks:</h4>
                <div class="sockets-container">
                    ${arma.sockets && arma.sockets.length > 0
                    ? arma.sockets.map((socket, index) => {
                        return `
                                <div class="socket">
                                    <strong>Socket ${index + 1} - ${socket.itemTypeDisplayName || "Desconocido"}</strong>
                                    <ul>
                                        ${socket.perks.length > 0
                                ? socket.perks.map(perk => `
                                                <li>
                                                    ${perk.icon ? `<img src="https://www.bungie.net${perk.icon}" alt="${perk.name}" width="30">` : ''}
                                                    ${perk.name}
                                                </li>
                                            `).join('')
                                : '<li>No hay perks disponibles</li>'
                            }
                                    </ul>
                                </div>
                            `;
                    }).join('')
                    : '<p>No tiene sockets con perks aleatorios</p>'
                }
                </div>
            `;
            container.appendChild(div);

            // Mostrar datos en la consola
            console.log('Nombre:', arma.displayProperties.name);
            console.log('Icono de daño:', arma.damageTypeIcon);
            console.log('Tipo de objeto:', arma.itemSubType);
            console.log('Tipo de munición:', arma.ammoTypeName);
            console.log('Espacio de arma:', arma.equipmentSlotName);
            if (arma.secondaryIcon) {
                console.log('Icono secundario:', arma.secondaryIcon);
            }
            console.log('Estadísticas:', arma.stats);
            if (arma.secondaryIcon) {
                console.log('Breaker Type Icon:', arma.breakerTypeIcon);
            }
            console.log('----------------------');
        });
    } else {
        container.innerHTML = '<p>No se encontraron armas.</p>';
    }

    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.display = 'none'; // Ocultar el mensaje de carga
}