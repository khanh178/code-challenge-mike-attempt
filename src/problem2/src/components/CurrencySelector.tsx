import { useState, useRef, useEffect } from 'react';
import { TokenIcon } from './TokenIcon';
import type { Token } from '../types';
import styles from '../styles/CurrencySelector.module.css';

interface CurrencySelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  label: string;
  disabled?: boolean;
  excludeToken?: Token | null;
}

export function CurrencySelector({
  tokens,
  selectedToken,
  onSelect,
  label,
  disabled = false,
  excludeToken = null,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredTokens = tokens.filter((token) => {
    if (excludeToken && token.symbol === excludeToken.symbol) {
      return false;
    }
    const query = searchQuery.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(query) ||
      (token.name && token.name.toLowerCase().includes(query))
    );
  });

  const handleSelect = (token: Token) => {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <label className={styles.label}>{label}</label>
      <button
        type="button"
        className={`${styles.selector} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        {selectedToken ? (
          <>
            <TokenIcon token={selectedToken} size={24} />
            <span className={styles.tokenSymbol}>{selectedToken.symbol}</span>
          </>
        ) : (
          <span className={styles.placeholder}>Select token</span>
        )}
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>
          <div className={styles.tokenList}>
            {filteredTokens.length === 0 ? (
              <div className={styles.noResults}>No tokens found</div>
            ) : (
              filteredTokens.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  className={`${styles.tokenOption} ${
                    selectedToken?.symbol === token.symbol ? styles.selected : ''
                  }`}
                  onClick={() => handleSelect(token)}
                >
                  <TokenIcon token={token} size={32} />
                  <div className={styles.tokenInfo}>
                    <span className={styles.tokenSymbol}>{token.symbol}</span>
                    {token.name && token.symbol !== token.name && (
                      <span className={styles.tokenName}>{token.name}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

