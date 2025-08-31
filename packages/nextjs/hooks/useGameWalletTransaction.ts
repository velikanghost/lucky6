import { useState } from "react";
import { Abi, parseEther } from "viem";
import { createPublicClient, createWalletClient, encodeFunctionData, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "viem/chains";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

interface GameWalletTransactionProps {
  gameWallet: {
    address: string;
    privateKey: string;
  } | null;
}

export const useGameWalletTransaction = ({ gameWallet }: GameWalletTransactionProps) => {
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Get the DiceGame contract info
  const { data: diceGameContract } = useDeployedContractInfo({
    contractName: "DiceGame",
  });

  const rollDiceWithGameWallet = async () => {
    if (!gameWallet || !diceGameContract) {
      setTransactionError("Game wallet or contract not available");
      return null;
    }

    try {
      setIsTransactionPending(true);
      setTransactionError(null);

      // Create wallet client with game wallet private key
      const account = privateKeyToAccount(gameWallet.privateKey as `0x${string}`);
      const walletClient = createWalletClient({
        account,
        chain: monadTestnet,
        transport: http(),
      });

      // Create public client for reading contract data
      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(),
      });

      // Prepare the transaction
      await publicClient.simulateContract({
        account: account.address,
        address: diceGameContract.address as `0x${string}`,
        abi: diceGameContract.abi as Abi,
        functionName: "rollTheDice",
        value: parseEther("0.002"),
      });

      // Encode the function data
      const data = encodeFunctionData({
        abi: diceGameContract.abi,
        functionName: "rollTheDice",
      });

      // Send the transaction using sendTransaction
      const hash = await walletClient.sendTransaction({
        to: diceGameContract.address,
        data: data,
        value: parseEther("0.002"),
        account: account,
      });

      console.log("Game wallet dice roll transaction sent:", hash);
      return hash;
    } catch (err) {
      console.error("Error rolling dice with game wallet:", err);
      setTransactionError(err instanceof Error ? err.message : "Failed to roll dice");
      return null;
    } finally {
      setIsTransactionPending(false);
    }
  };

  return {
    rollDiceWithGameWallet,
    isTransactionPending,
    transactionError,
  };
};
