"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { Address as AddressType, formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Amount, Roll, RollEvents, Winner, WinnerEvents } from "~~/app/dice/_components";
import { useScaffoldReadContract, useScaffoldWriteContract, useWebSocketEvents } from "~~/hooks/scaffold-eth";

const ROLL_ETH_VALUE = "0.002";
const MAX_TABLE_ROWS = 10;

const DiceGame: NextPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { address } = useAccount();

  const [rolled, setRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const { data: prize } = useScaffoldReadContract({ contractName: "DiceGame", functionName: "prize" });

  // Player stats
  const { data: playerStats } = useScaffoldReadContract({
    contractName: "DiceGame",
    functionName: "getPlayerStats",
    args: address ? [address as AddressType] : [undefined],
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
    if (videoRef.current && !isRolling) {
      // show last frame
      videoRef.current.currentTime = 9999;
    }
  }, [isRolling]);

  const handleRedeem = async () => {
    if (!address) return;

    setIsRedeeming(true);
    try {
      await writeRedeemAsync({ functionName: "redeemCards" });
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

          <div className="flex w-full justify-center">
            <span className="text-xl"> Roll a 0, 1, 2, 3, 4 or 5 to win the prize! </span>
          </div>

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
                await writeDiceGameAsync({ functionName: "rollTheDice", value: parseEther(ROLL_ETH_VALUE) });
              } catch (err) {
                console.error("Error calling rollTheDice function", err);
                immediateStopRolling();
              }
            }}
            disabled={isRolling}
            className="mt-2 btn btn-secondary btn-xl normal-case font-xl text-lg"
          >
            Roll the dice!
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
