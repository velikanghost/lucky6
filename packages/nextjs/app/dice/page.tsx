"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { Address as AddressType, formatEther, parseEther } from "viem";
import { Amount, Roll, RollEvents, Winner, WinnerEvents } from "~~/app/dice/_components";
import { useScaffoldReadContract, useScaffoldWriteContract, useWebSocketEvents } from "~~/hooks/scaffold-eth";

const ROLL_ETH_VALUE = "0.002";
const MAX_TABLE_ROWS = 10;

const DiceGame: NextPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [rolled, setRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const { data: prize } = useScaffoldReadContract({ contractName: "DiceGame", functionName: "prize" });

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
    if (videoRef.current && !isRolling) {
      // show last frame
      videoRef.current.currentTime = 9999;
    }
  }, [isRolling]);

  return (
    <div className="py-10 px-10">
      <div className="grid grid-cols-3 max-lg:grid-cols-1">
        <div className="max-lg:row-start-2">
          <RollEvents rolls={rolls.slice(0, MAX_TABLE_ROWS)} />
        </div>

        <div className="flex flex-col items-center pt-4 max-lg:row-start-1">
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
