import { toPrivyWallet } from "@privy-io/cross-app-connect/rainbow-kit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { rainbowkitBurnerWallet } from "burner-connector";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

const { onlyLocalBurnerWallet, targetNetworks } = scaffoldConfig;

const wallets = [
  // Privy Global Wallet (Monad Games ID)
  toPrivyWallet({
    id: "cmd8euall0037le0my79qpz42",
    name: "Monad Games ID",
    iconUrl: "https://monad.xyz/favicon.ico", // Monad favicon
  }),
  metaMaskWallet,
  ...(!targetNetworks.some(network => network.id !== (chains.hardhat as chains.Chain).id) || !onlyLocalBurnerWallet
    ? [rainbowkitBurnerWallet]
    : []),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets,
    },
  ],

  {
    appName: "Gatherers",
    projectId: scaffoldConfig.walletConnectProjectId,
  },
);
