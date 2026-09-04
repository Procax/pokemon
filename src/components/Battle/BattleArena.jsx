import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GENERATIONS, BATTLEGROUNDS } from '../../utils/constant';
import MyContext from '../MyContext';
import './BattleArena.css';

// Type Effectiveness Matrix (Attacker -> Defender)
const TYPE_CHART = {
  fire: { grass: 2, ice: 2, bug: 2, steel: 2, water: 0.5, fire: 0.5, rock: 0.5, dragon: 0.5 },
  water: { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
  normal: { rock: 0.5, steel: 0.5, ghost: 0 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5, ghost: 0 },
  flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  ghost: { psychic: 2, ghost: 2, normal: 0, dark: 0.5 },
  steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 }
};

// Signature Move names by element
const TYPE_MOVES = {
  fire: { name: 'Flamethrower', power: 75, icon: '🔥' },
  water: { name: 'Hydro Pump', power: 75, icon: '💧' },
  grass: { name: 'Solar Beam', power: 75, icon: '🌿' },
  electric: { name: 'Thunderbolt', power: 75, icon: '⚡' },
  psychic: { name: 'Psychic Blast', power: 75, icon: '🔮' },
  ice: { name: 'Ice Beam', power: 75, icon: '❄️' },
  dragon: { name: 'Dragon Claw', power: 75, icon: '🐉' },
  ghost: { name: 'Shadow Ball', power: 75, icon: '👻' },
  dark: { name: 'Dark Pulse', power: 75, icon: '🌑' },
  fairy: { name: 'Moonblast', power: 75, icon: '✨' },
  fighting: { name: 'Close Combat', power: 75, icon: '🥊' },
  ground: { name: 'Earthquake', power: 75, icon: '🌋' },
  rock: { name: 'Rock Slide', power: 75, icon: '🪨' },
  steel: { name: 'Iron Tail', power: 75, icon: '🛡️' },
  poison: { name: 'Sludge Bomb', power: 75, icon: '☠️' },
  flying: { name: 'Air Slash', power: 75, icon: '🌪️' },
  bug: { name: 'Bug Buzz', power: 75, icon: '🦗' },
  normal: { name: 'Body Slam', power: 70, icon: '💥' }
};

const getEffectiveness = (moveType, targetTypes = []) => {
  if (!moveType || !targetTypes.length) return 1;
  let mult = 1;
  targetTypes.forEach((t) => {
    if (TYPE_CHART[moveType]?.[t] !== undefined) {
      mult *= TYPE_CHART[moveType][t];
    }
  });
  return mult;
};

// Curated icon presets for 1-click battle load
const PRESET_BATTLES = [
  {
    title: 'Charizard vs Greninja',
    badge: '🔥 Gen 1 vs 🌊 Gen 6',
    p1Id: 6,
    p2Id: 658,
    arenaId: 'volcano'
  },
  {
    title: 'Pikachu vs Sylveon',
    badge: '⚡ Gen 1 vs ✨ Gen 6',
    p1Id: 25,
    p2Id: 700,
    arenaId: 'kalos'
  },
  {
    title: 'Gengar vs Aegislash',
    badge: '👻 Gen 1 vs 🗡️ Gen 6',
    p1Id: 94,
    p2Id: 681,
    arenaId: 'forest'
  },
  {
    title: 'Mewtwo vs Xerneas',
    badge: '🔮 Gen 1 vs 🦌 Gen 6',
    p1Id: 150,
    p2Id: 716,
    arenaId: 'kalos'
  }
];

// Popular picks for quick selection
const POPULAR_PICKS = {
  1: ['Charizard', 'Pikachu', 'Blastoise', 'Venusaur', 'Gengar', 'Mewtwo'],
  6: ['Greninja', 'Sylveon', 'Aegislash', 'Talonflame', 'Goodra', 'Xerneas']
};

