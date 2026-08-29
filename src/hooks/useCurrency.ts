import { useSettingsStore } from '@/store/useSettingsStore';

const symbols: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  GHS: 'GH₵',
  KES: 'KSh',
  ZAR: 'R',
};

export const getCurrencySymbol = (code: string) => symbols[code] || code;

export const formatCurrency = (amount: number, currencyCode: string) => {
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
    
    if (isNaN(numAmount) || !isFinite(numAmount)) return formatCurrency(0, currency);
    
    return formatCurrency(numAmount, currency);
  };

  return { format, currency, symbol: getCurrencySymbol(currency) };
};
