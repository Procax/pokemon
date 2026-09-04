import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { pokiapi, GENERATIONS } from '../../utils/constant';
import { Pokemoncard } from '../Card/Pokemoncard';
import { PokemonDetailModal } from '../Modal/PokemonDetailModal';
import { TrainerCardModal } from '../Trainer/TrainerCardModal';
import { TeamTray } from '../Team/TeamTray';
import MyContext from '../MyContext';
import withAuthorization from '../Auth/withAuthorization';
import './Pokemonapi.css';

const POPULAR_TYPES = [
  { name: 'fire', icon: '🔥' },
  { name: 'water', icon: '💧' },
  { name: 'grass', icon: '🌿' },
  { name: 'electric', icon: '⚡' },
  { name: 'psychic', icon: '🔮' },
  { name: 'dragon', icon: '🐉' },
  { name: 'ghost', icon: '👻' },
  { name: 'fairy', icon: '✨' },
  { name: 'fighting', icon: '🥊' },
  { name: 'ice', icon: '❄️' }
];

function Pokemonapi() {
  const navigate = useNavigate();
  const { trainer, favorites, team } = useContext(MyContext);

  const [data, setData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [search, setSearch] = useState('');
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('id-asc');
  const [filteredPokemon, setFilteredPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Active view tab: 'all' | 'favorites' | 'team'
  const [activeTab, setActiveTab] = useState('all');

  // Generation selection: default 1 (Gen 1 Kanto)
  const [selectedGen, setSelectedGen] = useState(1);
  const genCache = useRef({});
  const allPokemonList = useRef(null);

  // Modals state
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);

  // Monitor scroll for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch initial list of all Pokemon endpoints & types
  useEffect(() => {
    let isMounted = true;
    const initFetch = async () => {
      try {
        setLoading(true);
        const [typeRes, pokeListRes] = await Promise.all([
          fetch('https://pokeapi.co/api/v2/type'),
          fetch(pokiapi)
        ]);
        const typeData = await typeRes.json();
        const pokeListData = await pokeListRes.json();

        if (isMounted) {
          setTypes(typeData.results);
          allPokemonList.current = pokeListData.results || [];
          loadGeneration(1, pokeListData.results || []);
        }
      } catch (error) {
        console.error('Error in initial load:', error);
        if (isMounted) setLoading(false);
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch a specific generation on demand
  const loadGeneration = async (genId, rawList) => {
    const list = rawList || allPokemonList.current;
    if (!list || !list.length) return;

    if (genCache.current[genId]) {
      setData(genCache.current[genId]);
      setVisibleCount(12);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const genConfig = GENERATIONS.find((g) => g.id === genId) || GENERATIONS[0];
      const targetSlice = list.slice(genConfig.start - 1, genConfig.end);

      const detailedPokemonData = targetSlice.map(async (curPokemon) => {
        const res = await fetch(curPokemon.url);
        return await res.json();
      });

      const detailedResponses = await Promise.all(detailedPokemonData);
      genCache.current[genId] = detailedResponses;
      setData(detailedResponses);
      setVisibleCount(12);
    } catch (err) {
      console.error(`Error loading Gen ${genId}:`, err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleSelectGeneration = (genId) => {
    if (genId === selectedGen) return;
    setSelectedGen(genId);
    setActiveTab('all');
    loadGeneration(genId);
  };

  const showMoreCards = () => {
    setVisibleCount((prevCount) => prevCount + 12);
  };

  // Filter & Sort pipeline: Tab + Search + Type + SortBy
  useEffect(() => {
    if (!data) return;

    let baseList = data;
    if (activeTab === 'favorites') {
      baseList = data.filter((p) => favorites.includes(p.id));
    } else if (activeTab === 'team') {
      baseList = data.filter((p) => team.some((t) => t.id === p.id));
    }

    const searchData = baseList.filter((curPokemon) => {
      const matchesName = curPokemon?.name?.toLowerCase().includes(search.toLowerCase()) ||
                          String(curPokemon?.id).includes(search);
      const matchesType = selectedType
        ? curPokemon.types?.some((typeInfo) => typeInfo.type.name === selectedType)
        : true;
      return matchesName && matchesType;
    });

    const sortedData = [...searchData];
    if (sortBy === 'id-desc') {
      sortedData.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'name-asc') {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'bst-desc') {
      const getBst = (p) => p.stats?.reduce((acc, c) => acc + c.base_stat, 0) || 0;
      sortedData.sort((a, b) => getBst(b) - getBst(a));
    } else if (sortBy === 'hp-desc') {
      const getHp = (p) => p.stats?.find((s) => s.stat.name === 'hp')?.base_stat || 0;
      sortedData.sort((a, b) => getHp(b) - getHp(a));
    } else {
      sortedData.sort((a, b) => a.id - b.id);
    }

    setFilteredPokemon(sortedData);
  }, [search, selectedType, sortBy, data, activeTab, favorites, team]);

  // Handle clicking evolution step inside modal
  const handleSelectEvo = (evoObj) => {
    if (!data) return;
    const found = data.find((p) => p.id === evoObj.id || p.name === evoObj.name);
    if (found) {
      setSelectedPokemon(found);
    }
  };

  const activeGenConfig = GENERATIONS.find((g) => g.id === selectedGen) || GENERATIONS[0];

  return (
    <div className="pokemon">
      {/* Top Navigation Bar */}
      <header className="pokedex-top-nav">
        <div className="nav-brand">
          <div className="brand-pokeball"></div>
          <div>
            <h1 className="brand-title">PokéDex Ultra</h1>
            <span className="brand-subtitle">{activeGenConfig.region} Region • {activeGenConfig.name}</span>
          </div>
        </div>

        <div className="nav-actions">
          {/* Battle Arena Button */}
          <button
            className="battle-arena-btn"
            onClick={() => navigate('/battle')}
            title="Enter Cross-Gen Battle Arena"
          >
            ⚔️ Battle Arena
          </button>

          {/* Trainer Badge Chip */}
          <div
            className="trainer-chip"
            onClick={() => setIsTrainerModalOpen(true)}
            title="Open Trainer ID Card"
          >
            <img
              src={trainer?.avatar}
              alt={trainer?.name}
              className="trainer-chip-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
              }}
            />
            <div className="trainer-chip-info">
              <span className="trainer-chip-name">{trainer?.name || 'Trainer'}</span>
              <span className="trainer-chip-id">ID: #{trainer?.trainerId || '74291'}</span>
            </div>
            <span className="trainer-pass-icon">🪪</span>
          </div>
        </div>
      </header>

      {/* Main Filter & Search Area */}
      <div className="pokemon-search">
        {/* All Generations Bar */}
        <div className="generations-scroll-bar">
          <span className="gen-bar-lbl">Region:</span>
          {GENERATIONS.map((gen) => (
            <button
              key={gen.id}
              className={`gen-pill ${selectedGen === gen.id ? 'active' : ''}`}
              onClick={() => handleSelectGeneration(gen.id)}
            >
              <span className="gen-icon">{gen.icon}</span>
              <span className="gen-region">{gen.region}</span>
              <small className="gen-name">{gen.name}</small>
            </button>
          ))}
        </div>

        {/* Quick Type Filter Chips Bar */}
        <div className="types-quick-bar">
          <span className="type-bar-lbl">Quick Types:</span>
          <button
            className={`type-chip-pill ${selectedType === '' ? 'active' : ''}`}
            onClick={() => setSelectedType('')}
          >
            All Types
          </button>
          {POPULAR_TYPES.map((t) => (
            <button
              key={t.name}
              className={`type-chip-pill ${selectedType === t.name ? 'active' : ''} ${t.name}`}
              onClick={() => setSelectedType(selectedType === t.name ? '' : t.name)}
            >
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* View Filter Tabs & Sorting */}
        <div className="filter-and-sort-bar">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              ⚡ {activeGenConfig.region} ({data?.length || 0})
            </button>
            <button
              className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              ❤️ Favorites ({favorites.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              🎒 Battle Party ({team.length}/6)
            </button>
          </div>

          {/* Quick Sorting Dropdown */}
          <div className="sort-box">
            <span className="sort-lbl">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="id-asc"># Number (Low to High)</option>
              <option value="id-desc"># Number (High to Low)</option>
              <option value="bst-desc">🔥 Strongest (Highest BST)</option>
              <option value="hp-desc">💚 Healthiest (Highest HP)</option>
              <option value="name-asc">🔤 Name (A - Z)</option>
            </select>
          </div>
        </div>

        <div className="search-controls-row">
          <div className="search-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              className="search"
              type="text"
              placeholder={`Search ${activeGenConfig.region} Pokémon by name or #ID...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch('')}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'rgba(0,0,0,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  color: '#334155',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                &times;
              </button>
            )}
          </div>

          <div className="filter-container">
            <select
              className="type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All 18 Types</option>
              {types?.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {(search || selectedType) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearch('');
                setSelectedType('');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🔄 Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Content Gallery */}
      {loading ? (
        <div className="loader-container">
          <div className="pokeball-loader"></div>
          <p>Catching {activeGenConfig.region} Pokémon...</p>
        </div>
      ) : (
        <>
          {filteredPokemon && filteredPokemon.length === 0 ? (
            <div className="no-results-box">
              <span className="no-results-icon">🔍</span>
              <h3>No Pokémon Found in {activeGenConfig.region}</h3>
              <p>
                {activeTab === 'favorites'
                  ? 'No favorites found in this region. Click the heart ❤️ on any card!'
                  : activeTab === 'team'
                  ? 'No team members from this region yet. Add Pokémon using ➕!'
                  : 'Try adjusting your search query or type filter.'}
              </p>
            </div>
          ) : (
            <div className="poki-container">
              {filteredPokemon?.slice(0, visibleCount)?.map((pokemon, index) => (
                <div
                  className="card-wrapper"
                  key={pokemon?.id || index}
                  style={{ animationDelay: `${(index % 12) * 0.04}s` }}
                >
                  <Pokemoncard
                    pokemon={pokemon}
                    onClick={() => setSelectedPokemon(pokemon)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Show More Button */}
          <div className="center">
            {visibleCount < (filteredPokemon?.length || 0) && (
              <button className="show-more-btn" onClick={showMoreCards}>
                Show More ({filteredPokemon.length - visibleCount} left in {activeGenConfig.region})
              </button>
            )}
          </div>
        </>
      )}

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          title="Back to Top"
        >
          ▲
        </button>
      )}

      {/* 6-Pokemon Battle Team Dock */}
      <TeamTray
        onSelectPokemon={(teamMember) => {
          if (!data) return;
          const fullPokemon = data.find((p) => p.id === teamMember.id);
          if (fullPokemon) setSelectedPokemon(fullPokemon);
        }}
      />

      {/* Detailed Stats & Evolution Modal */}
      <PokemonDetailModal
        pokemon={selectedPokemon}
        isOpen={Boolean(selectedPokemon)}
        onClose={() => setSelectedPokemon(null)}
        onSelectPokemon={handleSelectEvo}
      />

      {/* Retro Trainer ID Card Modal */}
      <TrainerCardModal
        isOpen={isTrainerModalOpen}
        onClose={() => setIsTrainerModalOpen(false)}
        totalPokemonCount={data?.length || 151}
      />
    </div>
  );
}

export default withAuthorization(Pokemonapi);