import React, { useState, useEffect } from 'react';
import { FileText, Heart, Settings, ShoppingBag, LogOut, Globe, Award, Sparkles, Users as UsersIcon, UserPlus, Bookmark, SlidersHorizontal, BookOpen, MessageSquare, UserCheck, Calendar } from 'lucide-react';
import PopOutAvatar from '../components/PopOutAvatar';
import PopOutAvatarConfigModal from '../components/PopOutAvatarConfigModal';
import { getAvatarConfig } from '../utils/avatarStorage';
import './Users.css';

export default function Users({ currentUser }) {
  const user = currentUser || { username: 'curator', displayName: 'Curator' };

  const [avatarConfig, setAvatarConfig] = useState(() => getAvatarConfig());
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  useEffect(() => {
    const handleAvatarChange = (e) => {
      if (e.detail) setAvatarConfig(e.detail);
    };
    window.addEventListener('myatlas_avatar_changed', handleAvatarChange);
    return () => window.removeEventListener('myatlas_avatar_changed', handleAvatarChange);
  }, []);

  const [activeMode, setActiveMode] = React.useState('atlases');
  const [hoveredItem, setHoveredItem] = React.useState(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [bioText, setBioText] = React.useState(
    `Welcome to my local MyAtlas archive! I am a passionate media curator, hard drive archivist, and tech enthusiast.\n\nSpecializing in high-density booru tagging, CRT video aesthetics, technical schematics, and custom Valve hardware accessories.`
  );

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    setCurrentPage(1);
    setHoveredItem(null);
  };

  const handleSlotMouseEnter = (item, e) => {
    setHoveredItem(item);
    setTooltipPos({ x: e.clientX + 14, y: e.clientY + 14 });
  };

  const handleSlotMouseMove = (e) => {
    setTooltipPos({ x: e.clientX + 14, y: e.clientY + 14 });
  };

  const handleSlotMouseLeave = () => {
    setHoveredItem(null);
  };

  // Generates 1000 rich placeholders for Atlases mode (5 full pages of 200 items each)
  const atlasesItems = React.useMemo(() => {
    const atlasNames = [
      { name: 'myatlas', icon: '🌐', desc: 'Main personal hard drive booru & media collection' },
      { name: 'amberatlas', icon: '💎', desc: 'Curated warm amber vintage photography archive' },
      { name: 'youtubeatlas', icon: '📺', desc: 'Offline video bookmarks & CRT aesthetic clips' },
      { name: 'shopatlas', icon: '🛍️', desc: 'Hardware, accessories & custom merchandise' },
      { name: 'supportatlas', icon: '🛟', desc: 'Help, documentation & community support' },
      { name: 'cyberpunk-vault', icon: '⚡', desc: 'High-tech low-life sci-fi media collection' },
      { name: 'pixel-art-hub', icon: '👾', desc: '16-bit sprite sheets & pixel landscapes' },
      { name: 'vintage-keys', icon: '🔑', desc: 'Aesthetic antique keys & lock mechanism photos' },
      { name: 'lofi-vibes', icon: '☕', desc: 'Chill beats backgrounds & rainy window scenes' },
      { name: 'blueprint-docs', icon: '📐', desc: 'Technical schematics & vector architectural plans' },
      { name: 'botany-herbarium', icon: '🌿', desc: 'Botanical illustrations & macro leaf photography' },
      { name: 'astronomy-stars', icon: '🌌', desc: 'Deep space telescope imagery & nebula renders' },
      { name: 'film-noir-shots', icon: '🎬', desc: 'High contrast monochrome street photography' },
      { name: 'synthwave-80s', icon: '🌅', desc: 'Neon grids, sunsets & 1980s aesthetic art' },
      { name: 'typography-vault', icon: '🔤', desc: 'Specimen books, font foundries & serif posters' },
      { name: 'cozy-interiors', icon: '🛋️', desc: 'Warm ambient lighting & wood aesthetics' },
      { name: 'ui-design-library', icon: '🎨', desc: 'Mobile & desktop interface component specs' },
      { name: 'arch-linux-setup', icon: '🖥️', desc: 'Dotfiles, desktop rice setups & terminal themes' },
      { name: 'vaporwave-statues', icon: '🏛️', desc: 'Marble busts, glitches & pastel gradients' },
    ];
    const pagePalettes = [
      ['#CC5A01', '#D97706', '#EAB308', '#F59E0B'], // Page 1: Warm Amber
      ['#06B6D4', '#8B5CF6', '#EC4899', '#3B82F6'], // Page 2: Cyber Neon
      ['#059669', '#10B981', '#047857', '#16A34A'], // Page 3: Emerald Herb
      ['#4338CA', '#4F46E5', '#7C3AED', '#9333EA'], // Page 4: Cosmic Violet
      ['#EF4444', '#DC2626', '#F97316', '#B45309']  // Page 5: Crimson Sunset
    ];
    const items = [];
    for (let i = 0; i < 1000; i++) {
      const pageIndex = Math.floor(i / 200);
      const palette = pagePalettes[pageIndex % pagePalettes.length];
      const base = atlasNames[i % atlasNames.length];
      items.push({
        id: `atlas-${i}`,
        name: i < atlasNames.length ? base.name : `${base.name}-v${Math.floor(i / atlasNames.length) + 1}`,
        icon: base.icon,
        color: palette[i % palette.length],
        category: `Sub-Atlas (Page ${pageIndex + 1})`,
        desc: base.desc,
        count: `${(i + 1) * 42} items`
      });
    }
    return items;
  }, []);

  // Generates 1000 rich placeholders for Badges mode
  const badgesItems = React.useMemo(() => {
    const badgeTemplates = [
      { name: 'Local Curator', icon: '🏛️', rarity: 'Legendary', desc: 'Master curator of local hard drive archives' },
      { name: 'First Scrape', icon: '🔍', rarity: 'Common', desc: 'Successfully imported initial media batch' },
      { name: 'Tag Master', icon: '🏷️', rarity: 'Rare', desc: 'Applied over 1,000 tags across local media' },
      { name: '10k Indexer', icon: '⚡', rarity: 'Epic', desc: 'Indexed 10,000+ files into SQLite database' },
      { name: 'STA Extractor', icon: '🎞️', rarity: 'Rare', desc: 'Generated STA video frame WebP thumbnails' },
      { name: 'WebP Wizard', icon: '🖼️', rarity: 'Epic', desc: 'Maintained <1ms WebP disk cache performance' },
      { name: 'SQLite Pioneer', icon: '💾', rarity: 'Legendary', desc: 'Dual-database SQLite synchronization' },
      { name: 'Night Owl', icon: '🦉', rarity: 'Common', desc: 'Active curation past 3:00 AM' },
      { name: 'Booru King', icon: '👑', rarity: 'Mythic', desc: 'Organized booru classification matrix' },
      { name: 'Metadata God', icon: '🔮', rarity: 'Mythic', desc: '100% complete tag metadata coverage' },
      { name: 'Range Streamer', icon: '📡', rarity: 'Rare', desc: 'HTTP 206 partial content video streamer' },
      { name: 'Offline Purist', icon: '🔒', rarity: 'Legendary', desc: 'Zero remote telemetry data transmission' },
      { name: 'Titan Atlas', icon: '🏋️', rarity: 'Mythic', desc: 'Carried 1TB+ media archive on local disk' },
      { name: 'Speed Tagger', icon: '⌨️', rarity: 'Epic', desc: 'Used Q/W quick tag navigation mode' },
      { name: 'Mass Deletor', icon: '🧹', rarity: 'Rare', desc: 'Pruned unused tags in Deletor Studio' },
      { name: 'Bulk Injector', icon: '💉', rarity: 'Epic', desc: 'Injected tags across 500 files at once' },
      { name: 'Folder Scanner', icon: '📁', rarity: 'Common', desc: 'Scanned local directory tree in <2 seconds' },
      { name: 'Zero Latency', icon: '🚀', rarity: 'Legendary', desc: '0ms frame 1 WebP base64 rendering' },
      { name: 'Claude Warmth', icon: '☕', rarity: 'Epic', desc: 'Adopted Lora serif & warm cream visual theme' },
      { name: 'Pixel Perfection', icon: '✨', rarity: 'Rare', desc: 'Crisp 1:1 aspect ratio avatar box layout' },
    ];
    const pagePalettes = [
      ['#CC5A01', '#EAB308', '#D97706', '#EA580C'],
      ['#9333EA', '#8B5CF6', '#7C3AED', '#6366F1'],
      ['#059669', '#10B981', '#06B6D4', '#0284C7'],
      ['#DC2626', '#EF4444', '#EC4899', '#F472B6'],
      ['#2563EB', '#3B82F6', '#1E40AF', '#4F46E5']
    ];
    const items = [];
    for (let i = 0; i < 1000; i++) {
      const pageIndex = Math.floor(i / 200);
      const palette = pagePalettes[pageIndex % pagePalettes.length];
      const base = badgeTemplates[i % badgeTemplates.length];
      items.push({
        id: `badge-${i}`,
        name: i < badgeTemplates.length ? base.name : `${base.name} Rank ${Math.floor(i / badgeTemplates.length) + 1}`,
        icon: base.icon,
        rarity: base.rarity,
        color: palette[i % palette.length],
        category: `Achievement Badge (Page ${pageIndex + 1})`,
        desc: base.desc
      });
    }
    return items;
  }, []);

  // Generates 1000 rich placeholders for Stickers mode
  const stickersItems = React.useMemo(() => {
    const stickerEmojis = [
      { name: 'Fire Flame', icon: '🔥', tag: '#hot' },
      { name: 'Sparkles', icon: '✨', tag: '#magic' },
      { name: 'Space Invader', icon: '👾', tag: '#arcade' },
      { name: 'Pizza Slice', icon: '🍕', tag: '#snack' },
      { name: 'Rocket Ship', icon: '🚀', tag: '#launch' },
      { name: 'Diamond Gem', icon: '💎', tag: '#rare' },
      { name: 'Artist Palette', icon: '🎨', tag: '#art' },
      { name: 'Hot Coffee', icon: '☕', tag: '#cozy' },
      { name: 'Lucky Clover', icon: '🍀', tag: '#luck' },
      { name: 'Ghost', icon: '👻', tag: '#spooky' },
      { name: 'Bullseye', icon: '🎯', tag: '#target' },
      { name: 'Crystal Ball', icon: '🔮', tag: '#future' },
      { name: 'Golden Key', icon: '🔑', tag: '#secret' },
      { name: 'Skull', icon: '💀', tag: '#danger' },
      { name: 'Lightning Bolt', icon: '⚡', tag: '#energy' },
      { name: 'Rainbow', icon: '🌈', tag: '#joy' },
      { name: 'Mushroom', icon: '🍄', tag: '#nature' },
      { name: 'Game Controller', icon: '🎮', tag: '#play' },
      { name: 'Crown', icon: '👑', tag: '#royalty' },
      { name: 'Heart Pulse', icon: '💖', tag: '#favorite' },
    ];
    const pagePalettes = [
      ['#EF4444', '#F97316', '#F59E0B', '#EAB308'],
      ['#8B5CF6', '#EC4899', '#F472B6', '#3B82F6'],
      ['#10B981', '#06B6D4', '#14B8A6', '#059669'],
      ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF'],
      ['#D97706', '#B45309', '#78350F', '#92400E']
    ];
    const items = [];
    for (let i = 0; i < 1000; i++) {
      const pageIndex = Math.floor(i / 200);
      const palette = pagePalettes[pageIndex % pagePalettes.length];
      const base = stickerEmojis[i % stickerEmojis.length];
      items.push({
        id: `sticker-${i}`,
        name: i < stickerEmojis.length ? base.name : `${base.name} Vol.${Math.floor(i / stickerEmojis.length) + 1}`,
        icon: base.icon,
        tag: base.tag,
        color: palette[i % palette.length],
        category: `Sticker Badge (Page ${pageIndex + 1})`,
        desc: `Collectible ${base.name} sticker badge for post overlays.`
      });
    }
    return items;
  }, []);

  // Generates 1000 rich placeholders for Followers mode
  const followersItems = React.useMemo(() => {
    const handles = [
      'alex_archivist', 'booru_enthusiast', 'pixel_hunter', 'synth_collector', 'retro_gamer',
      'tauri_dev', 'dotnet_whisperer', 'sqlite_ninja', 'sharp_eye', 'design_lover',
      'tagger_pro', 'media_hoarder', 'offline_warrior', 'claude_fan', 'vintage_keys',
      'lofi_beats', 'cyber_monk', 'vector_artist', 'macro_botanist', 'astro_scout'
    ];
    const pagePalettes = [
      ['#CC5A01', '#2563EB', '#059669', '#7C3AED', '#D97706', '#EC4899'],
      ['#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'],
      ['#10B981', '#14B8A6', '#047857', '#15803D', '#65A30D', '#CA8A04'],
      ['#9333EA', '#C084FC', '#E879F9', '#F472B6', '#FB7185', '#FDA4AF'],
      ['#EA580C', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#10B981']
    ];
    const items = [];
    for (let i = 0; i < 1000; i++) {
      const pageIndex = Math.floor(i / 200);
      const palette = pagePalettes[pageIndex % pagePalettes.length];
      const handle = handles[i % handles.length] + (i >= handles.length ? `_${i}` : '');
      const initial = handle.charAt(0).toUpperCase();
      items.push({
        id: `follower-${i}`,
        name: `@${handle}`,
        initial: initial,
        category: `Follower (Page ${pageIndex + 1})`,
        status: i % 2 === 0 ? 'Active Curator' : 'Local User',
        desc: `Curator follower #${i + 1} syncing local atlas metadata.`,
        color: palette[i % palette.length]
      });
    }
    return items;
  }, []);

  // Generates 1000 rich placeholders for Following mode
  const followingItems = React.useMemo(() => {
    const handles = [
      'atlas_official', 'archive_org_fan', 'booru_matrix', 'tag_repository', 'media_vault',
      'webp_team', 'tauri_apps', 'react_core', 'vite_js', 'lucide_icons',
      'dotnet_webapi', 'sqlite_official', 'deepmind_lab', 'anthropic_ai', 'steven_grs',
      'curator_guild', 'image_sharp', 'minimal_ui', 'serif_typography', 'booru_index'
    ];
    const pagePalettes = [
      ['#0284C7', '#059669', '#CC5A01', '#9333EA', '#DC2626', '#EAB308'],
      ['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#0891B2'],
      ['#0D9488', '#059669', '#65A30D', '#CA8A04', '#D97706', '#DC2626'],
      ['#4F46E5', '#9333EA', '#C084FC', '#F472B6', '#38BDF8', '#34D399'],
      ['#E11D48', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#6366F1']
    ];
    const items = [];
    for (let i = 0; i < 1000; i++) {
      const pageIndex = Math.floor(i / 200);
      const palette = pagePalettes[pageIndex % pagePalettes.length];
      const handle = handles[i % handles.length] + (i >= handles.length ? `_${i}` : '');
      const initial = handle.charAt(0).toUpperCase();
      items.push({
        id: `following-${i}`,
        name: `@${handle}`,
        initial: initial,
        category: `Following (Page ${pageIndex + 1})`,
        status: 'Verified Atlas',
        desc: `Following curator channel #${i + 1} for open atlas indexes.`,
        color: palette[i % palette.length]
      });
    }
    return items;
  }, []);

  // Generates 1000 rich placeholders for Forums mode
  const forumsItems = React.useMemo(() => {
    const threadTemplates = [
      { name: 'Booru Classification Matrix', icon: '💬', desc: 'Discussion on tagging taxonomy and namespace conventions.' },
      { name: 'STA Video Extractor Specs', icon: '🎞️', desc: 'Windows Shell P/Invoke STA thread frame caching benchmarks.' },
      { name: 'Gelbooru Sync & Import', icon: '📡', desc: 'Strategies for zero-latency JSON metadata scraping.' },
      { name: 'CRT Shader & Aesthetic Rices', icon: '📺', desc: 'Custom CSS themes, Lora typography & amber accents.' },
      { name: 'SQLite Storage Optimizations', icon: '💾', desc: 'WAL mode, indexed tag queries, and dual db syncing.' },
      { name: 'WebP Thumbnail Disk Cache', icon: '🖼️', desc: 'Sub-millisecond 300px WebP image proxy throughput.' },
      { name: 'Valve Hardware Accessories', icon: '⚙️', desc: 'Custom 3D printed additions and hardware mods.' },
      { name: 'Offline Booru Purism', icon: '🔒', desc: 'Zero remote telemetry data transmission guidelines.' },
      { name: 'Tauri v2 Desktop Container', icon: '🚀', desc: 'Native Rust Tauri app bindings and IPC commands.' },
      { name: 'Dotnet Minimal WebAPI Engine', icon: '⚡', desc: 'C# backend micro-server performance at port 7171.' },
    ];
    const pagePalettes = [
      ['#CC5A01', '#EAB308', '#D97706', '#EA580C'],
      ['#0284C7', '#3B82F6', '#2563EB', '#1D4ED8'],
      ['#059669', '#10B981', '#047857', '#15803D'],
      ['#9333EA', '#8B5CF6', '#7C3AED', '#6D28D9'],
      ['#DC2626', '#EF4444', '#B91C1C', '#991B1B']
    ];
    const items = [];
    for (let i = 0; i < 1000; i++) {
      const pageIndex = Math.floor(i / 200);
      const palette = pagePalettes[pageIndex % pagePalettes.length];
      const base = threadTemplates[i % threadTemplates.length];
      items.push({
        id: `forum-${i}`,
        name: i < threadTemplates.length ? base.name : `${base.name} Thread #${Math.floor(i / threadTemplates.length) + 1}`,
        icon: base.icon,
        color: palette[i % palette.length],
        category: `Forum Thread (Page ${pageIndex + 1})`,
        desc: base.desc,
        count: `${(i + 1) * 12 + 5} replies`
      });
    }
    return items;
  }, []);

  // Generates 1000 rich placeholders for Oomfs mode (Mutual Followers)
  const oomfsItems = React.useMemo(() => {
    const handles = [
      'mutual_archivist', 'synth_friend', 'booru_pal', 'pixel_buddy', 'retro_companion',
      'tauri_ally', 'dotnet_peer', 'sqlite_mate', 'sharp_partner', 'design_sidekick',
      'tagger_cohort', 'media_comrade', 'offline_fellow', 'claude_friend', 'vintage_ally',
      'lofi_pal', 'cyber_chum', 'vector_buddy', 'macro_peer', 'astro_mate'
    ];
    const pagePalettes = [
      ['#CC5A01', '#059669', '#2563EB', '#7C3AED', '#D97706', '#EC4899'],
      ['#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E'],
      ['#10B981', '#14B8A6', '#047857', '#15803D', '#65A30D', '#CA8A04'],
      ['#9333EA', '#C084FC', '#E879F9', '#F472B6', '#FB7185', '#FDA4AF'],
      ['#EA580C', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#10B981']
    ];
    const items = [];
    for (let i = 0; i < 1000; i++) {
      const pageIndex = Math.floor(i / 200);
      const palette = pagePalettes[pageIndex % pagePalettes.length];
      const handle = handles[i % handles.length] + (i >= handles.length ? `_${i}` : '');
      const initial = handle.charAt(0).toUpperCase();
      items.push({
        id: `oomf-${i}`,
        name: `@${handle}`,
        initial: initial,
        category: `Mutual Oomf (Page ${pageIndex + 1})`,
        status: 'Mutual Follower 🤝',
        desc: `Mutual curator oomf #${i + 1} sharing booru indexes.`,
        color: palette[i % palette.length]
      });
    }
    return items;
  }, []);

  const getModeDetails = () => {
    switch (activeMode) {
      case 'atlases':
        return { title: 'Atlases', count: atlasesItems.length, items: atlasesItems };
      case 'about':
        return { title: 'About Me', count: 0, items: [] };
      case 'forums':
        return { title: 'Forum Threads', count: forumsItems.length, items: forumsItems };
      case 'badges':
        return { title: 'Badges', count: badgesItems.length, items: badgesItems };
      case 'stickers':
        return { title: 'Stickers', count: stickersItems.length, items: stickersItems };
      case 'oomfs':
        return { title: 'Oomfs', count: oomfsItems.length, items: oomfsItems };
      case 'followers':
        return { title: 'Followers', count: followersItems.length, items: followersItems };
      case 'following':
        return { title: 'Following', count: followingItems.length, items: followingItems };
      default:
        return { title: 'Atlases', count: atlasesItems.length, items: atlasesItems };
    }
  };

  const currentModeDetails = getModeDetails();
  const itemsPerPage = 200;
  const totalPages = Math.ceil(currentModeDetails.items.length / itemsPerPage) || 1;
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedItems = currentModeDetails.items.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        {/* Left Side: 2.5D Orb Showcase Card Centered */}
        <aside className="user-profile-left">
          {/* Minimalist 2.5D Orb Showcase Card */}
          <div className="orb-showcase-card">
            <div className="orb-avatar-stage" onClick={() => setIsConfigModalOpen(true)}>
              <PopOutAvatar
                size={160}
                config={avatarConfig}
                className="user-orb-avatar"
                title="Click to configure avatar & pop-out settings"
              />
            </div>

            <div className="orb-user-identity">
              <h3 className="orb-display-name">{currentUser?.displayName || 'Curator'}</h3>
              <span className="orb-user-handle">@{currentUser?.username || 'curator'}</span>
            </div>

            <button
              type="button"
              className="configure-avatar-btn"
              onClick={() => setIsConfigModalOpen(true)}
            >
              <Sparkles size={14} /> Configure Avatar
            </button>
          </div>
        </aside>

        {/* Right Side: JEI / NEI Style High-Density Item Grid + 5-Segment Single-Row Mode Switcher */}
        <main className="user-profile-right">
          <div className="jei-card-container">
            {/* Mode Switcher: 5 Icon-Only Tabs in 1 Row with Centered Line Divider Count */}
            <div className="jei-mode-switcher-bar">
              {[
                { id: 'atlases', label: 'Atlases', icon: <Globe size={26} className="tab-icon-svg" />, countLabel: 'ATLAS' },
                { id: 'forums', label: 'Forums', icon: <MessageSquare size={26} className="tab-icon-svg" />, countLabel: 'FORUMS' },
                { id: 'badges', label: 'Badges', icon: <Award size={26} className="tab-icon-svg" />, countLabel: 'BADGES' },
                { id: 'stickers', label: 'Stickers', icon: <Sparkles size={26} className="tab-icon-svg" />, countLabel: 'LINKS' },
                { id: 'followers', label: 'Friends & Network', icon: <UsersIcon size={26} className="tab-icon-svg" />, countLabel: 'FRIENDS' }
              ].map((mode) => (
                <button 
                  key={mode.id}
                  className={`jei-mode-segment ${activeMode === mode.id ? 'active' : ''}`}
                  onClick={() => handleModeChange(mode.id)}
                  title={mode.label}
                >
                  <span className="segment-icon-wrapper">{mode.icon}</span>
                  <div className="tab-divider-line">
                    <span className="line-fill left"></span>
                    <span className="segment-count-badge">{mode.countLabel}</span>
                    <span className="line-fill right"></span>
                  </div>
                </button>
              ))}
            </div>

            {/* High Density JEI / NEI Item Grid */}
            <div className="jei-grid-viewport">
              <div className="jei-item-grid">
                {paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="jei-slot"
                    style={{ '--slot-accent': item.color }}
                    onMouseEnter={(e) => handleSlotMouseEnter(item, e)}
                    onMouseMove={(e) => handleSlotMouseMove(e)}
                    onMouseLeave={handleSlotMouseLeave}
                  >
                    <div className="jei-slot-inner">
                      {item.icon ? (
                        <span className="jei-slot-icon">{item.icon}</span>
                      ) : (
                        <span className="jei-slot-initial" style={{ color: item.color }}>
                          {item.initial}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Footer */}
            <div className="jei-grid-footer">
              <div className="jei-footer-info">
                Showing <strong>{startIdx + 1}–{Math.min(startIdx + itemsPerPage, currentModeDetails.items.length)}</strong> of <strong>{currentModeDetails.items.length}</strong> {currentModeDetails.title}
              </div>
              <div className="jei-pagination-controls">
                <button 
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  ◄ Prev
                </button>
                <span className="pagination-page-indicator">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button 
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next ►
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Minecraft JEI Style Rich Tooltip */}
      {hoveredItem && (
        <div 
          className="jei-hover-tooltip"
          style={{
            left: `${Math.min(tooltipPos.x, window.innerWidth - 260)}px`,
            top: `${Math.min(tooltipPos.y, window.innerHeight - 160)}px`
          }}
        >
          <div className="tooltip-header">
            <span 
              className="tooltip-icon-badge"
              style={{ backgroundColor: `${hoveredItem.color}18`, color: hoveredItem.color, borderColor: `${hoveredItem.color}35` }}
            >
              {hoveredItem.icon || hoveredItem.initial}
            </span>
            <div className="tooltip-title-group">
              <h4 className="tooltip-item-name">{hoveredItem.name}</h4>
              <span 
                className="tooltip-category-pill"
                style={{ color: hoveredItem.color, borderColor: `${hoveredItem.color}40`, backgroundColor: `${hoveredItem.color}15` }}
              >
                {hoveredItem.rarity || hoveredItem.category}
              </span>
            </div>
          </div>
          {hoveredItem.desc && <p className="tooltip-desc">{hoveredItem.desc}</p>}
          {hoveredItem.count && <div className="tooltip-meta">Stats: <strong>{hoveredItem.count}</strong></div>}
        </div>
      )}

      {/* 2.5D Pop-Out Avatar Configurator Modal */}
      <PopOutAvatarConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSaved={(newCfg) => setAvatarConfig(newCfg)}
      />
    </div>
  );
}
