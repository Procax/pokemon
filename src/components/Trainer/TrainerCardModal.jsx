import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import MyContext from '../MyContext';
import './TrainerCardModal.css';

const KANTO_BADGES = [
  { name: 'Boulder Badge', city: 'Pewter City', icon: '🪨', color: '#78716c' },
  { name: 'Cascade Badge', city: 'Cerulean City', icon: '💧', color: '#0284c7' },
  { name: 'Thunder Badge', city: 'Vermilion City', icon: '⚡', color: '#eab308' },
  { name: 'Rainbow Badge', city: 'Celadon City', icon: '🌈', color: '#10b981' },
  { name: 'Soul Badge', city: 'Fuchsia City', icon: '💜', color: '#a855f7' },
  { name: 'Marsh Badge', city: 'Saffron City', icon: '🌀', color: '#ec4899' },
  { name: 'Volcano Badge', city: 'Cinnabar Island', icon: '🔥', color: '#f97316' },
  { name: 'Earth Badge', city: 'Viridian City', icon: '🌿', color: '#84cc16' }
];

export const TrainerCardModal = ({ isOpen, onClose, totalPokemonCount = 151 }) => {
  const { trainer, logoutTrainer, favorites, team } = useContext(MyContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutTrainer();
    onClose();
    navigate('/login');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="600px">
      <div className="trainer-card-modal-content">
        {/* Holographic Trainer Card */}
        <div className="retro-trainer-pass">
          <div className="pass-shimmer"></div>

          {/* Card Top */}
          <div className="pass-header">
            <div className="pass-title-box">
              <span className="league-title">POKÉMON LEAGUE</span>
              <span className="card-type">TRAINER CARD</span>
            </div>
            <div className="pass-id-box">
              <span>IDNo.</span>
              <strong>{trainer?.trainerId || '74291'}</strong>
            </div>
          </div>

          {/* Card Middle: Profile & Details */}
          <div className="pass-profile-row">
            <div className="pass-avatar-frame">
              <img
                src={trainer?.avatar}
                alt={trainer?.name}
                className="trainer-avatar-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
                }}
              />
              <span className="trainer-rank-tag">Master Trainer</span>
            </div>

            <div className="pass-info-col">
              <div className="info-field">
                <span className="field-lbl">NAME:</span>
                <span className="field-val highlight-name">{trainer?.name || 'Red'}</span>
              </div>
              <div className="info-field">
                <span className="field-lbl">REGION:</span>
                <span className="field-val">{trainer?.region || 'Kanto'}</span>
              </div>
              <div className="info-field">
                <span className="field-lbl">JOINED:</span>
                <span className="field-val">{trainer?.joinedDate || 'Sep 2026'}</span>
              </div>

              {/* Progress Counters */}
              <div className="pass-counters">
                <div className="mini-stat">
                  <span className="count-num">{favorites.length}</span>
                  <span className="count-lbl">Favorites</span>
                </div>
                <div className="mini-stat">
                  <span className="count-num">{team.length}/6</span>
                  <span className="count-lbl">Party</span>
                </div>
                <div className="mini-stat">
                  <span className="count-num">{totalPokemonCount}</span>
                  <span className="count-lbl">Dex Seen</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Battle Team Preview */}
          <div className="pass-team-row">
            <span className="team-row-label">REGISTERED BATTLE PARTY</span>
            <div className="pass-team-sprites">
              {[...Array(6)].map((_, idx) => {
                const member = team[idx];
                return (
                  <div key={idx} className="pass-party-slot">
                    {member ? (
                      <img src={member.sprite} alt={member.name} title={member.name} />
                    ) : (
                      <span className="empty-slot-dot">●</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gym Badges Section */}
          <div className="pass-badges-section">
            <span className="badges-title">OFFICIAL GYM BADGES</span>
            <div className="badges-case">
              {KANTO_BADGES.map((badge, index) => (
                <div
                  key={badge.name}
                  className="badge-item"
                  title={`${badge.name} (${badge.city})`}
                  style={{ borderColor: badge.color }}
                >
                  <span className="badge-icon">{badge.icon}</span>
                  <span className="badge-name">{badge.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="trainer-modal-actions">
          <button className="switch-trainer-btn" onClick={handleLogout}>
            🚪 Logout / Switch Trainer
          </button>
          <button className="close-pass-btn" onClick={onClose}>
            Back to Pokédex
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TrainerCardModal;
