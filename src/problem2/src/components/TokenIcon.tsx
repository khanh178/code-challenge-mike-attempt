import { useState } from 'react';
import { getTokenIconUrl, getFallbackIconUrl } from '../services/tokenIconService';
import type { Token } from '../types';
import styles from '../styles/TokenIcon.module.css';

interface TokenIconProps {
  token: Token | null;
  size?: number;
  className?: string;
}

export function TokenIcon({ token, size = 24, className = '' }: TokenIconProps) {
  const [iconError, setIconError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!token) {
    return (
      <div
        className={`${styles.icon} ${styles.placeholder} ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const iconUrl = iconError ? getFallbackIconUrl() : getTokenIconUrl(token);

  return (
    <div className={`${styles.icon} ${className}`} style={{ width: size, height: size }}>
      <img
        src={iconUrl}
        alt={token.symbol}
        style={{ width: size, height: size }}
        onError={() => setIconError(true)}
        onLoad={() => setImageLoaded(true)}
        className={imageLoaded ? styles.loaded : styles.loading}
      />
    </div>
  );
}

