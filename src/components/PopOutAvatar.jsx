import React from 'react';
import './PopOutAvatar.css';

const QUADRANT_CLIP_PATHS = {
  topLeft: 'polygon(-400% -400%, 50% -400%, 50% 50%, -400% 50%)',
  topRight: 'polygon(50% -400%, 500% -400%, 500% 50%, 50% 50%)',
  bottomLeft: 'polygon(-400% 50%, 50% 50%, 50% 500%, -400% 500%)',
  bottomRight: 'polygon(50% 50%, 500% 50%, 500% 500%, 50% 500%)',
};

export default function PopOutAvatar({
  size = 120,
  config = {},
  onClick,
  className = '',
  style = {},
  title = 'Pop-Out Avatar'
}) {
  const {
    imageUrl = '/bernstein-261133_1280.png',
    orbColor = '#CC5A01',
    orbBgColor = '#FDF5E6',
    strokeWidth = 4,
    showGlow = true,
    imageScale = 1.2,
    imageOffsetX = 0,
    imageOffsetY = -5,
    objectFit = 'contain',
    quadrants = { topLeft: true, topRight: true, bottomLeft: false, bottomRight: false }
  } = config;

  const [imgError, setImgError] = React.useState(false);
  const orbMarginPercent = 8; // 8% inset for orb circle

  const imageTransformStyle = {
    transform: `scale(${imageScale}) translate(${imageOffsetX}%, ${imageOffsetY}%)`,
    transformOrigin: 'center center',
    objectFit: objectFit
  };

  return (
    <div
      className={`popout-avatar-container ${onClick ? 'interactive' : ''} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...style
      }}
      onClick={onClick}
      title={title}
    >
      {/* LAYER 0: Background Orb Fill */}
      <div
        className="popout-orb-bg"
        style={{
          inset: `${orbMarginPercent}%`,
          backgroundColor: orbBgColor || '#FDF5E6'
        }}
      />

      {/* LAYER 1: Inner Clipped Image (Sits UNDER the ring stroke) */}
      <div
        className="popout-inner-clipped"
        style={{
          inset: `${orbMarginPercent}%`
        }}
      >
        {!imgError && imageUrl ? (
          <img
            src={imageUrl}
            alt="Avatar Base"
            className="popout-img-base"
            style={imageTransformStyle}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="popout-fallback-initial" style={{ color: orbColor }}>
            C
          </div>
        )}
      </div>

      {/* LAYER 2: Orb Ring Border Stroke & Glow (Sits OVER the inner image) */}
      <div
        className="popout-orb-stroke"
        style={{
          inset: `${orbMarginPercent}%`,
          borderColor: orbColor,
          borderWidth: `${Math.max(2, Math.round(strokeWidth * (size / 120)))}px`,
          boxShadow: showGlow ? `0 4px 20px ${orbColor}45, inset 0 0 15px ${orbColor}20` : 'none'
        }}
      />

      {/* LAYER 3: 4-Quadrant Pop-Out Overlays (Drawn OVER the ring border) */}
      {!imgError && imageUrl && (
        <div className="popout-overlays-wrapper">
          {Object.keys(QUADRANT_CLIP_PATHS).map((quadrantKey) => {
            const isPopOutEnabled = quadrants[quadrantKey] ?? false;
            if (!isPopOutEnabled) return null;

            return (
              <div
                key={quadrantKey}
                className="popout-quadrant-layer"
                style={{
                  clipPath: QUADRANT_CLIP_PATHS[quadrantKey]
                }}
              >
                <img
                  src={imageUrl}
                  alt={`Avatar Popout ${quadrantKey}`}
                  className="popout-img-overlay"
                  style={imageTransformStyle}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
