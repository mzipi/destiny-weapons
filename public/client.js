// Crear los elementos dinámicamente
document.addEventListener('DOMContentLoaded', () => {
    // Crear el contenedor principal y el título
    const body = document.body;

    const title = document.createElement('h1');
    title.textContent = 'Buscar Armas';
    body.appendChild(title);

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'search';
    searchInput.placeholder = 'Buscar arma por nombre o descripción';
    body.appendChild(searchInput);

    const armasContainer = document.createElement('div');
    armasContainer.id = 'armas-container';
    body.appendChild(armasContainer);

    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.textContent = 'Cargando...';
    loadingMessage.style.display = 'none';
    armasContainer.appendChild(loadingMessage);

    // Lógica de paginación y búsqueda
    let currentPage = 1;
    let totalPages = 1;

    const prevButton = document.createElement('button');
    prevButton.id = 'prev-page';
    prevButton.textContent = 'Anterior';
    prevButton.disabled = true; // Deshabilitar el botón al inicio

    const nextButton = document.createElement('button');
    nextButton.id = 'next-page';
    nextButton.textContent = 'Siguiente';
    nextButton.disabled = true; // Deshabilitar el botón al inicio

    // Crear contenedor para los botones
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'buttons-container';
    buttonsContainer.appendChild(prevButton);
    buttonsContainer.appendChild(nextButton);

    // Lógica de búsqueda y paginación
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = e.target.value;
            currentPage = 1; // Resetear la página a 1 para cada nueva búsqueda
            fetchArmas(searchTerm);
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            const searchTerm = searchInput.value;
            fetchArmas(searchTerm);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            const searchTerm = searchInput.value;
            fetchArmas(searchTerm);
        }
    });

    async function fetchArmas(searchTerm = '') {
        loadingMessage.style.display = 'block'; // Mostrar mensaje de carga
        armasContainer.innerHTML = ''; // Limpiar el contenedor de armas
        armasContainer.appendChild(loadingMessage); // Asegurar que el mensaje de carga se muestre antes de los resultados

        const response = await fetch(`/armas?search=${encodeURIComponent(searchTerm)}&page=${currentPage}`);
        const data = await response.json();

        const armas = data.armas;
        totalPages = data.totalPages;

        // Limpiar y añadir los botones antes de los resultados
        armasContainer.innerHTML = ''; // Limpiar el contenedor antes de cargar los nuevos resultados
        if (totalPages > 1) {
            armasContainer.appendChild(buttonsContainer); // Añadir botones solo si hay más de una página
        }

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
                        ${arma.sockets && arma.sockets.length > 1
                            ? arma.sockets.slice(1, 5).map((socket, index) => { // Solo los sockets 2, 3, 4 y 5 (índices 1 a 4)
                                return `
                                    <div class="socket">
                                        <strong>Socket ${index + 2} - ${socket.itemTypeDisplayName || "Desconocido"}</strong>
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
                armasContainer.appendChild(div);

                // Mostrar toda la información en la consola
                console.log(`Arma: ${arma.displayProperties.name}`);
                arma.sockets.forEach((socket, index) => {
                    console.log(`Socket ${index + 1}: ${socket.itemTypeDisplayName || "Desconocido"}`);
                    socket.perks.forEach(perk => {
                        console.log(`- Perk: ${perk.name} ${perk.icon ? `, Icono: ${perk.icon}` : ''}`);
                    });
                });
            });
        } else {
            armasContainer.innerHTML = '<p>No se encontraron armas.</p>';
        }

        // Deshabilitar/habilitar los botones según la página actual
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages || totalPages === 0;

        loadingMessage.style.display = 'none'; // Ocultar el mensaje de carga
    }
});