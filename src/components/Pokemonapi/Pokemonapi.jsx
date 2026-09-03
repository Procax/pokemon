import React, { useEffect, useState } from 'react';
import { pokiapi } from '../../utils/constant';
import { Pokemoncard } from '../Card/Pokemoncard';
import './Pokemonapi.css';
import withAuthorization from '../Auth/withAuthorization';

function Pokemonapi() {
  const [data, setData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchapi = async () => {
      try {
        setLoading(true);
        const typeResponse = await fetch('https://pokeapi.co/api/v2/type');
        const typeData = await typeResponse.json();
        setTypes(typeData.results);

        const response = await fetch(pokiapi);
        const resData = await response.json();

        // Limit to 151 to avoid browser freezing and network issues on initial render
        const detailedPokemonData = resData?.results?.slice(0, 151).map(async (curPokemon) => {
          const res = await fetch(curPokemon.url);
          return await res.json();
        });

        const detailedResponses = await Promise.all(detailedPokemonData);
        setData(detailedResponses);
      } catch (error) {
        console.error(error);
      } finally {
        // Adding a slight delay to let the user enjoy the pokeball loader animation
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchapi();
  }, []);

  const showMoreCards = () => {
    setVisibleCount((prevCount) => prevCount + 12);
  };

  useEffect(() => {
    if (!data) return;
    
    const searchData = data.filter((curPokemon) => {
      const matchesName = curPokemon?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType
        ? curPokemon.types?.some(typeInfo => typeInfo.type.name === selectedType)
        : true;
      return matchesName && matchesType;
    });
    
    setFilteredPokemon(searchData);
  }, [search, selectedType, data]);

  return (
    <div className='pokemon'>
      <div className="pokemon-search">
        <div className="search-container">
          <input 
            className='search'
            type="text"
            placeholder="Search Pokémon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <select className="type-select" onChange={(e) => setSelectedType(e.target.value)}>
            <option value="">All Types</option>
            {types?.map(type => (
              <option key={type.name} value={type.name}>
                {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="pokeball-loader"></div>
          <p>Catching 'em all...</p>
        </div>
      ) : (
        <>
          <div className="poki-container">
            {filteredPokemon?.slice(0, visibleCount)?.map((pokemon, index) => (
              <div 
                className="card-wrapper" 
                key={pokemon?.id || index}
                style={{ animationDelay: `${(index % 12) * 0.05}s` }}
              >
                <Pokemoncard pokemon={pokemon} />
              </div>
            ))}
          </div>
          
          <div className="center">
            {visibleCount < (filteredPokemon?.length || 0) && (
              <button className="show-more-btn" onClick={showMoreCards}>
                Show More
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default withAuthorization(Pokemonapi);