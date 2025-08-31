"use client";

import Link from "next/link";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Lucky6</span>
            <span className="block text-xl font-bold">The Ultimate Dice Game on Monad</span>
            <span className="block text-xl mt-2">Test Your Luck on the Fastest Blockchain</span>
          </h1>

          <div className="flex items-center flex-col flex-grow">
            <div className="px-5">
              <div className="flex flex-col items-center justify-center">
                <div className="max-w-3xl mt-8">
                  <div className="bg-base-100 p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-center">How to Play</h2>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <h3 className="font-semibold">Objective</h3>
                          <p>Roll a 6 to win! Each roll costs 0.002 ETH and gives you a chance to hit the jackpot.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <h3 className="font-semibold">Prize Pool</h3>
                          <p>
                            40% of your bet goes to the prize pool, 60% stays in the contract for future prizes. When
                            someone wins, the new prize starts at 10% of the total contract balance.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <h3 className="font-semibold">Monad Advantage</h3>
                          <p>
                            Experience lightning-fast transactions and minimal gas fees on Monad&apos;s high-performance
                            blockchain.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🎮</span>
                        <div>
                          <h3 className="font-semibold">Ready to Play?</h3>
                          <p>
                            Connect your wallet and start rolling! Remember, it&apos;s all about luck - but with
                            Monad&apos;s speed, you can roll as many times as you want!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-8">
                    <Link href="/dice" passHref>
                      <button className="btn btn-primary btn-lg text-lg px-8 py-4">🎲 Launch Game</button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
