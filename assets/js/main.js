document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemonList');
    const loadMoreButton = document.getElementById('loadMoreButton');
    const pokemonInfoClick = document.getElementById('pokemonInfoClick');
    const pokemonModal = document.getElementById('pokemonModal');

    const maxRecords = 151;
    const limit = 10;
    let offset = 0;

    if (!pokemonList || !loadMoreButton || !pokemonModal) {
        console.error('Elementos essenciais não foram encontrados no DOM.');
        return;
    }

    function convertPokemonToLi(pokemon) {
        return `
            <li class="pokemon ${pokemon.type}" onclick="showPokemonDetails('${pokemon.url}')">
                <span class="number">#${pokemon.number}</span>
                <span class="name">${pokemon.name}</span>
                <div class="detail">
                    <ol class="types">
                        ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                    </ol>
                    <img src="${pokemon.photo}" alt="${pokemon.name}">
                </div>
            </li>
        `;
    }

    function loadPokemonItems(offset, limit) {
        pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
            const newHtml = pokemons.map(convertPokemonToLi).join('');
            pokemonList.innerHTML += newHtml;
        }).catch((error) => {
            console.error('Falha ao carregar Pokemon:', error);
        });
    }

    function showPokemonDetails(url) {
        pokeApi.getPokemonDetailClick(url)
            .then((pokemon) => {
                console.log('Detalhes do Pokémon recebidos:', pokemon);
    
                if (pokemonInfoClick) {
                    const mainType = pokemon.types[0];
                    const header = `
                        <div class="modal-header ${mainType}">
                            <span class="pokemon-number">#${pokemon.number}</span>
                            <h2 class="pokemon-name">${pokemon.name}</h2>
                            <div class="pokemon-type">
                                 ${pokemon.types.map(type => `<span class="type ${type}">${type}</span>`).join('')}
                            </div>
                            <img class="pokemon-image" src="${pokemon.photo}" alt="${pokemon.name}">
                            <span class="close-button" id="closeModalButton">&times;</span>
                        </div>
                    `;
    
                    const body = `
                    <div class="modal-body">
                    <br>
                        <h3>About</h3>
                            <p><span class="label">Species</span><span class="value">${pokemon.species}</span></p>
                            <p><span class="label">Height</span><span class="value">${pokemon.height}</span></p>
                            <p><span class="label">Weight</span><span class="value">${pokemon.weight}</span></p>
                            <p><span class="label">Abilities</span><span class="value">${pokemon.abilities.join(', ')}</span></p><br>
                       <h3>Breeding</h3> 
                            <p><span class="label">Gender</span><span class="value">${pokemon.gender}</span></p>
                            <p><span class="label">Egg Groups</span><span class="value">${pokemon.eggGroups}</span></p>
                            <p><span class="label">Egg Cycle</span><span class="value">${pokemon.eggCycle}</span></p>
                    </div>
                    `;

                    pokemonInfoClick.innerHTML = header + body;
                    pokemonModal.classList.remove('hidden');
                    pokemonModal.style.display = "block";
    
                    const closeModalButton = document.getElementById('closeModalButton');
                    if (closeModalButton) {
                        closeModalButton.addEventListener('click', closeDetailClick);
                    }
                } else {
                    console.error('Elemento pokemonInfoClick não encontrado.');
                }
            })
            .catch((error) => {
                console.error('Failed to load Pokémon details:', error);
            });
    }
    
    
    function convertHeight(heightInDecimeters) {
        const meters = heightInDecimeters / 10;
        const feet = Math.floor(meters * 3.28084);
        const inches = Math.round((meters * 39.3701) % 12);
        return `${meters.toFixed(2)} meters (${feet}'${inches}")`;
    }
    
    function convertWeight(weightInHectograms) {
        const kg = weightInHectograms / 10;
        const lbs = (kg * 2.20462).toFixed(2);
        return `${kg.toFixed(2)} kg (${lbs} lbs)`;
    }
    



    function closeDetailClick() {
        console.log('Fechando modal de detalhes do Pokémon');
        pokemonModal.classList.add('hidden');
        pokemonModal.style.display = "none";
    }

   
    loadPokemonItems(offset, limit);

    
    loadMoreButton.addEventListener('click', () => {
        offset += limit;
        const qtdRecordsWithNextPage = offset + limit;

        if (qtdRecordsWithNextPage >= maxRecords) {
            const newLimit = maxRecords - offset;
            loadPokemonItems(offset, newLimit);
            loadMoreButton.parentElement.removeChild(loadMoreButton);
        } else {
            loadPokemonItems(offset, limit);
        }
    });

    window.showPokemonDetails = showPokemonDetails;
    window.closeDetailClick = closeDetailClick;

    window.addEventListener('click', (event) => {
        if (event.target === pokemonModal) {
            closeDetailClick();
        }
    });
});
