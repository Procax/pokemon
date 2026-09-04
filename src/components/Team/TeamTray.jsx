import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MyContext from '../MyContext';
import './TeamTray.css';

export const TeamTray = ({ onSelectPokemon }) => {
  const navigate = useNavigate();
  const { team, removeFromTeam } = useContext(MyContext);
  const [isOpen, setIsOpen] = useState(true);

  // Compute distinct types in team
  const coveredTypes = Array.from(
    new Set(team.flatMap((p) => p.types || []))
  );

  return (
    <div className={`team-tray-container ${isOpen ? 'expanded' : 'collapsed'}`}>
      {/* Header / Toggle tab */}
      <div className="team-tray-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="tray-title-group">
          <span className="tray-icon">🎒</span>
          <span className="tray-title">Battle Team</span>
          <span className="team-count-badge">{team.length} / 6</span>
        </div>

        <div className="tray-meta">
          {team.length > 0 && (
            <>
              <div className="synergy-tags">
                <span className="synergy-label">Types ({coveredTypes.length}):</span>
                {coveredTypes.slice(0, 5).map((type) => (
                  <span key={type} className={`mini-type-badge ${type}`}>
                    {type}
                  </span>
                ))}
                {coveredTypes.length > 5 && <span className="more-types">+{coveredTypes.length - 5}</span>}
              </div>

              <button
                className="tray-battle-cta"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/battle');
                }}
              >
                ⚔️ Go to Battle Arena
              </button>
            </>
          )}

          <button className="tray-toggle-btn" aria-label="Toggle team dock">
            {isOpen ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {/* 6 Slots Body */}
      {isOpen && (
        <div className="team-slots-grid">
          {[...Array(6)].map((_, index) => {
            const member = team[index];

            return (
              <div
                key={member ? member.id : `empty-${index}`}
                className={`team-slot ${member ? 'filled' : 'empty'}`}
              >
                {member ? (
                  <>
                    <button
                      className="slot-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromTeam(member.id);
                      }}
                      title={`Remove ${member.name}`}
                    >
                      &times;
                    </button>
                    <div
                      className="slot-content"
                      onClick={() => onSelectPokemon && onSelectPokemon(member)}
                      title={`Inspect ${member.name}`}
                    >
                      <img src={member.sprite} alt={member.name} className="slot-img" />
                      <span className="slot-name">{member.name}</span>
                    </div>
                  </>
                ) : (
                  <div className="empty-slot-placeholder">
                    <div className="empty-pokeball"></div>
                    <span className="empty-label">Slot {index + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamTray;
