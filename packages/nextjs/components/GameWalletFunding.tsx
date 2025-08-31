import { useState } from "react";
import { Amount } from "~~/app/dice/_components";
import { useGameFunding } from "~~/hooks/useGameFunding";

interface GameWalletFundingProps {
  gameWallet: {
    address: string;
    privateKey: string;
  } | null;
  monadGamesIdWallet: string | null;
}

export const GameWalletFunding = ({ gameWallet, monadGamesIdWallet }: GameWalletFundingProps) => {
  const [fundingAmount, setFundingAmount] = useState("");
  const { connectedBalance, gameWalletBalance, isFunding, fundingError, fundGameWallet, getRecommendedFundingAmount } =
    useGameFunding({ gameWallet, monadGamesIdWallet });

  const handleFundWallet = async () => {
    if (!fundingAmount || parseFloat(fundingAmount) <= 0) return;
    await fundGameWallet(fundingAmount);
    setFundingAmount("");
  };

  const setRecommendedAmount = () => {
    setFundingAmount(getRecommendedFundingAmount());
  };

  if (!gameWallet) {
    return (
      <div className="w-full max-w-md p-4 bg-base-200 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Game Wallet</div>
          <div className="text-sm opacity-70">Initializing game wallet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-4 bg-base-200 rounded-lg">
      <div className="text-center mb-4">
        <div className="text-lg font-semibold mb-2">Game Wallet</div>
        <div className="text-sm font-mono bg-base-300 p-2 rounded">
          {gameWallet.address.slice(0, 6)}...{gameWallet.address.slice(-4)}
        </div>
      </div>

      {/* Game Wallet Balance */}
      <div className="mb-4 text-center">
        <div className="text-sm opacity-70 mb-1">Game Wallet Balance</div>
        <div className="text-xl font-bold">
          <Amount amount={gameWalletBalance ? Number(gameWalletBalance.formatted) : 0} />
        </div>
      </div>

      {/* Connected Wallet Balance */}
      {connectedBalance && (
        <div className="mb-4 text-center">
          <div className="text-sm opacity-70 mb-1">Available to Fund</div>
          <div className="text-lg">
            <Amount amount={Number(connectedBalance.formatted)} />
          </div>
        </div>
      )}

      {/* Funding Section */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-center">Fund Game Wallet</div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Amount in ETH"
            value={fundingAmount}
            onChange={e => setFundingAmount(e.target.value)}
            className="input input-bordered flex-1"
            step="0.001"
            min="0"
          />
          <button onClick={setRecommendedAmount} className="btn btn-sm btn-outline" disabled={!connectedBalance}>
            Auto
          </button>
        </div>

        {fundingError && <div className="text-error text-sm text-center">{fundingError}</div>}

        <button
          onClick={handleFundWallet}
          disabled={!fundingAmount || parseFloat(fundingAmount) <= 0 || isFunding || !connectedBalance}
          className="btn btn-primary w-full"
        >
          {isFunding ? "Funding..." : "Fund Game Wallet"}
        </button>

        <div className="text-xs opacity-70 text-center">90% goes to game wallet, 10% to Monad Games ID wallet</div>
      </div>
    </div>
  );
};
