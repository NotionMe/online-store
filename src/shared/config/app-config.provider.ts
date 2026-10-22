export const STORE_CONFIG = 'STORE_CONFIG';

export interface StoreConfig {
  storeName: string;
  defaultCurrency: string;
  taxPercent: number;
}

export const storeConfig: StoreConfig = {
  storeName: 'Online Store',
  defaultCurrency: 'UAH',
  taxPercent: 20,
};

export const FEE_CALCULATOR = 'FEE_CALCULATOR';

export interface FeeCalculator {
  calculateTax(amount: number): number;
}
