import { useSettingsStore } from '@/store/useSettingsStore';

const NGN = 'NGN';
const symbols: Record<string, string> = {
  NGN: '₦',
};

export const getCurrencySymbol = (code: string) => symbols[code] || '₦';

export const formatCurrency = (amount: number, currencyCode: string) => {
  const symbol = symbols[currencyCode] || '₦';
  const formattedNumber = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formattedNumber}`;
};

export const useCurrency = () => {
  // Currency is locked to Naira across the whole application.
  void useSettingsStore((state) => state.currency);

  const format = (amount: number | string) => {
    const numAmount = typeof amount === 'string' 
      ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) 
      : amount;
    
    if (isNaN(numAmount) || !isFinite(numAmount)) return formatCurrency(0, NGN);
    
    return formatCurrency(numAmount, NGN);
  };

  return { format, currency: NGN, symbol: '₦' };
};
