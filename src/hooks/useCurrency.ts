import { useSettingsStore } from '@/store/useSettingsStore';

export const formatCurrency = (amount: number, currencyCode: string) => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
  };

  const symbol = symbols[currencyCode] || currencyCode;
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formattedNumber}`;
};

export const useCurrency = () => {
  const currency = useSettingsStore((state) => state.currency);

  const format = (amount: number | string) => {
    const numAmount = typeof amount === 'string' 
      ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) 
      : amount;
    
    if (isNaN(numAmount)) return amount.toString();
    
    return formatCurrency(numAmount, currency);
  };

  return { format, currency };
};
