import React, { useContext } from 'react';
import MyContext from '../MyContext';
import './Pokemoncard.css';

export const Pokemoncard = ({ pokemon, onClick }) => {
  const { isFavorite, toggleFavorite, isInTeam, addToTeam, removeFromTeam } = useContext(MyContext);

  if (!pokemon) return null;

  const favorite = isFavorite(pokemon.id);
  const inTeam = isInTeam(pokemon.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(pokemon.id);
  };

  const handleTeamClick = (e) => {
    e.stopPropagation();
    if (inTeam) {
      removeFromTeam(pokemon.id);
    } else {
      addToTeam(pokemon);
    }
  };

  const sprite = pokemon?.sprites?.other?.['official-artwork']?.front_default ||
                 pokemon?.sprites?.other?.home?.front_default ||
                 pokemon?.sprites?.front_default;

  return (
    <div className="card" onClick={() => onClick && onClick(pokemon)}>
      {/* Top Quick Actions */}
      <div className="card-quick-actions">
        <button
          className={`card-btn card-team-btn ${inTeam ? 'active' : ''}`}
          onClick={handleTeamClick}
          title={inTeam ? 'In Battle Team (Click to remove)' : 'Add to Battle Party (Max 6)'}
        >
          {inTeam ? '🎒' : '➕'}
        </button>

        <span className="card-id-tag">#{String(pokemon.id).padStart(3, '0')}</span>

        <button
          className={`card-btn card-fav-btn ${favorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          title={favorite ? 'Remove Favorite' : 'Add to Favorites'}
        >
          {favorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="card-img-container">
        <img
          src={sprite}
          alt={pokemon?.name || 'Pokemon'}
          loading="lazy"
        />
      </div>

      <h2>{pokemon?.name}</h2>

      <div className="card-power-strip">
        <span className="card-stat-chip hp-chip">HP {pokemon?.stats?.find((s) => s.stat.name === 'hp')?.base_stat || '—'}</span>
        <span className="card-stat-chip bst-chip">BST {pokemon?.stats?.reduce((acc, c) => acc + c.base_stat, 0) || '—'}</span>
      </div>

      <div className="types-container">
        {pokemon?.types?.map((typeInfo) => (
          <span key={typeInfo?.type?.name} className={`type-badge ${typeInfo?.type?.name}`}>
            {typeInfo?.type?.name}
          </span>
        ))}
      </div>

      <div className="card-inspect-hint">
        <span>🔍 Tap for Stats & Cry</span>
      </div>
    </div>
  );
};

export default Pokemoncard;
