import React, { useEffect, useState} from 'react'
import { pokiapi } from '../../utils/constant'
import { Pokemoncard } from '../Card/Pokemoncard';
import './Pokemonapi.css'




export default function Pokemonapi() {
  const [data, setData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [search, setSearch] = useState("");



 useEffect (() =>
 {
  const fetchapi =  async () => {
    try {
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
const searchData = data?.filter((curPokemon) =>
  curPokemon.name.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div>

<div className="pokemon-search">
          <input
            type="text"
            placeholder="search Pokemon"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
            {searchData?.slice(0, visibleCount)?.map((pokemon) => {
              console.log(pokemon.types)
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
