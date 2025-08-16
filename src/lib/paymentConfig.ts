/* eslint-disable @typescript-eslint/no-explicit-any */

// src/lib/paymentConfig.ts

// Payment configuration and constants
export const PAYMENT_CONSTANTS = {
  MIN_PAYMENT_AMOUNT: 1, // Minimum ADA payment
  MAX_PAYMENT_AMOUNT: 1000, // Maximum ADA payment
  METADATA_LABEL: 8434, // Metadata label for payment transactions
  TOKEN_RATE: 1, // 1 ADA = 1 token
  PLATFORM_FEE_PERCENTAGE: 0, // No additional fees
} as const;

// Platform wallet addresses by network
// These can be overridden by environment variables if needed
export const PLATFORM_ADDRESSES = {
  Preview: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS_PREVIEW || 'addr_test1wqg448fq8u4ry04dtf3jsxqhw0avejz887ze5x0mtgpgw9gzzhue3',
  Preprod: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS_PREPROD || 'addr_test1wqg448fq8u4ry04dtf3jsxqhw0avejz887ze5x0mtgpgw9gzzhue3',
  Mainnet: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS_MAINNET || 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn493x5cdqw2gq4vt'
} as const;

// Network types
export type NetworkType = 'Preview' | 'Preprod' | 'Mainnet';

// Network configuration with network ID mapping
export const NETWORK_CONFIG = {
  Preview: {
    name: 'Preview Testnet',
    networkId: 0,
    blockfrostUrl: 'https://cardano-preview.blockfrost.io/api/v0'
  },
  Preprod: {
    name: 'Preprod Testnet', 
    networkId: 0,
    blockfrostUrl: 'https://cardano-preprod.blockfrost.io/api/v0'
  },
  Mainnet: {
    name: 'Mainnet',
    networkId: 1,
    blockfrostUrl: 'https://cardano-mainnet.blockfrost.io/api/v0'
  }
} as const;

/**
 * Get network type from network ID
 * Network ID 1 = Mainnet, 0 = Testnet (Preview/Preprod)
 */
export const getNetworkTypeFromId = (networkId: number): NetworkType => {
  if (networkId === 1) {
    return 'Mainnet';
  }
  // Default to Preview for testnet, but this could be made configurable
  // In a production app, you might want to detect the specific testnet
  return 'Preview';
};

/**
 * Get network info from network ID
 */
export const getNetworkInfoFromId = (networkId: number): {
  type: NetworkType;
  name: string;
  isMainnet: boolean;
  blockfrostUrl: string;
} => {
  const networkType = getNetworkTypeFromId(networkId);
  const config = NETWORK_CONFIG[networkType];
  
  return {
    type: networkType,
    name: config.name,
    isMainnet: networkId === 1,
    blockfrostUrl: config.blockfrostUrl
  };
};

// Payment validation functions
export const paymentValidation = {
  /**
   * Validate payment amount
   */
  isValidAmount: (amount: number): boolean => {
    return amount >= PAYMENT_CONSTANTS.MIN_PAYMENT_AMOUNT && 
           amount <= PAYMENT_CONSTANTS.MAX_PAYMENT_AMOUNT &&
           Number.isFinite(amount) && 
           amount > 0;
  },

  /**
   * Validate Cardano address format
   */
  isValidAddress: (address: string): boolean => {
    // Basic validation for Cardano addresses
    // Mainnet addresses start with 'addr1', testnet with 'addr_test1'
    return address.startsWith('addr_test1') || address.startsWith('addr1');
  },

  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Calculate token amount from ADA payment
   */
  calculateTokens: (adaAmount: number): number => {
    return Math.floor(adaAmount * PAYMENT_CONSTANTS.TOKEN_RATE);
  },

  /**
   * Calculate total cost including fees
   */
  calculateTotalCost: (baseAmount: number): number => {
    const fee = baseAmount * (PAYMENT_CONSTANTS.PLATFORM_FEE_PERCENTAGE / 100);
    return baseAmount + fee;
  },

  /**
   * Validate network compatibility
   * Accepts network ID directly instead of NetworkType
   */
  isValidNetwork: (networkId: number, expectedNetworkId: number): boolean => {
    return networkId === expectedNetworkId;
  },

  /**
   * Check if network is mainnet
   */
  isMainnet: (networkId: number): boolean => {
    return networkId === 1;
  },

  /**
   * Get network name from network ID
   */
  getNetworkName: (networkId: number): string => {
    const networkInfo = getNetworkInfoFromId(networkId);
    return networkInfo.name;
  }
};

