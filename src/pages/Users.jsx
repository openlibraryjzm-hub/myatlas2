import React, { useState } from 'react';
import { Heart, Settings, LogOut, Award, Globe, Image as ImageIcon, User, UserPlus, LogIn } from 'lucide-react';
import { loginServerUser, registerServerUser } from '../services/api';
import './Users.css';

// Custom Mythological Atlas SVG Icon (Titan holding up the celestial sphere)
function MythologicalAtlasIcon({ size = 18, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.75" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Celestial Sphere / Boulder held on shoulders */}
      <circle cx="15.5" cy="7.5" r="5.5" />
      <path d="M 10.5 7.5 H 20.5" strokeWidth="1.2" opacity="0.6" />
      <path d="M 15.5 2.5 C 17.5 4.5 17.5 10.5 15.5 12.5" strokeWidth="1.2" opacity="0.6" />

      {/* Atlas's Head - bent down */}
      <circle cx="7" cy="11.5" r="1.5" fill="currentColor" />

      {/* Hunched Back & Torso carrying weight */}
      <path d="M 5 21 L 7 15 C 8 13.5 10 12.5 13 13" />

      {/* Raised Bracing Arms holding sphere */}
      <path d="M 9.5 13 L 13 8.5" />

      {/* Bracing Legs */}
      <path d="M 7 15 L 4 21" />
      <path d="M 9.5 15.5 L 12 21" />
      <path d="M 3 21 H 14" strokeWidth="1.2" />
    </svg>
  );
}

export default function Users({ currentUser, onLogin, onLogout }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput) return;

    setErrorMsg('');
    setSubmitting(true);

    try {
      if (authMode === 'login') {
        const res = await loginServerUser(usernameInput.trim(), passwordInput);
        if (res && res.user) {
          onLogin(res.user);
        }
      } else {
        const res = await registerServerUser({
          username: usernameInput.trim(),
          displayName: displayNameInput.trim() || usernameInput.trim(),
          password: passwordInput
        });
        if (res && res.user) {
          onLogin(res.user);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Check credentials or C# backend.');
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // STATE 1: UNAUTHENTICATED / LOGGED OUT
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="user-profile-page logged-out-view">
        <div className="auth-card-container">
          <div className="auth-card-header">
            <div className="auth-header-icon-badge">
              <User size={24} />
            </div>
            <h2 className="auth-title">
              {authMode === 'login' ? 'Sign In to Atlas Network' : 'Create Local Account'}
            </h2>
            <p className="auth-subtitle">
              {authMode === 'login' 
                ? 'Enter your local handle and password to manage sovereign sub-atlases' 
                : 'Register a new offline local identity for media curation'}
            </p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button 
              className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
            >
              <UserPlus size={15} />
              <span>Register</span>
            </button>
          </div>

          {errorMsg && (
            <div className="auth-error-banner">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Username Handle</label>
              <div className="auth-input-wrapper">
                <span className="auth-handle-prefix">@</span>
                <input 
                  type="text"
                  placeholder="curator"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="auth-input"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="auth-input standalone-input"
                required
              />
            </div>

            {authMode === 'register' && (
              <div className="auth-field">
                <label className="auth-label">Display Name</label>
                <input 
                  type="text"
                  placeholder="Curator"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="auth-input standalone-input"
                />
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn" 
              disabled={submitting || !usernameInput.trim() || !passwordInput}
            >
              {submitting 
                ? 'Authenticating...' 
                : authMode === 'login' 
                  ? 'Sign In to Profile' 
                  : 'Create Local Profile'}
            </button>
          </form>

          <div className="auth-footer-note">
            100% offline local authentication store operating on C# SQLite.
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: AUTHENTICATED / LOGGED IN PROFILE
  // -------------------------------------------------------------
  const initialLetter = (currentUser.displayName || currentUser.username || 'C').charAt(0).toUpperCase();

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        {/* Left Side: Avatar, Icon Options, and Bio Box */}
        <aside className="user-profile-left">
          {/* Large Square Profile Picture Placeholder */}
          <div className="user-avatar-square-placeholder">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.username} className="avatar-img-full" />
            ) : (
              <div className="avatar-blank-inner">
                <span className="avatar-initial-badge">{initialLetter}</span>
                <span className="avatar-handle-badge">@{currentUser.username}</span>
              </div>
            )}
          </div>

          {/* Pure Icon-Only Action Options */}
          <div className="user-options-row icon-only-row">
            <button className="user-option-icon-btn" title="MyAtlas" onClick={(e) => e.preventDefault()}>
              <Heart size={18} />
            </button>
            <button className="user-option-icon-btn" title="Atlases" onClick={(e) => e.preventDefault()}>
              <MythologicalAtlasIcon size={18} />
            </button>
            <button className="user-option-icon-btn" title="Options" onClick={(e) => e.preventDefault()}>
              <Settings size={18} />
            </button>
            <button 
              className="user-option-icon-btn logout-btn" 
              title="Log Out" 
              onClick={onLogout}
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Giant Text Box with User Details */}
          <div className="user-bio-giant-textbox">
            <div className="user-bio-content">
              <h3 className="user-display-name">{currentUser.displayName || currentUser.username}</h3>
              <p className="user-handle-sub">@{currentUser.username}</p>
              <div className="user-role-badge">Local Curator</div>
            </div>
          </div>
        </aside>

        {/* Right Side: 3 Wide Stacked Showcase Bars */}
        <main className="user-profile-right">
          {/* Top Bar: Badge Showcase */}
          <section className="showcase-bar">
            <div className="showcase-bar-header">
              <div className="showcase-header-left">
                <Award className="showcase-icon" size={16} />
                <h3 className="showcase-title">Badge Showcase</h3>
              </div>
              <span className="showcase-badge-count">1 Badge</span>
            </div>
            <div className="showcase-bar-content">
              <div className="showcase-blank-grid">
                <div className="showcase-blank-card active-badge-card">
                  <span className="blank-card-text">🏛️ Creator</span>
                </div>
                {[1, 2, 3, 4].map((idx) => (
                  <div key={`badge-slot-${idx}`} className="showcase-blank-card">
                    <span className="blank-card-text">-placeholder-</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Middle Bar: Atlas Showcase */}
          <section className="showcase-bar">
            <div className="showcase-bar-header">
              <div className="showcase-header-left">
                <Globe className="showcase-icon" size={16} />
                <h3 className="showcase-title">Atlas Showcase</h3>
              </div>
              <span className="showcase-badge-count">1 Featured</span>
            </div>
            <div className="showcase-bar-content">
              <div className="showcase-blank-grid">
                <div className="showcase-blank-card showcase-wide-card active-atlas-showcase">
                  <span className="blank-card-text">🌐 myatlas</span>
                </div>
                {[1, 2].map((idx) => (
                  <div key={`atlas-slot-${idx}`} className="showcase-blank-card showcase-wide-card">
                    <span className="blank-card-text">-placeholder-</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Bar: Post Showcase */}
          <section className="showcase-bar">
            <div className="showcase-bar-header">
              <div className="showcase-header-left">
                <ImageIcon className="showcase-icon" size={16} />
                <h3 className="showcase-title">Post Showcase</h3>
              </div>
              <span className="showcase-badge-count">0 Items</span>
            </div>
            <div className="showcase-bar-content">
              <div className="showcase-blank-grid">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={`post-slot-${idx}`} className="showcase-blank-card showcase-post-card">
                    <span className="blank-card-text">-placeholder-</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