export const BattleArena = () => {
  const navigate = useNavigate();
  const { team } = useContext(MyContext);

  // Configuration phase state
  const [inBattle, setInBattle] = useState(false);
  const [selectedArena, setSelectedArena] = useState(BATTLEGROUNDS[0]);
  const [isMuted, setIsMuted] = useState(false);

  // Search & Selector states
  const [f1Search, setF1Search] = useState('');
  const [f2Search, setF2Search] = useState('');
  const [f1SearchError, setF1SearchError] = useState('');
  const [f2SearchError, setF2SearchError] = useState('');

  // Fighters config
  const [fighter1Gen, setFighter1Gen] = useState(1);
  const [fighter2Gen, setFighter2Gen] = useState(6);
  const [fighter1, setFighter1] = useState(null);
  const [fighter2, setFighter2] = useState(null);
  const [loadingFighters, setLoadingFighters] = useState(false);

  // Active combat state
  const [f1Hp, setF1Hp] = useState(100);
  const [f1MaxHp, setF1MaxHp] = useState(100);
  const [f2Hp, setF2Hp] = useState(100);
  const [f2MaxHp, setF2MaxHp] = useState(100);
  const [turn, setTurn] = useState('player'); // 'player' | 'enemy' | 'finished'
  const [battleLog, setBattleLog] = useState([]);
  const [animatingFighter, setAnimatingFighter] = useState(null);
  const [impactFighter, setImpactFighter] = useState(null);
  const [winner, setWinner] = useState(null);
  const logContainerRef = useRef(null);

  // Auto-scroll combat log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLog]);

  // Load default fighters on mount
  useEffect(() => {
    loadPreset(PRESET_BATTLES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPokemon = async (idOrName) => {
    const cleanQuery = String(idOrName).trim().toLowerCase();
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cleanQuery}`);
    if (!res.ok) throw new Error('Pokemon not found');
    return await res.json();
  };

  const loadPreset = async (preset) => {
    try {
      setLoadingFighters(true);
      const [p1, p2] = await Promise.all([
        fetchPokemon(preset.p1Id),
        fetchPokemon(preset.p2Id)
      ]);
      setFighter1(p1);
      setFighter2(p2);
      const arena = BATTLEGROUNDS.find((b) => b.id === preset.arenaId) || BATTLEGROUNDS[0];
      setSelectedArena(arena);
    } catch (err) {
      console.error('Error loading fighters:', err);
    } finally {
      setLoadingFighters(false);
    }
  };

  const getRandomPokemonFromGen = async (genId) => {
    const gen = GENERATIONS.find((g) => g.id === genId) || GENERATIONS[0];
    const randomId = Math.floor(Math.random() * (gen.end - gen.start + 1)) + gen.start;
    return await fetchPokemon(randomId);
  };

  const handleRandomizeFighter = async (fighterSlot, genId) => {
    try {
      setLoadingFighters(true);
      const p = await getRandomPokemonFromGen(genId);
      if (fighterSlot === 1) setFighter1(p);
      else setFighter2(p);
    } catch (err) {
      console.error('Error fetching random pokemon:', err);
    } finally {
      setLoadingFighters(false);
    }
  };

  const handleSearchFighter = async (e, slot) => {
    e.preventDefault();
    const query = slot === 1 ? f1Search : f2Search;
    if (!query.trim()) return;

    try {
      setLoadingFighters(true);
      if (slot === 1) setF1SearchError('');
      else setF2SearchError('');

      const p = await fetchPokemon(query);
      if (slot === 1) {
        setFighter1(p);
        setF1Search('');
      } else {
        setFighter2(p);
        setF2Search('');
      }
    } catch {
      if (slot === 1) setF1SearchError('Pokémon not found! Try spelling or ID #.');
      else setF2SearchError('Pokémon not found! Try spelling or ID #.');
    } finally {
      setLoadingFighters(false);
    }
  };

  const playCry = (pokemon) => {
    if (!pokemon || isMuted) return;
    const cryUrl = pokemon?.cries?.latest || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`;
    try {
      const audio = new Audio(cryUrl);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch {}
  };

  const startBattle = () => {
    if (!fighter1 || !fighter2) return;
    const p1Hp = (fighter1.stats?.find((s) => s.stat.name === 'hp')?.base_stat || 70) * 2;
    const p2Hp = (fighter2.stats?.find((s) => s.stat.name === 'hp')?.base_stat || 70) * 2;
    setF1Hp(p1Hp);
    setF1MaxHp(p1Hp);
    setF2Hp(p2Hp);
    setF2MaxHp(p2Hp);
    setWinner(null);
    setBattleLog([
      `⚔️ The arena battle has begun in ${selectedArena.name}!`,
      `[${fighter1.name.toUpperCase()}] vs [${fighter2.name.toUpperCase()}]`,
      `Field Effect: ${selectedArena.boostDesc}`
    ]);
    playCry(fighter1);
    setInBattle(true);
    setTurn('player');
  };

  // Turn execution
  const executePlayerMove = (moveType, moveName, basePower) => {
    if (turn !== 'player' || winner) return;

    setAnimatingFighter('f1');
    playCry(fighter1);

    setTimeout(() => {
      setAnimatingFighter(null);
      setImpactFighter('f2');

      const f2Types = fighter2.types?.map((t) => t.type.name) || [];
      const effectiveness = getEffectiveness(moveType, f2Types);
      let arenaBonus = 1;
      if (moveType === selectedArena.element) {
        arenaBonus = 1.25;
      }

      const p1Atk = fighter1.stats?.find((s) => s.stat.name === 'attack' || s.stat.name === 'special-attack')?.base_stat || 70;
      const p2Def = fighter2.stats?.find((s) => s.stat.name === 'defense' || s.stat.name === 'special-defense')?.base_stat || 65;

      const rawDamage = Math.round(((2 * 50 / 5 + 2) * basePower * (p1Atk / p2Def) / 50 + 2) * effectiveness * arenaBonus * (0.85 + Math.random() * 0.3));
      const damage = Math.max(12, rawDamage);

      const nextF2Hp = Math.max(0, f2Hp - damage);
      setF2Hp(nextF2Hp);

      const logs = [`💥 ${fighter1.name.toUpperCase()} used ${moveName}! Dealt ${damage} DMG.`];
      if (effectiveness > 1) logs.push(`⚡ Super effective hit! (x${effectiveness})`);
      if (effectiveness < 1 && effectiveness > 0) logs.push(`🛡️ Resisted hit. (x${effectiveness})`);
      if (effectiveness === 0) logs.push(`💨 No damage! Target is immune.`);
      if (arenaBonus > 1) logs.push(`✨ ${selectedArena.name} field boost granted +25% bonus power!`);

      setBattleLog((prev) => [...prev, ...logs]);

      setTimeout(() => setImpactFighter(null), 400);

      if (nextF2Hp <= 0) {
        setWinner('f1');
        setTurn('finished');
        setBattleLog((prev) => [...prev, `🏆 ${fighter2.name.toUpperCase()} fainted! You emerged victorious!`]);
      } else {
        setTurn('enemy');
        setTimeout(() => executeEnemyTurn(nextF2Hp), 1100);
      }
    }, 380);
  };

  const executeEnemyTurn = (currentF2Hp) => {
    if (winner) return;

    setAnimatingFighter('f2');
    playCry(fighter2);

    setTimeout(() => {
      setAnimatingFighter(null);
      setImpactFighter('f1');

      const f2PrimaryType = fighter2.types?.[0]?.type?.name || 'normal';
      const enemyMove = TYPE_MOVES[f2PrimaryType] || { name: `${f2PrimaryType.toUpperCase()} Attack`, power: 65 };
      const f1Types = fighter1.types?.map((t) => t.type.name) || [];
      const effectiveness = getEffectiveness(f2PrimaryType, f1Types);
      let arenaBonus = 1;
      if (f2PrimaryType === selectedArena.element) arenaBonus = 1.25;

      const p2Atk = fighter2.stats?.find((s) => s.stat.name === 'attack' || s.stat.name === 'special-attack')?.base_stat || 70;
      const p1Def = fighter1.stats?.find((s) => s.stat.name === 'defense' || s.stat.name === 'special-defense')?.base_stat || 65;

      const rawDamage = Math.round(((2 * 50 / 5 + 2) * enemyMove.power * (p2Atk / p1Def) / 50 + 2) * effectiveness * arenaBonus * (0.85 + Math.random() * 0.3));
      const damage = Math.max(12, rawDamage);

      setF1Hp((prevHp) => {
        const nextHp = Math.max(0, prevHp - damage);

        const logs = [`🎯 Opponent ${fighter2.name.toUpperCase()} launched ${enemyMove.name}! (-${damage} HP)`];
        if (effectiveness > 1) logs.push(`💥 It's super effective on your Pokémon!`);
        if (effectiveness < 1 && effectiveness > 0) logs.push(`🛡️ Your Pokémon resisted the blow.`);
        if (arenaBonus > 1) logs.push(`✨ ${selectedArena.name} enhanced the opponent's strike!`);

        setBattleLog((prev) => [...prev, ...logs]);

        if (nextHp <= 0) {
          setWinner('f2');
          setTurn('finished');
          setBattleLog((prev) => [...prev, `💀 ${fighter1.name.toUpperCase()} fainted! Opponent won the duel.`]);
        } else {
          setTurn('player');
        }
        return nextHp;
      });

      setTimeout(() => setImpactFighter(null), 400);
    }, 380);
  };

  const handlePlayerHeal = () => {
    if (turn !== 'player' || winner) return;
    const healAmount = Math.round(f1MaxHp * 0.35);
    const newHp = Math.min(f1MaxHp, f1Hp + healAmount);
    setF1Hp(newHp);
    setBattleLog((prev) => [
      ...prev,
      `💊 ${fighter1.name.toUpperCase()} used Max Potion! Recovered ${healAmount} HP.`
    ]);
    setTurn('enemy');
    setTimeout(() => executeEnemyTurn(f2Hp), 1000);
  };

  const getSprite = (p) => {
    return p?.sprites?.other?.showdown?.front_default ||
           p?.sprites?.other?.['official-artwork']?.front_default ||
           p?.sprites?.front_default;
  };

  // Move 2: Signature move configuration based on Player's primary type
  const p1PrimaryType = fighter1?.types?.[0]?.type?.name || 'normal';
  const p1SigMove = TYPE_MOVES[p1PrimaryType] || { name: `${p1PrimaryType.toUpperCase()} Burst`, power: 75, icon: '💥' };
  const p2Types = fighter2?.types?.map((t) => t.type.name) || [];
  const p1TypeMult = getEffectiveness(p1PrimaryType, p2Types);

  return (
    <div className="battle-arena-page" style={{ background: selectedArena.bgGradient }}>
      {/* Top Header */}
      <header className="battle-top-nav">
        <button className="nav-pill-btn" onClick={() => navigate('/Pokemon')}>
          ⬅ Return to Pokédex
        </button>

        <div className="arena-title-chip">
          <span className="arena-icon">{selectedArena.icon}</span>
          <div>
            <h2>{selectedArena.name}</h2>
            <span className="arena-sub">{selectedArena.region} • {selectedArena.boostDesc}</span>
          </div>
        </div>

        <div className="header-right-tools">
          <button
            className={`nav-pill-btn sound-btn ${isMuted ? 'muted' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? '🔇 Muted' : '🔊 Sound On'}
          </button>

          {inBattle && (
            <button className="nav-pill-btn forfeit-btn" onClick={() => setInBattle(false)}>
              🏳️ Exit Duel
            </button>
          )}
        </div>
      </header>

      {/* SETUP PHASE */}
      {!inBattle ? (
        <div className="battle-setup-container">
          <div className="setup-header">
            <span className="setup-tag">VS SIMULATOR</span>
            <h1>⚔️ Cross-Gen Battle Arena</h1>
            <p>Pick your Pokémon, select your opponent, and battle in legendary regional arenas!</p>
          </div>

          {/* Quick Presets Carousel */}
          <div className="presets-card">
            <span className="presets-label">⚡ 1-Click Matchup Presets:</span>
            <div className="presets-row">
              {PRESET_BATTLES.map((preset) => (
                <button
                  key={preset.title}
                  className="preset-pill"
                  onClick={() => loadPreset(preset)}
                >
                  <span className="preset-pill-title">{preset.title}</span>
                  <span className="preset-pill-badge">{preset.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Arena Battleground Selector */}
          <div className="arena-selector-section">
            <div className="section-title-row">
              <span className="section-step">Step 1</span>
              <h3>Choose Regional Battleground</h3>
            </div>

            <div className="arenas-grid">
              {BATTLEGROUNDS.map((arena) => (
                <div
                  key={arena.id}
                  className={`arena-card ${selectedArena.id === arena.id ? 'active' : ''}`}
                  onClick={() => setSelectedArena(arena)}
                  style={{ borderColor: selectedArena.id === arena.id ? arena.arenaColor : 'transparent' }}
                >
                  <span className="arena-card-icon">{arena.icon}</span>
                  <div className="arena-card-info">
                    <strong>{arena.name}</strong>
                    <span>{arena.region}</span>
                    <small>{arena.boostDesc}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fighters Matchup Grid */}
          <div className="section-title-row" style={{ marginTop: '30px' }}>
            <span className="section-step">Step 2</span>
            <h3>Select Fighters & Eras</h3>
          </div>

          <div className="fighters-matchup-grid">
            {/* Fighter 1 (Player) */}
            <div className="fighter-selection-card">
              <div className="card-top">
                <span className="fighter-slot-badge">PLAYER 1</span>
                <select
                  value={fighter1Gen}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    setFighter1Gen(g);
                    handleRandomizeFighter(1, g);
                  }}
                  className="gen-dropdown"
                >
                  {GENERATIONS.map((gen) => (
                    <option key={gen.id} value={gen.id}>
                      {gen.name} ({gen.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search By Name Input */}
              <form onSubmit={(e) => handleSearchFighter(e, 1)} className="fighter-search-form">
                <input
                  type="text"
                  placeholder="Search Pokémon (e.g. Charizard)..."
                  value={f1Search}
                  onChange={(e) => setF1Search(e.target.value)}
                  className="fighter-search-input"
                />
                <button type="submit" className="fighter-search-btn">Find</button>
              </form>
              {f1SearchError && <span className="search-err">{f1SearchError}</span>}

              {/* Quick Popular Picks */}
              <div className="quick-picks-row">
                {(POPULAR_PICKS[fighter1Gen] || ['Pikachu', 'Charizard']).slice(0, 4).map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="quick-pick-btn"
                    onClick={async () => {
                      setLoadingFighters(true);
                      const p = await fetchPokemon(name);
                      setFighter1(p);
                      setLoadingFighters(false);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {fighter1 && (
                <div className="fighter-preview">
                  <img src={getSprite(fighter1)} alt={fighter1.name} className="fighter-img" />
                  <h3>{fighter1.name}</h3>
                  <div className="types-mini-row">
                    {fighter1.types?.map((t) => (
                      <span key={t.type.name} className={`type-tag ${t.type.name}`}>
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                  <span className="fighter-bst">
                    BST: {fighter1.stats?.reduce((acc, c) => acc + c.base_stat, 0)} • HP: {(fighter1.stats?.find((s) => s.stat.name === 'hp')?.base_stat || 70) * 2}
                  </span>
                </div>
              )}

              <button
                className="random-fighter-btn"
                onClick={() => handleRandomizeFighter(1, fighter1Gen)}
                disabled={loadingFighters}
              >
                🎲 Randomize Gen {fighter1Gen} Fighter
              </button>

              {/* User's Battle Party Integration */}
              {team && team.length > 0 && (
                <div className="party-pick-row">
                  <span className="party-pick-lbl">Pick from My Battle Party:</span>
                  <div className="party-pick-chips">
                    {team.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        className="party-chip-btn"
                        onClick={async () => {
                          setLoadingFighters(true);
                          const p = await fetchPokemon(member.id);
                          setFighter1(p);
                          setLoadingFighters(false);
                        }}
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VS Divider */}
            <div className="vs-badge-wrapper">
              <span className="vs-badge">VS</span>
            </div>

            {/* Fighter 2 (Challenger) */}
            <div className="fighter-selection-card">
              <div className="card-top">
                <span className="fighter-slot-badge enemy">OPPONENT</span>
                <select
                  value={fighter2Gen}
                  onChange={(e) => {
                    const g = Number(e.target.value);
                    setFighter2Gen(g);
                    handleRandomizeFighter(2, g);
                  }}
                  className="gen-dropdown"
                >
                  {GENERATIONS.map((gen) => (
                    <option key={gen.id} value={gen.id}>
                      {gen.name} ({gen.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search By Name Input */}
              <form onSubmit={(e) => handleSearchFighter(e, 2)} className="fighter-search-form">
                <input
                  type="text"
                  placeholder="Search Opponent (e.g. Greninja)..."
                  value={f2Search}
                  onChange={(e) => setF2Search(e.target.value)}
                  className="fighter-search-input"
                />
                <button type="submit" className="fighter-search-btn">Find</button>
              </form>
              {f2SearchError && <span className="search-err">{f2SearchError}</span>}

              {/* Quick Popular Picks */}
              <div className="quick-picks-row">
                {(POPULAR_PICKS[fighter2Gen] || ['Greninja', 'Sylveon']).slice(0, 4).map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="quick-pick-btn"
                    onClick={async () => {
                      setLoadingFighters(true);
                      const p = await fetchPokemon(name);
                      setFighter2(p);
                      setLoadingFighters(false);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {fighter2 && (
                <div className="fighter-preview">
                  <img src={getSprite(fighter2)} alt={fighter2.name} className="fighter-img" />
                  <h3>{fighter2.name}</h3>
                  <div className="types-mini-row">
                    {fighter2.types?.map((t) => (
                      <span key={t.type.name} className={`type-tag ${t.type.name}`}>
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                  <span className="fighter-bst">
                    BST: {fighter2.stats?.reduce((acc, c) => acc + c.base_stat, 0)} • HP: {(fighter2.stats?.find((s) => s.stat.name === 'hp')?.base_stat || 70) * 2}
                  </span>
                </div>
              )}

              <button
                className="random-fighter-btn"
                onClick={() => handleRandomizeFighter(2, fighter2Gen)}
                disabled={loadingFighters}
              >
                🎲 Randomize Gen {fighter2Gen} Challenger
              </button>
            </div>
          </div>

          <button className="start-battle-cta" onClick={startBattle} disabled={loadingFighters || !fighter1 || !fighter2}>
            ⚔️ Enter {selectedArena.name} & Fight!
          </button>
        </div>
      ) : (
        /* ACTIVE BATTLE STAGE */
        <div className="battle-stage-container">
          {/* Turn Indicator Header */}
          <div className={`turn-banner ${turn === 'player' ? 'player-turn' : turn === 'enemy' ? 'enemy-turn' : 'win-turn'}`}>
            {turn === 'player' && '🟢 YOUR TURN — Select your combat move below!'}
            {turn === 'enemy' && '🔴 OPPONENT IS ATTACKING — Hold on!'}
            {turn === 'finished' && '🏆 DUEL CONCLUDED'}
          </div>

          {/* Battle Field */}
          <div className="arena-battleground-field">
            {/* Enemy (Fighter 2) Platform */}
            <div className={`pokemon-combatant enemy-side ${animatingFighter === 'f2' ? 'anim-attack' : ''} ${impactFighter === 'f2' ? 'anim-hit' : ''}`}>
              <div className="combatant-hud">
                <div className="hud-header">
                  <span className="hud-name">{fighter2.name}</span>
                  <span className="hud-lvl">Lv. 50</span>
                </div>
                <div className="hp-bar-track">
                  <div
                    className="hp-bar-fill"
                    style={{
                      width: `${(f2Hp / f2MaxHp) * 100}%`,
                      backgroundColor: (f2Hp / f2MaxHp) > 0.5 ? '#22c55e' : (f2Hp / f2MaxHp) > 0.2 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
                <span className="hp-text">{f2Hp} / {f2MaxHp} HP</span>
              </div>

              <div className="combatant-platform">
                <img src={getSprite(fighter2)} alt={fighter2.name} className="combat-sprite enemy" />
              </div>
            </div>

            {/* Player (Fighter 1) Platform */}
            <div className={`pokemon-combatant player-side ${animatingFighter === 'f1' ? 'anim-attack' : ''} ${impactFighter === 'f1' ? 'anim-hit' : ''}`}>
              <div className="combatant-platform">
                <img src={getSprite(fighter1)} alt={fighter1.name} className="combat-sprite player" />
              </div>

              <div className="combatant-hud">
                <div className="hud-header">
                  <span className="hud-name">{fighter1.name}</span>
                  <span className="hud-lvl">Lv. 50</span>
                </div>
                <div className="hp-bar-track">
                  <div
                    className="hp-bar-fill"
                    style={{
                      width: `${(f1Hp / f1MaxHp) * 100}%`,
                      backgroundColor: (f1Hp / f1MaxHp) > 0.5 ? '#22c55e' : (f1Hp / f1MaxHp) > 0.2 ? '#f59e0b' : '#ef4444'
                    }}
                  ></div>
                </div>
                <span className="hp-text">{f1Hp} / {f1MaxHp} HP</span>
              </div>
            </div>
          </div>

          {/* Interactive Battle Controls & Combat Log */}
          <div className="battle-controls-tray">
            {/* Action Commands */}
            <div className="moves-panel">
              <span className="moves-title">Command Actions:</span>

              <div className="moves-grid">
                {/* Move 1: Quick Strike */}
                <button
                  className="move-btn normal-move"
                  onClick={() => executePlayerMove('normal', 'Quick Strike', 45)}
                  disabled={turn !== 'player' || Boolean(winner)}
                >
                  <div className="move-top">
                    <span className="move-name">💥 Quick Strike</span>
                    <span className="move-power">PWR 45</span>
                  </div>
                  <span className="move-meta">Normal • Fast Attack</span>
                </button>

                {/* Move 2: Elemental Signature Move with effectiveness hint */}
                <button
                  className={`move-btn type-move ${p1PrimaryType}`}
                  onClick={() => executePlayerMove(p1PrimaryType, p1SigMove.name, p1SigMove.power)}
                  disabled={turn !== 'player' || Boolean(winner)}
                >
                  <div className="move-top">
                    <span className="move-name">{p1SigMove.icon} {p1SigMove.name}</span>
                    <span className="move-power">PWR {p1SigMove.power}</span>
                  </div>
                  <span className="move-meta">
                    {p1PrimaryType.toUpperCase()}
                    {p1TypeMult > 1 && <strong className="type-mult-super"> • 2x Super Effective!</strong>}
                    {p1TypeMult < 1 && p1TypeMult > 0 && <span className="type-mult-res"> • 0.5x Resisted</span>}
                  </span>
                </button>

                {/* Move 3: Arena Field Move */}
                <button
                  className="move-btn arena-move"
                  onClick={() =>
                    executePlayerMove(
                      selectedArena.element,
                      `${selectedArena.name} Surge`,
                      80
                    )
                  }
                  disabled={turn !== 'player' || Boolean(winner)}
                  title={selectedArena.boostDesc}
                >
                  <div className="move-top">
                    <span className="move-name">{selectedArena.icon} Arena Surge</span>
                    <span className="move-power">PWR 80</span>
                  </div>
                  <span className="move-meta">{selectedArena.element} • +25% Arena Boost!</span>
                </button>

                {/* Move 4: Max Potion / Heal */}
                <button
                  className="move-btn heal-move"
                  onClick={handlePlayerHeal}
                  disabled={turn !== 'player' || Boolean(winner) || f1Hp >= f1MaxHp}
                >
                  <div className="move-top">
                    <span className="move-name">💊 Max Potion</span>
                    <span className="move-power">HEAL</span>
                  </div>
                  <span className="move-meta">Recover +35% Max HP</span>
                </button>
              </div>
            </div>

            {/* Combat Log */}
            <div className="combat-log-window" ref={logContainerRef}>
              <div className="log-header-row">
                <span className="log-title">Live Combat Log</span>
                <span className="log-count">{battleLog.length} events</span>
              </div>
              {battleLog.map((entry, index) => (
                <div key={index} className="log-entry">
                  {entry}
                </div>
              ))}
            </div>
          </div>

          {/* Victory Overlay Modal */}
          {winner && (
            <div className="victory-overlay">
              <div className="victory-card">
                <h2>{winner === 'f1' ? '🎉 VICTORY!' : '💀 DEFEATED'}</h2>
                <p>
                  {winner === 'f1'
                    ? `Outstanding strategy! Your ${fighter1.name.toUpperCase()} triumphed over [Gen ${fighter2Gen}] ${fighter2.name.toUpperCase()} in ${selectedArena.name}!`
                    : `Good effort! Your ${fighter1.name.toUpperCase()} fell in battle against [Gen ${fighter2Gen}] ${fighter2.name.toUpperCase()}.`}
                </p>
                <div className="victory-actions">
                  <button className="replay-btn" onClick={startBattle}>
                    🔄 Battle Rematch
                  </button>
                  <button className="change-fighters-btn" onClick={() => setInBattle(false)}>
                    ⚙️ Return to Setup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BattleArena;