// Transaction metadata helpers
export const transactionMetadata = {
  /**
   * Create payment metadata for NoTamperData transactions
   */
  createPaymentMetadata: (
    amount: number, 
    email?: string,
    networkId?: number,
    customData?: Record<string, any>
  ): Record<string, any> => {
    return {
      [PAYMENT_CONSTANTS.METADATA_LABEL]: {
        purpose: 'NoTamperData API Token Purchase',
        amount: amount,
        tokens: paymentValidation.calculateTokens(amount),
        timestamp: Date.now(),
        version: '1.0',
        ...(networkId !== undefined && { networkId }),
        ...(email && { email }),
        ...customData
      }
    };
  },

  /**
   * Parse payment metadata from transaction
   */
  parsePaymentMetadata: (metadata: any): {
    purpose?: string;
    amount?: number;
    tokens?: number;
    timestamp?: number;
    email?: string;
    networkId?: number;
  } | null => {
    try {
      const paymentData = metadata?.[PAYMENT_CONSTANTS.METADATA_LABEL];
      if (!paymentData) return null;

      return {
        purpose: paymentData.purpose,
        amount: paymentData.amount,
        tokens: paymentData.tokens,
        timestamp: paymentData.timestamp,
        email: paymentData.email,
        networkId: paymentData.networkId
      };
    } catch (error) {
      console.warn('Failed to parse payment metadata:', error);
      return null;
    }
  }
};

// Utility functions
export const paymentUtils = {
  /**
   * Convert ADA to Lovelace
   */
  adaToLovelace: (ada: number): bigint => {
    return BigInt(Math.floor(ada * 1_000_000));
  },

  /**
   * Convert Lovelace to ADA
   */
  lovelaceToAda: (lovelace: bigint | string): number => {
    return Number(lovelace) / 1_000_000;
  },

  /**
   * Format ADA amount for display
   */
  formatAda: (amount: number, decimals: number = 2): string => {
    return `${amount.toFixed(decimals)} ADA`;
  },

  /**
   * Get platform address for given network ID
   * Now accepts network ID instead of optional NetworkType
   */
  getPlatformAddress: (networkId: number): string => {
    const networkType = getNetworkTypeFromId(networkId);
    return PLATFORM_ADDRESSES[networkType];
  },

  /**
   * Get platform address by network type (legacy support)
   */
  getPlatformAddressByType: (networkType: NetworkType): string => {
    return PLATFORM_ADDRESSES[networkType];
  },

  /**
   * Get blockfrost URL for given network ID
   */
  getBlockfrostUrl: (networkId: number): string => {
    const networkInfo = getNetworkInfoFromId(networkId);
    return networkInfo.blockfrostUrl;
  },

  /**
   * Generate transaction reference for tracking
   */
  generateTransactionRef: (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ntd_${timestamp}_${random}`;
  },

  /**
   * Validate transaction hash format
   */
  isValidTxHash: (txHash: string): boolean => {
    return /^[a-fA-F0-9]{64}$/.test(txHash);
  },

  /**
   * Determine if address matches network
   */
  isAddressForNetwork: (address: string, networkId: number): boolean => {
    const isMainnet = networkId === 1;
    const isMainnetAddress = address.startsWith('addr1');
    const isTestnetAddress = address.startsWith('addr_test1');
    
    return (isMainnet && isMainnetAddress) || (!isMainnet && isTestnetAddress);
  },

  /**
   * Get appropriate contract address based on network ID
   * This can be extended to support different contracts per network
   */
  getContractAddress: (networkId: number): string => {
    // You can store different contract addresses per network
    const contractAddresses: Record<NetworkType, string> = {
      Preview: process.env.CONTRACT_ADDRESS_PREVIEW || process.env.CONTRACT_ADDRESS || '',
      Preprod: process.env.CONTRACT_ADDRESS_PREPROD || process.env.CONTRACT_ADDRESS || '',
      Mainnet: process.env.CONTRACT_ADDRESS_MAINNET || process.env.CONTRACT_ADDRESS || ''
    };
    
    const networkType = getNetworkTypeFromId(networkId);
    return contractAddresses[networkType];
  }
};

// Export network detection utilities for use in other modules
export const networkUtils = {
  getNetworkTypeFromId,
  getNetworkInfoFromId,
  isMainnet: (networkId: number) => networkId === 1,
  isTestnet: (networkId: number) => networkId === 0,
  getNetworkDisplayName: (networkId: number) => {
    const info = getNetworkInfoFromId(networkId);
    return info.name;
  }
};