import { useCallback, useEffect, useState } from "react";
import { createPublicClient, decodeEventLog, parseAbiItem, webSocket } from "viem";
import { monadTestnet } from "viem/chains";
import deployedContracts from "~~/contracts/deployedContracts";

const wsUrl = "wss://testnet-rpc.monad.xyz";

// Create viem client
const client = createPublicClient({
  chain: monadTestnet,
  transport: webSocket(wsUrl),
});

// Parse the event ABIs
const rollEvent = parseAbiItem("event Roll(address indexed player, uint256 amount, uint256 roll)");
const winnerEvent = parseAbiItem("event Winner(address winner, uint256 amount)");

export type WebSocketRoll = {
  address: string;
  amount: number;
  roll: string;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: string;
};

export type WebSocketWinner = {
  address: string;
  amount: bigint;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: string;
};

export const useWebSocketEvents = () => {
  const [rolls, setRolls] = useState<WebSocketRoll[]>([]);
  const [winners, setWinners] = useState<WebSocketWinner[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = deployedContracts[10143].DiceGame.address;

  const addRoll = useCallback((roll: WebSocketRoll) => {
    setRolls(prev => [roll, ...prev.slice(0, 9)]); // Keep only last 10 rolls
  }, []);

  const addWinner = useCallback((winner: WebSocketWinner) => {
    setWinners(prev => [winner, ...prev.slice(0, 9)]); // Keep only last 10 winners
  }, []);

  useEffect(() => {
    if (!contractAddress) {
      setError("Contract address not found");
      return;
    }

    console.log("🔌 Viem WebSocket client listening for events...");
    console.log("🌐 Connected to Monad testnet:", wsUrl);
    console.log("🎯 Monitoring contract:", contractAddress);

    setIsConnected(true);
    setError(null);

    // Add connection status check
    const checkConnection = async () => {
      try {
        await client.getBlockNumber();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError(`Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    };

    checkConnection();

    // Subscribe to Roll events
    const unsubscribeRolls = client.watchContractEvent({
      address: contractAddress,
      abi: [rollEvent],
      onLogs: async logs => {
        for (const log of logs) {
          try {
            // Decode the event
            const decoded = decodeEventLog({
              abi: [rollEvent],
              data: log.data,
              topics: log.topics,
            });

            // Get transaction details
            const receipt = await client.getTransactionReceipt({
              hash: log.transactionHash as `0x${string}`,
            });

            const block = await client.getBlock({
              blockNumber: log.blockNumber as bigint,
            });

            const roll: WebSocketRoll = {
              address: decoded.args.player,
              amount: Number(decoded.args.amount) / 1e18,
              roll: decoded.args.roll.toString(16).toUpperCase(),
              blockNumber: log.blockNumber as bigint,
              transactionHash: log.transactionHash,
              timestamp: block.timestamp ? new Date(Number(block.timestamp) * 1000).toISOString() : "N/A",
            };

            addRoll(roll);

            console.log("🎲 Roll Event Details:", {
              player: roll.address,
              amountInEth: roll.amount.toFixed(6) + " MON",
              roll: roll.roll,
              blockNumber: roll.blockNumber,
              transactionHash: roll.transactionHash,
              status: receipt.status === "success" ? "✅ Success" : "❌ Failed",
              blockTimestamp: roll.timestamp,
            });
          } catch (error) {
            console.error("Error processing Roll event:", error);
          }
        }
      },
      onError: error => {
        console.error("WebSocket Roll event error:", error);
        setError(`Roll event error: ${error.message}`);
      },
    });

    // Subscribe to Winner events
    const unsubscribeWinners = client.watchContractEvent({
      address: contractAddress,
      abi: [winnerEvent],
      onLogs: async logs => {
        for (const log of logs) {
          try {
            // Decode the event
            const decoded = decodeEventLog({
              abi: [winnerEvent],
              data: log.data,
              topics: log.topics,
            });

            // Get transaction details
            const receipt = await client.getTransactionReceipt({
              hash: log.transactionHash as `0x${string}`,
            });

            const block = await client.getBlock({
              blockNumber: log.blockNumber as bigint,
            });

            const winner: WebSocketWinner = {
              address: decoded.args.winner,
              amount: decoded.args.amount,
              blockNumber: log.blockNumber as bigint,
              transactionHash: log.transactionHash,
              timestamp: block.timestamp ? new Date(Number(block.timestamp) * 1000).toISOString() : "N/A",
            };

            addWinner(winner);

            console.log("🏆 Winner Event Details:", {
              winner: winner.address,
              amountInEth: (Number(winner.amount) / 1e18).toFixed(6) + " MON",
              blockNumber: winner.blockNumber,
              transactionHash: winner.transactionHash,
              status: receipt.status === "success" ? "✅ Success" : "❌ Failed",
              blockTimestamp: winner.timestamp,
            });
          } catch (error) {
            console.error("Error processing Winner event:", error);
          }
        }
      },
      onError: error => {
        console.error("WebSocket Winner event error:", error);
        setError(`Winner event error: ${error.message}`);
      },
    });

    // Cleanup function
    return () => {
      console.log("Shutting down WebSocket connections...");
      unsubscribeRolls();
      unsubscribeWinners();
      setIsConnected(false);
    };
  }, [contractAddress, addRoll, addWinner]);

  return {
    rolls,
    winners,
    isConnected,
    error,
  };
};
