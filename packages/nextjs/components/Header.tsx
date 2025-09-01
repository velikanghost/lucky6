"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { CubeIcon } from "@heroicons/react/24/outline";
import { GameWalletFunding } from "~~/components/GameWalletFunding";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useGameWallet } from "~~/hooks/useGameWallet";
import { useMonadGamesId } from "~~/hooks/useMonadGamesId";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Dice Game",
    href: "/dice",
    icon: <CubeIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { username, hasUsername, isLoading: isLoadingUsername, registerUsernameUrl } = useMonadGamesId();
  const { gameWallet } = useGameWallet();

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  const monadDropdownRef = useRef<HTMLDetailsElement>(null);
  const [isMonadDropdownOpen, setIsMonadDropdownOpen] = useState(false);

  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  useOutsideClick(monadDropdownRef, () => {
    setIsMonadDropdownOpen(false);
    monadDropdownRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="Lucky6 logo" className="cursor-pointer" fill sizes="40px" src="/lucky6-logo.png" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Lucky6</span>
            <span className="text-xs">Dice Game</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>

      <div className="navbar-end grow mr-4">
        {/* Monad Games ID Display with Dropdown */}
        <div className="navbar-center hidden lg:flex">
          {isLoadingUsername ? (
            <div className="text-sm opacity-70">Loading Monad ID...</div>
          ) : hasUsername && username ? (
            <details className="dropdown" ref={monadDropdownRef}>
              <summary
                className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full cursor-pointer hover:bg-primary/20"
                onClick={() => setIsMonadDropdownOpen(!isMonadDropdownOpen)}
              >
                <span className="text-sm font-medium text-primary">@{username}</span>
                <span className="text-xs opacity-70">Monad Games ID</span>
              </summary>
              <div className="dropdown-content mt-2 p-4 bg-base-100 rounded-box shadow-lg min-w-80">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg">Game Wallet</h3>
                  <p className="text-sm opacity-70">@{username}</p>
                </div>
                {gameWallet && <GameWalletFunding gameWallet={gameWallet} monadGamesIdWallet={null} />}
              </div>
            </details>
          ) : hasUsername === false ? (
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">No Monad ID</span>
              <a
                href={registerUsernameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs btn-primary normal-case"
              >
                Register
              </a>
            </div>
          ) : null}
        </div>
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
