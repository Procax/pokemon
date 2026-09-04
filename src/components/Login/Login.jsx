import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MyContext from '../MyContext';
import './Login.css';

const AVATAR_OPTIONS = [
  { id: 'ash', name: 'Ash Ketchum', url: 'https://play.pokemonshowdown.com/sprites/trainers/ash.png' },
  { id: 'red', name: 'Champion Red', url: 'https://play.pokemonshowdown.com/sprites/trainers/red.png' },
  { id: 'misty', name: 'Leader Misty', url: 'https://play.pokemonshowdown.com/sprites/trainers/misty.png' },
  { id: 'dawn', name: 'Coordinator Dawn', url: 'https://play.pokemonshowdown.com/sprites/trainers/dawn.png' },
  { id: 'cynthia', name: 'Champion Cynthia', url: 'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png' },
  { id: 'brock', name: 'Leader Brock', url: 'https://play.pokemonshowdown.com/sprites/trainers/brock.png' }
];

function Login() {
  const navigate = useNavigate();
  const { loginTrainer } = useContext(MyContext);

  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [region, setRegion] = useState('Kanto');

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trainerName = name.trim() || selectedAvatar.name.split(' ')[1] || 'Pokémon Trainer';
    loginTrainer({
      name: trainerName,
      avatar: selectedAvatar.url,
      region
    });
    navigate('/Pokemon');
  };

  const handleQuickPlay = () => {
    loginTrainer({
      name: 'Ash Ketchum',
      avatar: AVATAR_OPTIONS[0].url,
      region: 'Kanto'
    });
    navigate('/Pokemon');
  };

  return (
    <div className="login-page">
      <div className="login-backdrop-glow"></div>
      
      <div className="login-card-container">
        <div className="login-header">
          <div className="pokeball-badge"></div>
          <h1>Pokémon League</h1>
          <p>Official Trainer License & Pokédex Pass</p>
        </div>

        <form onSubmit={handleSubmit} className="trainer-form">
          <div className="form-group">
            <label>Trainer Name</label>
            <input
              type="text"
              placeholder="Enter your trainer name..."
              value={name}
              maxLength={20}
              onChange={(e) => setName(e.target.value)}
              className="trainer-name-input"
            />
          </div>

          <div className="form-group">
            <label>Origin Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="region-select"
            >
              <option value="Kanto">Kanto (Gen I)</option>
              <option value="Johto">Johto (Gen II)</option>
              <option value="Hoenn">Hoenn (Gen III)</option>
              <option value="Sinnoh">Sinnoh (Gen IV)</option>
            </select>
          </div>

          <div className="avatar-section">
            <label>Select Trainer Avatar</label>
            <div className="avatar-grid">
              {AVATAR_OPTIONS.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`avatar-option ${selectedAvatar.id === avatar.id ? 'active' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
                    }}
                  />
                  <span>{avatar.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Trainer ID Preview */}
          <div className="trainer-pass-preview">
            <div className="preview-top">
              <span className="pass-title">TRAINER CARD</span>
              <span className="pass-id">IDNo. 74291</span>
            </div>
            <div className="preview-body">
              <img
                src={selectedAvatar.url}
                alt="Selected Avatar"
                className="preview-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
                }}
              />
              <div className="preview-details">
                <div className="preview-name">{name.trim() || 'Your Name Here'}</div>
                <div className="preview-region">Region: {region}</div>
                <div className="badge-dots">
                  <span>🔴</span><span>🟠</span><span>🟡</span><span>🟢</span>
                  <span>🔵</span><span>🟣</span><span>🟤</span><span>⚪</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="start-btn">
              ⚡ Begin Adventure
            </button>
            <button type="button" onClick={handleQuickPlay} className="guest-btn">
              Quick Play as Ash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
