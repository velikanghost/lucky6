import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface MonadGamesIdUser {
  id: number;
  username: string;
  walletAddress: string;
}

interface MonadGamesIdResponse {
  hasUsername: boolean;
  user?: MonadGamesIdUser;
}

export const useMonadGamesId = () => {
  const { address } = useAccount();
  const [username, setUsername] = useState<string | null>(null);
  const [monadGamesIdWallet, setMonadGamesIdWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!address) {
        setUsername(null);
        setHasUsername(null);
        setMonadGamesIdWallet(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://monad-games-id-site.vercel.app/api/check-wallet?wallet=${address}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MonadGamesIdResponse = await response.json();

        setHasUsername(data.hasUsername);

        if (data.hasUsername && data.user) {
          setUsername(data.user.username);
          setMonadGamesIdWallet(data.user.walletAddress);
        } else {
          setUsername(null);
          setMonadGamesIdWallet(null);
        }
      } catch (err) {
        console.error("Error fetching Monad Games ID username:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch username");
        setUsername(null);
        setHasUsername(null);
        setMonadGamesIdWallet(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsername();
  }, [address]);

  const registerUsernameUrl = "https://monad-games-id-site.vercel.app/";

  return {
    username,
    monadGamesIdWallet,
    hasUsername,
    isLoading,
    error,
    registerUsernameUrl,
  };
};
