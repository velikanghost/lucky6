import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useBalance, useSendTransaction } from "wagmi";

interface GameFundingProps {
  gameWallet: {
    address: string;
    privateKey: string;
  } | null;
  monadGamesIdWallet: string | null;
}

export const useGameFunding = ({ gameWallet, monadGamesIdWallet }: GameFundingProps) => {
  const { address: connectedAddress } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [isFunding, setIsFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);

  // Get balance of connected wallet (Monad Games ID wallet)
  const { data: connectedBalance } = useBalance({
    address: connectedAddress,
  });

  // Get balance of game wallet
  const { data: gameWalletBalance, refetch: refetchGameWalletBalance } = useBalance({
    address: gameWallet?.address as `0x${string}`,
  });

  const fundGameWallet = async (amount: string) => {
    if (!connectedAddress || !gameWallet || !monadGamesIdWallet) {
      setFundingError("Missing required wallet information");
      return;
    }

    try {
      setIsFunding(true);
      setFundingError(null);

      const amountInEther = parseEther(amount);

      // Calculate amounts: 90% to game wallet, 10% to Monad Games ID wallet
      const gameWalletAmount = (amountInEther * 90n) / 100n;
      const monadGamesIdAmount = (amountInEther * 10n) / 100n;

      // Send 90% to game wallet
      await sendTransactionAsync({
        to: gameWallet.address as `0x${string}`,
        value: gameWalletAmount,
      });

      // Send 10% to Monad Games ID wallet (if different from connected address)
      if (monadGamesIdWallet !== connectedAddress) {
        await sendTransactionAsync({
          to: monadGamesIdWallet as `0x${string}`,
          value: monadGamesIdAmount,
        });
      }

      // Refresh game wallet balance
      await refetchGameWalletBalance();

      console.log(`Funded game wallet with ${formatEther(gameWalletAmount)} ETH`);
      console.log(`Sent ${formatEther(monadGamesIdAmount)} ETH to Monad Games ID wallet`);
    } catch (err) {
      console.error("Error funding game wallet:", err);
      setFundingError(err instanceof Error ? err.message : "Failed to fund game wallet");
    } finally {
      setIsFunding(false);
    }
  };

  const getRecommendedFundingAmount = () => {
    if (!connectedBalance) return "0.01";

    const balance = parseFloat(formatEther(connectedBalance.value));

    // Recommend 20% of available balance, but at least 0.01 ETH
    const recommended = Math.max(balance * 0.2, 0.01);
    return recommended.toFixed(3);
  };

  return {
    connectedBalance,
    gameWalletBalance,
    isFunding,
    fundingError,
    fundGameWallet,
    getRecommendedFundingAmount,
    refetchGameWalletBalance,
  };
};
