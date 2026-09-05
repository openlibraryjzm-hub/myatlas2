import React from 'react';

/**
 * Default Sub-Atlas metadata fallback
 */
export const DEFAULT_ATLAS = {
  id: 'myatlas',
  title: 'my atlas',
  description: 'Default main atlas archive',
  accentColor: '#CC5A01'
};

/**
 * Helper to split title for Option A logo/heading rendering:
 * - "my atlas": "my" highlighted in orange/accent color, "atlas" in black, closely spaced in lowercase.
 * - Multi-word title: First word in accent color, remaining words in dark heading text.
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
