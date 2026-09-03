import React from 'react';
import './Pokemoncard.css';

export const Pokemoncard = ({ pokemon }) => {
  if (!pokemon) return null; // Safe guard

  return (
    <div className='card'>
      <div className="card-img-container">
        <img 
          src={pokemon?.sprites?.other?.home?.front_default || pokemon?.sprites?.front_default} 
          alt={pokemon?.name || 'Pokemon'} 
        />
      </div>
      <h2>{pokemon?.name}</h2>
      
      <div className="types-container">
        {pokemon?.types?.map((typeInfo) => (
          <span key={typeInfo?.type?.name} className={`type-badge ${typeInfo?.type?.name}`}>
            {typeInfo?.type?.name}
          </span>
        ))}
      </div>
    </div>
  );
};
