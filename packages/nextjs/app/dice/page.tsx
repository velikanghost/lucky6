"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { Address as AddressType, formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Amount, Roll, RollEvents, Winner, WinnerEvents } from "~~/app/dice/_components";
import { GameWalletFunding } from "~~/components/GameWalletFunding";
import { useScaffoldReadContract, useScaffoldWriteContract, useWebSocketEvents } from "~~/hooks/scaffold-eth";
import { useGameWallet } from "~~/hooks/useGameWallet";
import { useGameWalletTransaction } from "~~/hooks/useGameWalletTransaction";
import { useMonadGamesId } from "~~/hooks/useMonadGamesId";

const ROLL_ETH_VALUE = "0.002";
const MAX_TABLE_ROWS = 10;

const DiceGame: NextPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { address } = useAccount();

  const [rolled, setRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const { data: prize } = useScaffoldReadContract({ contractName: "DiceGame", functionName: "prize" });

  // Monad Games ID integration
  const {
    username,
    monadGamesIdWallet,
    hasUsername,
    isLoading: isLoadingUsername,
    error: usernameError,
    registerUsernameUrl,
  } = useMonadGamesId();

  // Game wallet management
  const { gameWallet, isLoading: isLoadingGameWallet, error: gameWalletError } = useGameWallet();

  // Game wallet transactions
  const { rollDiceWithGameWallet, redeemCardsWithGameWallet, isTransactionPending, transactionError } =
    useGameWalletTransaction({ gameWallet });

  // Player stats - use game wallet address if available, otherwise use connected address
  const statsAddress = gameWallet?.address || address;
  const { data: playerStats } = useScaffoldReadContract({
    contractName: "DiceGame",
    functionName: "getPlayerStats",
    args: statsAddress ? [statsAddress as AddressType] : [undefined],
  });

  // Use WebSocket for real-time events
  const { rolls: wsRolls, winners: wsWinners } = useWebSocketEvents();

  // Convert WebSocket data to match existing component types
  const rolls: Roll[] = wsRolls.map(wsRoll => ({
    address: wsRoll.address as AddressType,
    amount: wsRoll.amount,
    roll: wsRoll.roll,
  }));

  const winners: Winner[] = wsWinners.map(wsWinner => ({
    address: wsWinner.address as AddressType,
    amount: wsWinner.amount,
  }));

  // Stop rolling when we receive a new roll event
  useEffect(() => {
    if (wsRolls.length > 0 && isRolling) {
      setIsRolling(false);
    }
  }, [wsRolls.length, isRolling]);

  const { writeContractAsync: writeDiceGameAsync, isError: rollTheDiceError } = useScaffoldWriteContract({
    contractName: "DiceGame",
  });

  const { writeContractAsync: writeRedeemAsync, isError: redeemError } = useScaffoldWriteContract({
    contractName: "DiceGame",
  });

  const immediateStopRolling = useCallback(() => {
    setIsRolling(false);
    setRolled(false);
  }, []);

  useEffect(() => {
    if (rollTheDiceError) {
      immediateStopRolling();
    }
  }, [immediateStopRolling, rollTheDiceError]);

  useEffect(() => {
    if (redeemError) {
      setIsRedeeming(false);
    }
  }, [redeemError]);

  useEffect(() => {
    if (transactionError) {
      immediateStopRolling();
    }
  }, [transactionError, immediateStopRolling]);

  useEffect(() => {
    if (videoRef.current && !isRolling) {
      // show last frame
      videoRef.current.currentTime = 9999;
    }
  }, [isRolling]);

  const handleRedeem = async () => {
    if (!statsAddress) return;

    setIsRedeeming(true);
    try {
      if (gameWallet) {
        // Use game wallet for redeem transaction
        await redeemCardsWithGameWallet();
      } else {
        // Fallback to connected wallet
        await writeRedeemAsync({ functionName: "redeemCards" });
      }
    } catch (err) {
      console.error("Error calling redeemCards function", err);
    } finally {
      setIsRedeeming(false);
    }
  };

  // Extract player stats
  const [streak, cards, prizes] = playerStats || [0, 0, 0];
  const canRedeem = cards >= 5; // CARDS_REQUIRED_FOR_PRIZE constant from contract

  return (
    <div className="py-10 px-10">
      <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-6">
        <div className="max-lg:row-start-2">
          <RollEvents rolls={rolls.slice(0, MAX_TABLE_ROWS)} />
        </div>

        <div className="flex flex-col items-center pt-4 max-lg:row-start-1">
          {/* Player Stats Section */}
          {address && (
            <div className="w-full max-w-md mb-6 p-4 bg-base-200 rounded-lg">
              {/* Monad Games ID Username */}
              <div className="mb-4 text-center">
                {isLoadingUsername ? (
                  <div className="text-sm opacity-70">Loading username...</div>
                ) : usernameError ? (
                  <div className="text-sm text-error">Error loading username</div>
                ) : hasUsername && username ? (
                  <div>
                    <div className="text-lg font-semibold text-primary">@{username}</div>
                    <div className="text-xs opacity-70">Monad Games ID</div>
                  </div>
                ) : hasUsername === false ? (
                  <div className="text-center">
                    <div className="text-sm opacity-70 mb-2">No username found</div>
                    <a
                      href={registerUsernameUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-xs btn-primary normal-case"
                    >
                      Register Username
                    </a>
                  </div>
                ) : null}
              </div>

              {/* Game Wallet Status */}
              <div className="mb-4 text-center">
                {isLoadingGameWallet ? (
                  <div className="text-sm opacity-70">Initializing game wallet...</div>
                ) : gameWalletError ? (
                  <div className="text-sm text-error">Error: {gameWalletError}</div>
                ) : gameWallet ? (
                  <div>
                    <div className="text-sm opacity-70">Game Wallet Ready</div>
                    <div className="text-xs font-mono bg-base-300 p-1 rounded mt-1">
                      {gameWallet.address.slice(0, 6)}...{gameWallet.address.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm opacity-70">Setting up game wallet...</div>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-3 text-center">Your Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{streak?.toString() || "0"}</div>
                  <div className="text-sm opacity-70">Current Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{cards?.toString() || "0"}</div>
                  <div className="text-sm opacity-70">Cards Owned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{prizes?.toString() || "0"}</div>
                  <div className="text-sm opacity-70">Prizes Won</div>
                </div>
              </div>

              {/* Redeem Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleRedeem}
                  disabled={!canRedeem || isRedeeming}
                  className={`btn btn-sm ${canRedeem ? "btn-primary" : "btn-disabled"} normal-case`}
                >
                  {isRedeeming ? "Redeeming..." : `Redeem 5 Cards for Prize`}
                </button>
                {!canRedeem && cards > 0 && (
                  <div className="text-xs mt-2 opacity-70">Need {5 - Number(cards || 0)} more cards to redeem</div>
                )}
              </div>
            </div>
          )}

          {/* Game Wallet Funding Section */}
          {address && gameWallet && (
            <GameWalletFunding gameWallet={gameWallet} monadGamesIdWallet={monadGamesIdWallet} />
          )}

          <div className="flex w-full justify-center">
            <span className="text-xl"> Roll 7-15 to win the prize! </span>
          </div>

          {gameWallet && (
            <div className="flex w-full justify-center mt-2">
              <span className="text-sm opacity-70">Using game wallet for transactions</span>
            </div>
          )}

          {transactionError && (
            <div className="flex w-full justify-center mt-2">
              <span className="text-sm text-error">Transaction error: {transactionError}</span>
            </div>
          )}

          <div className="flex items-center mt-1">
            <span className="text-lg mr-2">Prize:</span>
            <Amount amount={prize ? Number(formatEther(prize)) : 0} className="text-lg" />
          </div>

          <button
            onClick={async () => {
              if (!rolled) {
                setRolled(true);
              }
              setIsRolling(true);
              try {
                if (gameWallet) {
                  // Use game wallet for transaction
                  await rollDiceWithGameWallet();
                } else {
                  // Fallback to connected wallet
                  await writeDiceGameAsync({ functionName: "rollTheDice", value: parseEther(ROLL_ETH_VALUE) });
                }
              } catch (err) {
                console.error("Error calling rollTheDice function", err);
                immediateStopRolling();
              }
            }}
            disabled={isRolling || isTransactionPending || !gameWallet}
            className="mt-2 btn btn-secondary btn-xl normal-case font-xl text-lg"
          >
            {isRolling || isTransactionPending ? "Rolling..." : "Roll the dice!"}
          </button>

          <div className="flex mt-8">
            {rolled ? (
              isRolling ? (
                <video key="rolling" width={300} height={300} loop src="/rolls/Spin.webm" autoPlay />
              ) : (
                <video key="rolled" width={300} height={300} src={`/rolls/${rolls[0]?.roll || "0"}.webm`} autoPlay />
              )
            ) : (
              <video ref={videoRef} key="last" width={300} height={300} src={`/rolls/${rolls[0]?.roll || "0"}.webm`} />
            )}
          </div>
        </div>

        <div className="max-lg:row-start-3">
          <WinnerEvents winners={winners.slice(0, MAX_TABLE_ROWS)} />
        </div>
      </div>
    </div>
  );
};

export default DiceGame;
