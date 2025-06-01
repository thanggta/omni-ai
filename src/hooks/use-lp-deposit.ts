// Hook for LP deposit transactions using kunalabs-io/kai

import { useMutation } from "@tanstack/react-query";
import { useSuiBase } from "./use-sui-base";
import { lpService } from "@/src/lib/services/lp";
import { SuiTransactionError } from "@/src/lib/services/sui";

interface LPDepositParams {
  vaultSymbol: string;
  amount: number;
}

export const useLPDeposit = () => {
  const { account, executeTransaction } = useSuiBase();

  return useMutation({
    mutationFn: async ({ vaultSymbol, amount }: LPDepositParams) => {
      if (!account) {
        throw new SuiTransactionError("No wallet connected");
      }

      try {
        console.log(`🏦 Executing LP deposit: ${amount} ${vaultSymbol}`);

        // Create the deposit transaction using LP service
        const result = await lpService.createDepositTransaction(
          account.address,
          vaultSymbol,
          amount
        );

        if (!result.success || !result.data) {
          throw new SuiTransactionError(result.error || "Failed to create deposit transaction");
        }

        // Execute the transaction
        return executeTransaction(result.data as any);
      } catch (error) {
        console.error("Error executing LP deposit", error);

        throw error instanceof SuiTransactionError
          ? error
          : new SuiTransactionError("Failed to execute LP deposit");
      }
    },
  });
};
