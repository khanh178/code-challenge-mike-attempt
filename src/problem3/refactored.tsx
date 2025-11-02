import React, { useMemo } from 'react';

// Type definitions
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface BoxProps {
  [key: string]: any;
}

interface Props extends BoxProps {
  // Add specific props here if needed
}

// Moved outside component to avoid recreation on every render
const getPriority = (blockchain: Blockchain): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
      return 20;
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Optimize: Compute priority once per balance and combine filter + sort efficiently
  const sortedBalances = useMemo(() => {
    // First, add priority to each balance and filter invalid ones
    const balancesWithPriority = balances
      .map((balance: WalletBalance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter((balance) => {
        // Fix: Use balancePriority (computed as balance.priority) and correct filter logic
        return balance.priority > -99 && balance.amount > 0;
      });

    // Sort by priority (descending)
    return balancesWithPriority.sort((lhs, rhs) => {
      if (lhs.priority > rhs.priority) {
        return -1;
      } else if (rhs.priority > lhs.priority) {
        return 1;
      }
      return 0; // Fix: Return 0 for equal priorities
    });
  }, [balances]); // Fix: Removed prices from dependencies as it's not used here

  // Format balances - this will be used in rendering
  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return sortedBalances.map((balance) => ({
      ...balance,
      formatted: balance.amount.toFixed(2), // Fixed: Use proper decimal places
    }));
  }, [sortedBalances]);

  // Render rows with proper typing and unique keys
  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className="row" // Fix: Use string or proper CSS module import instead of undefined classes
        key={`${balance.currency}-${balance.blockchain}`} // Fix: Use unique key instead of index
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

// Placeholder hooks/types - these would be imported from elsewhere
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare function WalletRow(props: {
  className: string;
  key: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}): JSX.Element;

