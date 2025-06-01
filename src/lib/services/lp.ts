// #TODO-27: LP (Liquidity Provider) service using kunalabs-io/kai package - IMPLEMENTED

import { VAULTS, getVaultStats, getWalletVaultInfo, Amount } from '@kunalabs-io/kai';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

// #TODO-27.1: Define LP service interfaces
export interface LPPosition {
  vaultSymbol: string;
  vaultName: string;
  ytBalance: string; // Yield-bearing token balance
  equity: string; // User's equity in the vault (raw onchain value)
  apr: number;
  apy: number;
  tvl: string; // Total Value Locked
}

export interface LPPortfolioData {
  positions: LPPosition[];
  lastUpdated: string;
  isLoading: boolean;
}

// #TODO-31: LP Deposit interfaces
export interface LPDepositQuote {
  success: boolean;
  data?: {
    vaultSymbol: string;
    depositAmount: number;
    expectedYTTokens: number;
    currentAPR: number;
    currentAPY: number;
    vaultTVL: string;
  };
  error?: string;
}

export interface LPDepositTransaction {
  success: boolean;
  data?: Transaction;
  error?: string;
}

// #TODO-27.2: LP service implementation
export class LPService {
  private suiClient: SuiClient;

  constructor() {
    // Initialize SUI client for mainnet
    this.suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });
  }

  // #TODO-27.3: Get all available vaults
  private getAllVaults() {
    // Return all available vaults from kunalabs-io/kai
    return Object.entries(VAULTS);
  }

  // #TODO-27.4: Get LP portfolio data for a wallet
  async getLPPortfolio(walletAddress: string): Promise<LPPortfolioData> {
    try {
      console.log(`🏦 Fetching LP portfolio for wallet: ${walletAddress}`);

      const vaults = this.getAllVaults();
      const positions: LPPosition[] = [];

      // Fetch data for all vaults in parallel for better performance
      const vaultPromises = vaults.map(async ([vaultKey, vault]) => {
        try {
          // Fetch vault data and wallet info in parallel
          // Note: Using type assertion to handle SUI client version compatibility
          const suiClient = this.suiClient as any;
          const [walletInfo, vaultStats] = await Promise.all([
            vault.fetch(suiClient).then(data => getWalletVaultInfo(suiClient, walletAddress, data)),
            vault.fetch(suiClient).then(data => getVaultStats(data))
          ]);

          // Check if user has any position in this vault
          const ytBalanceNum = parseFloat(walletInfo.ytBalance.toString());
          const equityNum = parseFloat(walletInfo.equity.toString());

          if (ytBalanceNum > 0 || equityNum > 0) {
            const position: LPPosition = {
              vaultSymbol: vault.T.symbol,
              vaultName: `${vault.T.symbol} Vault`,
              ytBalance: walletInfo.ytBalance.toString(),
              equity: walletInfo.equity.toString(),
              apr: vaultStats.apr,
              apy: vaultStats.apy,
              tvl: vaultStats.tvl.toString()
            };

            return position;
          }

          return null;
        } catch (error) {
          console.warn(`Failed to fetch data for vault ${vaultKey}:`, error);
          return null;
        }
      });

      // Wait for all vault data and filter out null results
      const vaultResults = await Promise.all(vaultPromises);
      positions.push(...vaultResults.filter((pos): pos is LPPosition => pos !== null));

      console.log(`🏦 Found ${positions.length} LP positions`);

      return {
        positions,
        lastUpdated: new Date().toISOString(),
        isLoading: false
      };

    } catch (error) {
      console.error('Failed to get LP portfolio:', error);
      throw new Error('Failed to fetch LP portfolio data');
    }
  }

  // #TODO-27.5: Get specific vault info
  async getVaultInfo(vaultKey: string, walletAddress?: string) {
    try {
      const vaults = this.getAllVaults();
      const vaultEntry = vaults.find(([key]) => key === vaultKey);

      if (!vaultEntry) {
        throw new Error(`Vault ${vaultKey} not found`);
      }

      const [, vault] = vaultEntry;
      // Note: Using type assertion to handle SUI client version compatibility
      const suiClient = this.suiClient as any;
      const vaultData = await vault.fetch(suiClient);
      const vaultStats = getVaultStats(vaultData);

      const result = {
        vaultSymbol: vault.T.symbol,
        vaultName: `${vault.T.symbol} Vault`,
        apr: vaultStats.apr,
        apy: vaultStats.apy,
        tvl: vaultStats.tvl.toString(),
        walletInfo: null as any
      };

      // If wallet address provided, get wallet-specific info
      if (walletAddress) {
        const walletInfo = await getWalletVaultInfo(suiClient, walletAddress, vaultData);
        result.walletInfo = {
          ytBalance: walletInfo.ytBalance.toString(),
          equity: walletInfo.equity.toString()
        };
      }

      return result;
    } catch (error) {
      console.error(`Failed to get vault info for ${vaultKey}:`, error);
      throw error;
    }
  }

  // #TODO-27.6: Get all vault stats (global overview)
  async getAllVaultStats() {
    try {
      const vaults = this.getAllVaults();

      const statsPromises = vaults.map(async ([vaultKey, vault]) => {
        try {
          // Note: Using type assertion to handle SUI client version compatibility
          const suiClient = this.suiClient as any;
          const vaultData = await vault.fetch(suiClient);
          const stats = getVaultStats(vaultData);

          return {
            vaultKey,
            vaultSymbol: vault.T.symbol,
            vaultName: `${vault.T.symbol} Vault`,
            apr: stats.apr,
            apy: stats.apy,
            tvl: stats.tvl.toString()
          };
        } catch (error) {
          console.warn(`Failed to fetch stats for vault ${vaultKey}:`, error);
          return null;
        }
      });

      const results = await Promise.all(statsPromises);
      return results.filter(result => result !== null);
    } catch (error) {
      console.error('Failed to get all vault stats:', error);
      throw new Error('Failed to fetch vault statistics');
    }
  }

  // #TODO-31.1: Find vault by symbol
  private findVaultBySymbol(symbol: string) {
    const vaults = this.getAllVaults();
    const vaultEntry = vaults.find(([, vault]) =>
      vault.T.symbol.toLowerCase() === symbol.toLowerCase()
    );
    return vaultEntry ? vaultEntry[1] : null;
  }

  // #TODO-31.2: Get deposit quote for LP
  async getDepositQuote(vaultSymbol: string, amount: number): Promise<LPDepositQuote> {
    try {
      console.log(`💰 Getting LP deposit quote for ${amount} ${vaultSymbol}`);

      const vault = this.findVaultBySymbol(vaultSymbol);
      if (!vault) {
        return {
          success: false,
          error: `Vault for ${vaultSymbol} not found. Available vaults: ${this.getAllVaults().map(([, v]) => v.T.symbol).join(', ')}`
        };
      }

      // Note: Using type assertion to handle SUI client version compatibility
      const suiClient = this.suiClient as any;
      const vaultData = await vault.fetch(suiClient);
      const vaultStats = getVaultStats(vaultData);

      // Calculate expected YT tokens using vault APY
      // YT tokens represent the discounted value of the underlying asset
      // The discount rate is typically related to the vault's yield potential
      const expectedYTTokens = amount * (1 - vaultStats.apy);

      return {
        success: true,
        data: {
          vaultSymbol: vault.T.symbol,
          depositAmount: amount,
          expectedYTTokens,
          currentAPR: vaultStats.apr,
          currentAPY: vaultStats.apy,
          vaultTVL: vaultStats.tvl.toString()
        }
      };

    } catch (error) {
      console.error('Failed to get LP deposit quote:', error);
      return {
        success: false,
        error: `Failed to get deposit quote: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // #TODO-31.3: Create deposit transaction
  async createDepositTransaction(
    walletAddress: string,
    vaultSymbol: string,
    amount: number
  ): Promise<LPDepositTransaction> {
    try {
      console.log(`🏦 Creating LP deposit transaction for ${amount} ${vaultSymbol}`);

      const vault = this.findVaultBySymbol(vaultSymbol);
      if (!vault) {
        return {
          success: false,
          error: `Vault for ${vaultSymbol} not found`
        };
      }

      // Create transaction using kunalabs-io/kai pattern
      const tx = new Transaction();

      // Convert amount to proper format using vault decimals
      const depositAmount = Amount.fromNum(amount, vault.T.decimals);

      // Use vault.depositFromWallet method as shown in the example
      // Note: Using type assertion to handle transaction version compatibility
      await vault.depositFromWallet(tx as any, walletAddress, depositAmount);

      return {
        success: true,
        data: tx
      };

    } catch (error) {
      console.error('Failed to create LP deposit transaction:', error);
      return {
        success: false,
        error: `Failed to create deposit transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const lpService = new LPService();
