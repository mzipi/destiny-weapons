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
    const response = await fetch(`/armas?search=${searchTerm}`);
    const armas = await response.json();

    const container = document.getElementById('armas-container');
    const loadingMessage = document.getElementById('loading-message');
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
            `;
            container.appendChild(div);
        });
    } else {
        container.innerHTML = '<p>No se encontraron armas.</p>';
    }

    loadingMessage.style.display = 'none';
}