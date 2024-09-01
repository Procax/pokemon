import React, { useEffect, useState} from 'react'
import { pokiapi } from '../../utils/constant'
import { Pokemoncard } from '../Card/Pokemoncard';
import './Pokemonapi.css'




export default function Pokemonapi() {
  const [data, setData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [filteredPokemon, setFilteredPokemon] = useState([]);






 useEffect (() =>
 {
  const fetchapi =  async () => {
    try {

      const typeResponse = await fetch('https://pokeapi.co/api/v2/type');
      const typeData = await typeResponse.json();
      setTypes(typeData.results);



      const response = await fetch (pokiapi)
      const data = await response.json()

      // console.log(response)


      const detailedPokemonData = data.results.map(async (curPokemon) => {
        const res = await fetch(curPokemon.url);
        const data = await res.json();
        return data;
      });
// console.log(detailedPokemonData)


const detailedResponses = await Promise.all(detailedPokemonData);
// console.log(detailedResponses)

      setData(detailedResponses)
    } catch (error) {
      
    }


    
  }
  fetchapi()
 }

 ,[])
// console.log(data?.results?.name)
//  console.log(data?.results?.map((pokemon, index) =>
//   console.log(pokemon.name))
// )


// useEffect(() => {
//   if (data) {
//     data?.map((pokemon, index) => console.log(pokemon));
//   }
// }, [data]);

const showMoreCards = () => {
  setVisibleCount((prevCount) => prevCount + 12);
};

useEffect (() => {
  const searchData = data?.filter((curPokemon) => {
    const matchesName = curPokemon?.name.toLowerCase().includes(search.toLowerCase())
  const matchesType = selectedType
  ? curPokemon.types.some(typeInfo => typeInfo.type.name === selectedType)
  : true;
  return matchesName && matchesType;
  },
  
  );
  setFilteredPokemon(searchData)

  
},[search, selectedType, data])


  return (
    <div>

<div className="pokemon-search">
  <div>

  <input className='search'
            type="text"
            placeholder="Search Pokemon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

  </div>

                  <div>
        <select onChange={(e) => setSelectedType(e.target.value)}>
                    <option value="">Types</option>
                    {types?.map(type => (
                      
                        <option key={type.name} value={type.name} >
                            {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                        </option>
                    ))}
                    {console.log(types)}
                </select>
        </div>
        </div>



    <div className="container">

{/* 
 <div>
 <div>
      <h2>Pokémon List</h2>
      {data && (
        <ul>
          {data?.map((pokemon, index) => (
            <li key={index}>
              {pokemon.name}
            </li>
          ))}
        </ul>
      )}
    </div>
    
    </div> */}



    

            {/* {pokemon.map((curPokemon) => { */}
            {filteredPokemon?.slice(0, visibleCount)?.map((pokemon) => {
              // console.log(pokemon.types)
              return (
                <Pokemoncard pokemon ={pokemon} />
              );
            })}



    </div>
    <div class="center">
 {visibleCount < data?.length && (
        <button className="show-more-btn" onClick={showMoreCards}>
          Show More
        </button>
      )}
</div>
    </div>
  );
}
