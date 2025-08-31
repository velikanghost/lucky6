# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🪝 **[Custom hooks](https://docs.scaffoldeth.io/hooks/)**: Collection of React hooks wrapper around [wagmi](https://wagmi.sh/) to simplify interactions with smart contracts with typescript autocompletion.
- 🧱 [**Components**](https://docs.scaffoldeth.io/components/): Collection of common web3 components to quickly build your frontend.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/b237af0c-5027-4849-a5c1-2e31495cccb1)

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

# 🚩 Challenge: 🎲 Dice Game

![readme-3](https://raw.githubusercontent.com/scaffold-eth/se-2-challenges/challenge-dice-game/extension/packages/nextjs/public/hero.png)

> 🎰 Randomness is tricky on a public deterministic blockchain. The block hash is an easy to use, but very weak form of randomness. This challenge will give you an example of a contract using block hash to create random numbers. This randomness is exploitable. Other, stronger forms of randomness include commit/reveal schemes, oracles, or VRF from Chainlink.

> 👍 One day soon, randomness will be built into the Ethereum protocol!

> 💬 Dice Game is a contract that allows users to roll the dice to try and win the prize. If players roll either a 0, 1, 2, 3, 4 or 5 they will win the current prize amount. The initial prize is 10% of the contract's balance, which starts out at .05 Eth.

> 🧤 Every time a player rolls the dice, they are required to send .002 Eth. 40 percent of this value is added to the current prize amount while the other 60 percent stays in the contract to fund future prizes. Once a prize is won, the new prize amount is set to 10% of the total balance of the DiceGame contract.

> 💬 Meet other builders working on this challenge and get help in the [Challenge telegram](https://t.me/+3StA0aBSArFjNjUx)!

---

## Checkpoint 0: 📦 Environment 📚

> Start your local network (a blockchain emulator in your computer):

```sh
yarn chain
```

> in a second terminal window, 🛰 deploy your contract (locally):

```sh
yarn deploy
```

> in a third terminal window, start your 📱 frontend:

```sh
yarn start
```

📱 Open http://localhost:3000 to see the app.

> 👩‍💻 Rerun `yarn deploy` whenever you want to deploy new contracts to the frontend. If you haven't made any contract changes, you can run `yarn deploy--reset` for a completely fresh deploy.

---

## Checkpoint 1: 🎲 Dice Game

🔍 Inspect the code in the `DiceGame.sol` contract in `packages / hardhat / contracts`

🔒 You will not be changing any code in the `DiceGame.sol` contract in this challenge.

💸 Grab some funds from the faucet and roll the dice a few times. Watch the balance of the DiceGame contract in the Debug tab. It increases on a failed roll and decreases by the prize amount on a successful roll.

![Faucet](https://github.com/scaffold-eth/se-2-challenges/assets/55535804/e82e3100-20fb-4886-a6bf-4113c3729f53)

### 🥅 Goals

- [ ] Track the solidity code to find out how the DiceGame contract is generating random numbers.
- [ ] Is it possible to predict the random number for any given roll?

---

## Checkpoint 2: 💾 Deploy your contracts! 🛰

📡 Edit the `defaultNetwork` to [your choice of public EVM networks](https://ethereum.org/en/developers/docs/networks/) in `packages / hardhat / hardhat.config.ts`

🔐 You will need to generate a **deployer address** using `yarn generate` This creates a mnemonic and saves it locally.

👩‍🚀 Use `yarn account` to view your deployer account balances.

⛽️ You will need to send ETH to your **deployer address** with your wallet, or get it from a public faucet of your chosen network.

🚀 Run `yarn deploy` to deploy your smart contract to a public network (selected in `hardhat.config.ts`)

> 💬 Hint: You can set the `defaultNetwork` in `hardhat.config.ts` to `sepolia` or `optimismSepolia` **OR** you can `yarn deploy--network sepolia` or `yarn deploy--network optimismSepolia`.

---

## Checkpoint 3: 🚢 Ship your frontend! 🚁

✏️ Edit your frontend config in `packages / nextjs / scaffold.config.ts` to change the `targetNetwork` to `chains.sepolia` (or `chains.optimismSepolia` if you deployed to OP Sepolia)

💻 View your frontend at http://localhost:3000 and verify you see the correct network.

📡 When you are ready to ship the frontend app...

📦 Run `yarn vercel` to package up your frontend and deploy.

> You might need to log in to Vercel first by running `yarn vercel:login`. Once you log in (email, GitHub, etc), the default options should work.

> If you want to redeploy to the same production URL you can run `yarn vercel --prod`. If you omit the `--prod` flag it will deploy it to a preview/test URL.

> Follow the steps to deploy to Vercel. It'll give you a public URL.

> 🦊 Since we have deployed to a public testnet, you will now need to connect using a wallet you own or use a burner wallet. By default 🔥 `burner wallets` are only available on `hardhat` . You can enable them on every chain by setting `onlyLocalBurnerWallet: false` in your frontend config (`scaffold.config.ts` in `packages / nextjs / `)

#### Configuration of Third-Party Services for Production-Grade Apps.

By default, 🏗 Scaffold-ETH 2 provides predefined API keys for popular services such as Alchemy and Etherscan. This allows you to begin developing and testing your applications more easily, avoiding the need to register for these services.
This is great to complete your **SpeedRunEthereum**.

For production-grade applications, it's recommended to obtain your own API keys (to prevent rate limiting issues). You can configure these at:

- 🔷`ALCHEMY_API_KEY` variable in `packages / hardhat /.env` and `packages / nextjs /.env.local`. You can create API keys from the [Alchemy dashboard](https://dashboard.alchemy.com/).

- 📃`ETHERSCAN_API_KEY` variable in `packages / hardhat /.env` with your generated API key. You can get your key [here](https://etherscan.io/myapikey).

> 💬 Hint: It's recommended to store env's for nextjs in Vercel/system env config for live apps and use .env.local for local testing.

---

## Checkpoint 4: 📜 Contract Verification

Run the `yarn verify--network your_network` command to verify your contracts on etherscan 🛰

👉 Search this address on [Sepolia Etherscan](https://sepolia.etherscan.io/) (or [Optimism Sepolia Etherscan](https://sepolia-optimism.etherscan.io/) if you deployed to OP Sepolia) to get the URL you submit to 🏃‍♀️[SpeedRunEthereum.com](https://speedrunethereum.com).

---

> 🏃 Head to your next challenge [here](https://speedrunethereum.com).

> 💬 Problems, questions, comments on the stack? Post them to the [🏗 scaffold-eth developers chat](https://t.me/joinchat/F7nCRK3kI93PoCOk)

## Documentation

Visit our [docs](https://docs.scaffoldeth.io) to learn how to start building with Scaffold-ETH 2.

To know more about its features, check out our [website](https://scaffoldeth.io).

## Contributing to Scaffold-ETH 2

We welcome contributions to Scaffold-ETH 2!

Please see [CONTRIBUTING.MD](https://github.com/scaffold-eth/scaffold-eth-2/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to Scaffold-ETH 2.
