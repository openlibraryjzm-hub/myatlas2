import React from 'react';

/**
 * Default Sub-Atlas metadata fallback
 */
export const DEFAULT_ATLAS = {
  id: 'myatlas',
  title: 'My Atlas',
  description: 'Default main atlas archive',
  accentColor: '#CC5A01'
};

/**
 * Helper to split title for Option A logo/heading rendering:
 * - Multi-word title (e.g. "Space & Astronomy Archive"): "Space" gets highlighted in accent color, remaining words get standard heading text.
 * - Single-word title (e.g. "Military"): Entire word gets highlighted in accent color.
 *
 * @param {string} title - Display title or fallback slug
 * @param {string} accentColor - Hex color for the primary highlighted word
 * @returns {React.ReactNode}
 */
export function renderDynamicTitle(title, accentColor) {
  const cleanTitle = (title || 'My Atlas').trim();
  const words = cleanTitle.split(/\s+/);

  if (words.length === 1) {
    return (
      <span className="title-highlighted" style={{ color: accentColor || 'var(--accent-color)' }}>
        {words[0]}
      </span>
    );
  }

  const firstWord = words[0];
  const restWords = words.slice(1).join(' ');

  return (
    <>
      <span className="title-highlighted" style={{ color: accentColor || 'var(--accent-color)' }}>
        {firstWord}
      </span>
      <span className="title-rest"> {restWords}</span>
    </>
  );
}
