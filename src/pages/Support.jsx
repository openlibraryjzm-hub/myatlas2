import React, { useState, useRef } from 'react';
import { 
  Heart, 
  Coffee, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ExternalLink,
  Code
} from 'lucide-react';
import './Support.css';

function DiscordIcon({ size = 38, color = "#FFFFFF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.009c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.893a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function YoutubeIcon({ size = 38, color = "#FFFFFF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function TwitterXIcon({ size = 36, color = "#FFFFFF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function GithubIcon({ size = 38, color = "#FFFFFF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

const COMMUNITY_LINKS = [
  {
    id: 'youtube',
    title: 'YouTube Channel',
    category: 'Video Content',
    description: 'Watch video tutorials, feature showcases, and offline indexing dev logs.',
    url: 'https://youtube.com',
    accent: '#FF0000',
    icon: (
      <img 
        src="/brain-topics.jpg" 
        alt="YouTube Channel Avatar" 
        className="youtube-avatar-img" 
      />
    )
  },
  {
    id: 'discord',
    title: 'Discord Community',
    category: 'Community',
    description: 'Join fellow media archivist curators, ask questions, and share custom booru setups.',
    url: 'https://discord.gg',
    accent: '#5865F2',
    icon: (
      <img 
        src="/vlcsnap-2026-09-12-11h50m30s905.png" 
        alt="Discord Avatar" 
        className="discord-avatar-img" 
      />
    )
  },
  {
    id: 'twitter',
    title: 'Twitter / X',
    category: 'Updates',
    description: 'Follow release announcements, patch notes, and behind-the-scenes previews.',
    url: 'https://x.com',
    accent: '#1DA1F2',
    icon: (
      <img 
        src="/Screenshot_20260902_174819_Gallery.jpg" 
        alt="Twitter/X Avatar" 
        className="twitter-avatar-img" 
      />
    )
  }
];

const DONATION_LINKS = [
  {
    id: 'patreon',
    title: 'Patreon Supporter',
    category: 'Monthly Membership',
    description: 'Support ongoing development, get early access builds, and custom curator badges.',
    url: 'https://patreon.com',
    accent: '#FF424D',
    icon: <Heart size={36} color="#FFFFFF" />
  },
  {
    id: 'buymeacoffee',
    title: 'Buy Me a Coffee',
    category: 'One-Time Donation',
    description: 'Send a quick one-time coffee donation to keep offline MyAtlas tools thriving.',
    url: 'https://buymeacoffee.com',
    accent: '#D97706',
    icon: <Coffee size={36} color="#FFFFFF" />
  }
];

const CODE_LINKS = [
  {
    id: 'github',
    title: 'GitHub Profile & Repository',
    category: 'Source Code',
    description: 'Fork the repository, inspect C# sidecar algorithms, or contribute feature pull requests.',
    url: 'https://github.com',
    accent: '#111827',
    icon: <GithubIcon size={38} color="#FFFFFF" />
  }
];

export default function Support({ setView }) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="support-page-container">
      <div className="support-split-layout">
        {/* Left Column: Community Links, Quick Dono & Steal the Code Stacks */}
        <div className="support-left-col">
          {/* 1. Social & Community Links */}
          <div className="support-section">
            <h2 className="support-section-label">Join the Community</h2>
            <div className="support-links-stack">
              {COMMUNITY_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link-card"
                  style={{ '--link-accent': link.accent }}
                >
                  <div className="support-link-icon-box" style={{ backgroundColor: link.accent }}>
                    {link.icon}
                  </div>
                  <div className="support-link-content">
                    <div className="support-link-header">
                      <h3 className="support-link-title">{link.title}</h3>
                      <ExternalLink size={14} className="support-ext-icon" />
                    </div>
                    <p className="support-link-desc">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 2. Quick Dono Stack */}
          <div className="support-section">
            <h2 className="support-section-label">Support Development</h2>
            <div className="support-links-stack">
              {DONATION_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link-card"
                  style={{ '--link-accent': link.accent }}
                >
                  <div className="support-link-icon-box" style={{ backgroundColor: link.accent }}>
                    {link.icon}
                  </div>
                  <div className="support-link-content">
                    <div className="support-link-header">
                      <h3 className="support-link-title">{link.title}</h3>
                      <ExternalLink size={14} className="support-ext-icon" />
                    </div>
                    <p className="support-link-desc">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 3. Steal the Code Stack */}
          <div className="support-section">
            <h2 className="support-section-label">Steal the Code</h2>
            <div className="support-links-stack">
              {CODE_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link-card"
                  style={{ '--link-accent': link.accent }}
                >
                  <div className="support-link-icon-box" style={{ backgroundColor: link.accent }}>
                    {link.icon}
                  </div>
                  <div className="support-link-content">
                    <div className="support-link-header">
                      <h3 className="support-link-title">{link.title}</h3>
                      <ExternalLink size={14} className="support-ext-icon" />
                    </div>
                    <p className="support-link-desc">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Meet Amberlyn! Portrait Video Player */}
        <div className="support-right-col">
          <div className="amberlyn-card">
            <div className="amberlyn-header">
              <div className="amberlyn-title-row">
                <Sparkles size={18} className="amberlyn-sparkle" />
                <h2 className="amberlyn-title">Meet Amberlyn!</h2>
              </div>
              <span className="amberlyn-subtitle">Official MyAtlas Spokesperson</span>
            </div>

            <div className="amberlyn-video-wrapper">
              <video
                ref={videoRef}
                src="/grok-video-fd9de787-7c19-4bb6-8c15-8cb10d0817e8.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="amberlyn-video-element"
              />

              {/* Audio Control Overlay */}
              <button 
                className="amberlyn-audio-btn" 
                onClick={toggleAudio}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{isMuted ? 'Unmute' : 'Muted'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
