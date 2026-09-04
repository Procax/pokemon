import React, { createContext, useState, useEffect } from 'react';

const MyContext = createContext();

const DEFAULT_TRAINER = {
  name: 'Ash Ketchum',
  avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/1.png',
  trainerId: '74291',
  badges: ['Boulder', 'Cascade', 'Thunder', 'Rainbow', 'Soul', 'Marsh', 'Volcano', 'Earth'],
  joinedDate: 'Sep 2026'
};

export const MyContextProvider = ({ children }) => {
  const [trainer, setTrainer] = useState(() => {
    try {
      const saved = localStorage.getItem('trainerData');
      return saved ? JSON.parse(saved) : DEFAULT_TRAINER;
    } catch {
      return DEFAULT_TRAINER;
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('pokemonFavorites');
      return saved ? JSON.parse(saved) : [25]; // Default Pikachu favorite
    } catch {
      return [25];
    }
  });

  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem('pokemonTeam');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('trainerData', JSON.stringify(trainer));
  }, [trainer]);

  useEffect(() => {
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('pokemonTeam', JSON.stringify(team));
  }, [team]);

  const loginTrainer = (trainerInfo) => {
    const newTrainer = {
      name: trainerInfo.name || 'Trainer',
      avatar: trainerInfo.avatar || DEFAULT_TRAINER.avatar,
      trainerId: Math.floor(10000 + Math.random() * 90000).toString(),
      badges: DEFAULT_TRAINER.badges,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    setTrainer(newTrainer);
    localStorage.setItem('authToken', 'token_' + Date.now());
  };

  const logoutTrainer = () => {
    localStorage.removeItem('authToken');
    setTrainer(DEFAULT_TRAINER);
  };

  const toggleFavorite = (pokemonId) => {
    setFavorites((prev) =>
      prev.includes(pokemonId) ? prev.filter((id) => id !== pokemonId) : [...prev, pokemonId]
    );
  };

  const isFavorite = (pokemonId) => favorites.includes(pokemonId);

  const addToTeam = (pokemon) => {
    if (team.length >= 6) {
      alert('Your battle team already has 6 Pokémon! Remove one first.');
      return false;
    }
    if (team.some((p) => p.id === pokemon.id)) {
      alert(`${pokemon.name} is already in your party!`);
      return false;
    }
    const simplified = {
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon?.sprites?.other?.['official-artwork']?.front_default ||
              pokemon?.sprites?.other?.home?.front_default ||
              pokemon?.sprites?.front_default,
      types: pokemon?.types?.map((t) => t.type.name) || [],
      stats: pokemon.stats
    };
    setTeam((prev) => [...prev, simplified]);
    return true;
  };

  const removeFromTeam = (pokemonId) => {
    setTeam((prev) => prev.filter((p) => p.id !== pokemonId));
  };

  const isInTeam = (pokemonId) => team.some((p) => p.id === pokemonId);

  return (
    <MyContext.Provider
      value={{
        trainer,
        loginTrainer,
        logoutTrainer,
        favorites,
        toggleFavorite,
        isFavorite,
        team,
        addToTeam,
        removeFromTeam,
        isInTeam
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export default MyContext;
