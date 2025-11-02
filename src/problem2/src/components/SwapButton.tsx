import styles from '../styles/SwapButton.module.css';

interface SwapButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SwapButton({ onClick, disabled = false, isLoading = false }: SwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${styles.swapButton} ${isLoading ? styles.loading : ''}`}
    >
      {isLoading ? (
        <>
          <span className={styles.spinner}></span>
          <span>Processing...</span>
        </>
      ) : (
        'CONFIRM SWAP'
      )}
    </button>
  );
}

