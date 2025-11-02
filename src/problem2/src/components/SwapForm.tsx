import { useState, useEffect, useCallback } from 'react';
import { CurrencySelector } from './CurrencySelector';
import { AmountInput } from './AmountInput';
import { SwapButton } from './SwapButton';
import { TokenIcon } from './TokenIcon';
import { fetchPrices, getTokensWithPrices, calculateExchangeRate, formatExchangeRate } from '../services/priceService';
import type { Token, PriceData } from '../types';
import styles from '../styles/SwapForm.module.css';

type FocusedInput = 'from' | 'to' | null;

export function SwapForm() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState<PriceData>({});
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(0);

  useEffect(() => {
    async function loadPrices() {
      try {
        setIsLoadingPrices(true);
        setError(null);
        const priceData = await fetchPrices();
        setPrices(priceData);
        const tokensWithPrices = getTokensWithPrices(priceData);
        setTokens(tokensWithPrices);
        
        if (tokensWithPrices.length >= 2) {
          setFromToken(tokensWithPrices[0]);
          setToToken(tokensWithPrices[1]);
        }
      } catch (err) {
        setError('Failed to load token prices. Please refresh the page.');
        console.error('Error loading prices:', err);
      } finally {
        setIsLoadingPrices(false);
      }
    }

    loadPrices();
  }, []);

  useEffect(() => {
    if (fromToken && toToken) {
      const rate = calculateExchangeRate(fromToken, toToken, prices);
      setExchangeRate(rate);
    } else {
      setExchangeRate(0);
    }
  }, [fromToken, toToken, prices]);

  useEffect(() => {
    if (!fromToken || !toToken || exchangeRate === 0) {
      if (focusedInput !== 'from') {
        setToAmount('');
      }
      return;
    }

    if (focusedInput === 'from' && fromAmount) {
      const amount = parseFloat(fromAmount);
      if (!isNaN(amount) && amount > 0) {
        const calculatedAmount = amount * exchangeRate;
        setToAmount(calculatedAmount.toFixed(8).replace(/\.?0+$/, ''));
      } else {
        setToAmount('');
      }
    } else if (focusedInput === 'to' && toAmount) {
      const amount = parseFloat(toAmount);
      if (!isNaN(amount) && amount > 0) {
        const calculatedAmount = amount / exchangeRate;
        setFromAmount(calculatedAmount.toFixed(8).replace(/\.?0+$/, ''));
      } else {
        setFromAmount('');
      }
    }
  }, [fromAmount, toAmount, exchangeRate, focusedInput, fromToken, toToken]);

  const handleSwapTokens = useCallback(() => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  }, [fromToken, toToken, fromAmount, toAmount]);

  const validateForm = useCallback((): string | null => {
    if (!fromToken || !toToken) {
      return 'Please select both currencies';
    }
    if (fromToken.symbol === toToken.symbol) {
      return 'Please select different currencies';
    }
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return 'Please enter a valid amount to send';
    }
    if (exchangeRate === 0) {
      return 'Unable to calculate exchange rate';
    }
    return null;
  }, [fromToken, toToken, fromAmount, exchangeRate]);

  const handleSubmit = useCallback(async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      alert(`Successfully swapped ${fromAmount} ${fromToken?.symbol} for ${toAmount} ${toToken?.symbol}`);
      setFromAmount('');
      setToAmount('');
    } catch (err) {
      setError('Swap failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [fromAmount, toAmount, fromToken, toToken, validateForm]);

  const isFormValid = !validateForm();
  const formattedRate = exchangeRate > 0 ? formatExchangeRate(exchangeRate) : '0';

  if (isLoadingPrices) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading token prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1 className={styles.title}>Swap</h1>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.currencySection}>
          <CurrencySelector
            tokens={tokens}
            selectedToken={fromToken}
            onSelect={setFromToken}
            label="From"
            excludeToken={toToken}
          />
          <AmountInput
            label="Amount to send"
            value={fromAmount}
            onChange={setFromAmount}
            onFocus={() => setFocusedInput('from')}
            error={focusedInput === 'from' && !fromAmount ? null : null}
            placeholder="0.00"
          />
        </div>

        <div className={styles.swapButtonContainer}>
          <button
            type="button"
            className={styles.swapIconButton}
            onClick={handleSwapTokens}
            disabled={!fromToken || !toToken}
            aria-label="Swap currencies"
          >
            ⇅
          </button>
        </div>

        <div className={styles.currencySection}>
          <CurrencySelector
            tokens={tokens}
            selectedToken={toToken}
            onSelect={setToToken}
            label="To"
            excludeToken={fromToken}
          />
          <AmountInput
            label="Amount to receive"
            value={toAmount}
            onChange={setToAmount}
            onFocus={() => setFocusedInput('to')}
            placeholder="0.00"
          />
        </div>

        {exchangeRate > 0 && fromToken && toToken && (
          <div className={styles.rateInfo}>
            <span>1 {fromToken.symbol} = {formattedRate} {toToken.symbol}</span>
          </div>
        )}

        <SwapButton
          onClick={handleSubmit}
          disabled={!isFormValid}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}

