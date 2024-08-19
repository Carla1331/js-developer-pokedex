const pokeApi = {};

function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    const [type] = types;

    pokemon.types = types;
    pokemon.type = type;

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;
    pokemon.url = `https://pokeapi.co/api/v2/pokemon/${pokemon.number}`;
    pokemon.speciesUrl = pokeDetail.species.url;

    return pokemon;
}

function convertPokeApiDetailToPokemonDetail(pokeDetail) {
    console.log('Pokémon Detail:', pokeDetail); 

    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;

   
    const heightInMeters = pokeDetail.height * 0.1;
    const heightInInches = heightInMeters * 39.3701;
    const feet = Math.floor(heightInInches / 12);
    let inches = Math.round(heightInInches % 12);
    inches = inches < 10 ? `0${inches}` : inches;

    const weightInKg = pokeDetail.weight * 0.1;
    const weightInLbs = (weightInKg * 2.20462).toFixed(2);

    pokemon.height = `${heightInMeters.toFixed(1)} m (${feet}′${inches}″)`;
    pokemon.weight = `${weightInKg.toFixed(1)} kg (${weightInLbs} lbs)`;

    pokemon.photo = pokeDetail.sprites?.other?.dream_world?.front_default || pokeDetail.sprites?.front_default;
    pokemon.types = pokeDetail.types ? pokeDetail.types.map(typeSlot => typeSlot.type.name) : [];
    pokemon.abilities = pokeDetail.abilities ? pokeDetail.abilities.map(ability => ability.ability.name) : [];

   
    return fetch(pokeDetail.species.url)
        .then(response => response.json())
        .then(speciesDetail => {
            
            pokemon.species = speciesDetail.genera.find(genus => genus.language.name === 'en').genus;

            
            pokemon.eggGroups = speciesDetail.egg_groups.map(group => group.name).join(', ');

            
            pokemon.eggCycle = speciesDetail.hatch_counter ? `${speciesDetail.hatch_counter} cycles` : 'N/A';

            
            if (speciesDetail.gender_rate === -1) {
                pokemon.gender = 'Genderless';
            } else {
                const femaleRate = (speciesDetail.gender_rate / 8) * 100;
                const maleRate = 100 - femaleRate;
                pokemon.gender = `♂ ${maleRate}% / ♀ ${femaleRate}%`;
            }

            return pokemon;
        });
}


pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon);
}

pokeApi.getPokemonDetailClick = (url) => {
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((pokeDetail) => {
            console.log('Pokémon Detail Received:', pokeDetail); 
            return convertPokeApiDetailToPokemonDetail(pokeDetail);
        });
}

pokeApi.getPokemons = (offset = 0, limit = 10) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails);
}
