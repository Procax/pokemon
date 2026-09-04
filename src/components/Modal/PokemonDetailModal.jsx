import React, { useState, useEffect, useContext } from 'react';
import Modal from './Modal';
import MyContext from '../MyContext';
import './PokemonDetailModal.css';

const STAT_COLORS = {
  hp: '#22c55e',
  attack: '#ef4444',
  defense: '#3b82f6',
  'special-attack': '#f97316',
  'special-defense': '#8b5cf6',
  speed: '#ec4899'
};

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed'
};

export const PokemonDetailModal = ({ pokemon, isOpen, onClose, onSelectPokemon }) => {
  const { isFavorite, toggleFavorite, isInTeam, addToTeam, removeFromTeam } = useContext(MyContext);
  
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const [isShiny, setIsShiny] = useState(false);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [loadingEvo, setLoadingEvo] = useState(false);

  // Play audio battle cry
  const playCry = () => {
    if (!pokemon) return;
    const cryUrl = pokemon?.cries?.latest || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
    try {
      setIsPlayingCry(true);
      const audio = new Audio(cryUrl);
      audio.volume = 0.6;
      audio.play().catch(() => {
        // Fallback or mute error
      });
      audio.onended = () => setIsPlayingCry(false);
      audio.onerror = () => setIsPlayingCry(false);
    } catch {
      setIsPlayingCry(false);
    }
  };

  // Fetch evolution chain
  useEffect(() => {
    if (!isOpen || !pokemon?.species?.url) {
      setEvolutionChain([]);
      return;
    }

    let isMounted = true;
    const fetchEvolution = async () => {
      try {
        setLoadingEvo(true);
        const speciesRes = await fetch(pokemon.species.url);
        const speciesData = await speciesRes.json();

        if (!speciesData?.evolution_chain?.url) {
          setEvolutionChain([]);
          return;
        }

        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        // Parse chain
        const chain = [];
        let curr = evoData.chain;

        while (curr) {
          const speciesName = curr.species.name;
          // Extract id from URL: https://pokeapi.co/api/v2/pokemon-species/1/
          const parts = curr.species.url.split('/').filter(Boolean);
          const id = parts[parts.length - 1];

          chain.push({
            name: speciesName,
            id: parseInt(id, 10),
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
          });

          curr = curr.evolves_to && curr.evolves_to.length > 0 ? curr.evolves_to[0] : null;
        }

        if (isMounted) {
          setEvolutionChain(chain);
        }
      } catch (err) {
        console.error('Error fetching evolution:', err);
      } finally {
        if (isMounted) setLoadingEvo(false);
      }
    };

    fetchEvolution();

    return () => {
      isMounted = false;
    };
  }, [isOpen, pokemon]);

  if (!pokemon) return null;

  const favorite = isFavorite(pokemon.id);
  const inTeam = isInTeam(pokemon.id);

  // Compute stat total
  const statTotal = pokemon.stats?.reduce((acc, curr) => acc + curr.base_stat, 0) || 0;

  // Primary image selection
  const animatedSprite = pokemon?.sprites?.other?.showdown?.front_default;
  const regularImage = pokemon?.sprites?.other?.['official-artwork']?.front_default ||
                       pokemon?.sprites?.other?.home?.front_default ||
                       pokemon?.sprites?.front_default;
  const shinyImage = pokemon?.sprites?.other?.['official-artwork']?.front_shiny ||
                     pokemon?.sprites?.other?.home?.front_shiny ||
                     pokemon?.sprites?.front_shiny || regularImage;

  const currentImage = isShiny ? shinyImage : (animatedSprite || regularImage);
  const primaryType = pokemon?.types?.[0]?.type?.name || 'normal';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="700px">
      <div className={`pokemon-detail-card type-${primaryType}`}>
        {/* Header Ribbon */}
        <div className="detail-header">
          <div className="header-left">
            <span className="dex-number">#{String(pokemon.id).padStart(3, '0')}</span>
            <h2 className="detail-name">{pokemon.name}</h2>
          </div>

          <div className="header-actions">
            {/* Audio Cry Button */}
            <button
              className={`action-pill-btn cry-btn ${isPlayingCry ? 'playing' : ''}`}
              onClick={playCry}
              title="Play Battle Cry"
            >
              🔊 {isPlayingCry ? 'Roaring...' : 'Battle Cry'}
            </button>

            {/* Shiny Toggle */}
            <button
              className={`action-pill-btn shiny-btn ${isShiny ? 'active' : ''}`}
              onClick={() => setIsShiny(!isShiny)}
              title="Toggle Shiny Form"
            >
              ✨ {isShiny ? 'Shiny' : 'Normal'}
            </button>

            {/* Favorite Button */}
            <button
              className={`icon-circle-btn fav-btn ${favorite ? 'active' : ''}`}
              onClick={() => toggleFavorite(pokemon.id)}
              title={favorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              {favorite ? '❤️' : '🤍'}
            </button>

            {/* Team Button */}
            <button
              className={`icon-circle-btn team-btn ${inTeam ? 'active' : ''}`}
              onClick={() => inTeam ? removeFromTeam(pokemon.id) : addToTeam(pokemon)}
              title={inTeam ? 'Remove from Team' : 'Add to Party'}
            >
              {inTeam ? '🎒' : '➕'}
            </button>
          </div>
        </div>

        {/* Hero Visual & Physical Info */}
        <div className="detail-hero-section">
          <div className="detail-image-wrapper">
            <img
              src={currentImage}
              alt={pokemon.name}
              className={`detail-pokemon-img ${isPlayingCry ? 'anim-cry' : ''}`}
            />
            {/* Types Badges */}
            <div className="detail-types">
              {pokemon.types?.map((t) => (
                <span key={t.type.name} className={`type-tag ${t.type.name}`}>
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>

          {/* Physical Attributes Card */}
          <div className="attributes-grid">
            <div className="attribute-box">
              <span className="attr-label">Height</span>
              <span className="attr-val">{(pokemon.height / 10).toFixed(1)} m</span>
              <span className="attr-sub">{((pokemon.height / 10) * 3.281).toFixed(1)} ft</span>
            </div>
            <div className="attribute-box">
              <span className="attr-label">Weight</span>
              <span className="attr-val">{(pokemon.weight / 10).toFixed(1)} kg</span>
              <span className="attr-sub">{((pokemon.weight / 10) * 2.205).toFixed(1)} lbs</span>
            </div>
            <div className="attribute-box">
              <span className="attr-label">Base XP</span>
              <span className="attr-val">{pokemon.base_experience || '—'}</span>
              <span className="attr-sub">Experience</span>
            </div>
            <div className="attribute-box abilities-box">
              <span className="attr-label">Abilities</span>
              <div className="abilities-tags">
                {pokemon.abilities?.map((a) => (
                  <span key={a.ability.name} className="ability-pill">
                    {a.ability.name.replace('-', ' ')}
                    {a.is_hidden && <small> (Hidden)</small>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Base Stats Meter Section */}
        <div className="stats-section">
          <div className="stats-header">
            <h3>Base Stats</h3>
            <span className="stat-total-chip">BST: {statTotal}</span>
          </div>

          <div className="stats-list">
            {pokemon.stats?.map((s) => {
              const statName = s.stat.name;
              const value = s.base_stat;
              const pct = Math.min(100, Math.round((value / 255) * 100));
              const color = STAT_COLORS[statName] || '#3b82f6';
              const label = STAT_LABELS[statName] || statName;

              return (
                <div key={statName} className="stat-row">
                  <span className="stat-label">{label}</span>
                  <span className="stat-value">{value}</span>
                  <div className="stat-bar-track">
                    <div
                      className="stat-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}88`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evolution Chain Section */}
        <div className="evolution-section">
          <h3>Evolution Chain</h3>
          {loadingEvo ? (
            <div className="evo-loading">Tracing evolution line...</div>
          ) : evolutionChain.length > 1 ? (
            <div className="evolution-timeline">
              {evolutionChain.map((evo, idx) => (
                <React.Fragment key={evo.id}>
                  <div
                    className={`evo-step ${evo.id === pokemon.id ? 'current' : ''}`}
                    onClick={() => {
                      if (evo.id !== pokemon.id && onSelectPokemon) {
                        onSelectPokemon(evo);
                      }
                    }}
                    title={evo.id !== pokemon.id ? `Inspect ${evo.name}` : ''}
                  >
                    <img
                      src={evo.sprite}
                      alt={evo.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`;
                      }}
                    />
                    <span className="evo-name">{evo.name}</span>
                    <span className="evo-id">#{evo.id}</span>
                  </div>
                  {idx < evolutionChain.length - 1 && <span className="evo-arrow">➔</span>}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="evo-empty">This Pokémon does not evolve.</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PokemonDetailModal;
