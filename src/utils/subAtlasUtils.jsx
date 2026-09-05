import React from 'react';

/**
 * Built-in Sub-Atlas definitions
 */
export const BUILTIN_ATLASES = [
  {
    id: 'myatlas',
    title: 'my atlas',
    description: 'Default personal editable archive',
    accentColor: '#CC5A01'
  },
  {
    id: 'amberatlas',
    title: 'amber atlas',
    description: 'Amber visual booru archive',
    accentColor: '#D97706'
  },
  {
    id: 'youtubeatlas',
    title: 'youtube atlas',
    description: 'Curated YouTube video collection',
    accentColor: '#EF4444'
  },
  {
    id: 'wikiatlas',
    title: 'wiki atlas',
    description: 'Wiki document archive',
    accentColor: '#4F46E5'
  },
  {
    id: 'gamesatlas',
    title: 'games atlas',
    description: 'Games & interactive media archive',
    accentColor: '#2563EB'
  },
  {
    id: 'toolsatlas',
    title: 'tools atlas',
    description: 'Tools & web software directory',
    accentColor: '#16A34A'
  }
];

export const DEFAULT_ATLAS = BUILTIN_ATLASES[0];

/**
 * Helper to split title for Option A logo/heading rendering:
 * - "my atlas": "my" highlighted in orange/accent color, "atlas" in black.
 * - Multi-word title (e.g. "youtube atlas"): First word in accent color, remaining words in dark heading text.
 *
 * @param {string} title - Display title or fallback slug
 * @param {string} accentColor - Hex color for the primary highlighted word
 * @returns {React.ReactNode}
 */
export function renderDynamicTitle(title, accentColor) {
  const cleanTitle = (title || 'my atlas').trim();
  const lowerTitle = cleanTitle.toLowerCase();

  if (lowerTitle === 'my atlas' || lowerTitle === 'myatlas') {
    return (
      <>
        <span className="title-highlighted" style={{ color: accentColor || 'var(--accent-color)' }}>
          my
        </span>
        <span className="title-rest">atlas</span>
      </>
    );
  }

  const words = cleanTitle.split(/\s+/);

  if (words.length === 1) {
    return (
      <span className="title-highlighted" style={{ color: accentColor || 'var(--accent-color)' }}>
        {words[0].toLowerCase()}
      </span>
    );
  }

  const firstWord = words[0].toLowerCase();
  const restWords = words.slice(1).join(' ').toLowerCase();

  return (
    <>
      <span className="title-highlighted" style={{ color: accentColor || 'var(--accent-color)' }}>
        {firstWord}
      </span>
      <span className="title-rest">{restWords}</span>
    </>
  );
}
