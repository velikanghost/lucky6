import { useEffect, useState } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { useAccount } from "wagmi";
import { decryptData, encryptData } from "~~/utils/encryption";

interface GameWallet {
  address: string;
  privateKey: string;
}

export const useGameWallet = () => {
  const { address: connectedAddress } = useAccount();
  const [gameWallet, setGameWallet] = useState<GameWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGameWallet = async () => {
    if (!connectedAddress) return null;

    try {
      setIsLoading(true);
      setError(null);

      // Generate a random private key
      const privateKey = generatePrivateKey();

      // Convert the private key into an account
      const account = privateKeyToAccount(privateKey);

      // Encrypt and save the wallet to localStorage
      const encryptedPrivateKey = encryptData(privateKey);
      localStorage.setItem(`gameWallet_${connectedAddress}`, encryptedPrivateKey);

      const wallet: GameWallet = {
        address: account.address,
        privateKey: privateKey,
      };

      setGameWallet(wallet);
      console.log("Generated and encrypted game wallet:", account.address);

      return wallet;
    } catch (err) {
      console.error("Error generating game wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to generate game wallet");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const restoreGameWallet = async () => {
    if (!connectedAddress) return null;

    try {
      setIsLoading(true);
      setError(null);

      // Check if a game wallet already exists
      const savedWallet = localStorage.getItem(`gameWallet_${connectedAddress}`);

      if (!savedWallet) {
        return null;
      }

      const decryptedPrivateKey = decryptData(savedWallet);
      const account = privateKeyToAccount(decryptedPrivateKey as `0x${string}`);

      const wallet: GameWallet = {
        address: account.address,
        privateKey: decryptedPrivateKey,
      };

      setGameWallet(wallet);
      console.log("Restored game wallet:", account.address);

      return wallet;
    } catch (err) {
      console.error("Error restoring game wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to restore game wallet");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGameWallet = async () => {
    if (!connectedAddress) return;

    try {
      // First try to restore existing wallet
      const restoredWallet = await restoreGameWallet();

      if (!restoredWallet) {
        // If no existing wallet, create a new one
        await generateGameWallet();
      }
    } catch (err) {
      console.error("Error initializing game wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize game wallet");
    }
  };

  // Auto-initialize game wallet when user connects
  useEffect(() => {
    if (connectedAddress) {
      initializeGameWallet();
    } else {
      setGameWallet(null);
      setError(null);
    }
  }, [connectedAddress]);

  return {
    gameWallet,
    isLoading,
    error,
    generateGameWallet,
    restoreGameWallet,
    initializeGameWallet,
  };
};
