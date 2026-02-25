'use client';

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { StarknetConfig, starkscan } from "@starknet-react/core";
import { Header } from "~~/components/Header";
import { CavosProvider } from '@cavos/react';

import { appChains, connectors } from "~~/services/web3/connectors";
import provider from "~~/services/web3/provider";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-stark/useNativeCurrencyPrice";

const Footer = dynamic(
  () => import("~~/components/Footer").then((mod) => mod.Footer),
  { ssr: false }
);

const ScaffoldStarkApp = ({ children }: { children: React.ReactNode }) => {
  useNativeCurrencyPrice();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  return (
    <>
      <div className="flex relative flex-col min-h-screen bg-main">
        {isDarkMode ? (
          <>
            <div className="circle-gradient-dark w-[330px] h-[330px]"></div>
            <div className="circle-gradient-blue-dark w-[330px] h-[330px]"></div>
          </>
        ) : (
          <>
            <div className="circle-gradient w-[330px] h-[330px]"></div>
            <div className="circle-gradient-blue w-[330px] h-[630px]"></div>
          </>
        )}
        <Header />
        <main className="relative flex flex-col flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

export const ScaffoldStarkAppWithProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Configuración de Cavos usando variables de entorno
  const cavosConfig = {
    appId: process.env.NEXT_PUBLIC_CAVOS_APP_ID || '',
    paymasterApiKey: process.env.NEXT_PUBLIC_CAVOS_PAYMASTER_API_KEY || '',
    network: 'sepolia' as const,
    session: {
      defaultPolicy: {
        allowedContracts: [
          process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS || '',
          process.env.NEXT_PUBLIC_STRK_TOKEN_ADDRESS || '',
        ],
        spendingLimits: [
          {
            token: process.env.NEXT_PUBLIC_STRK_TOKEN_ADDRESS || '',
            limit: 1000n * 10n ** 18n, // 1000 STRK (puedes hacer configurable si lo deseas)
          },
        ],
        maxCallsPerTx: 10,
      },
    },
    enableLogging: process.env.NODE_ENV === 'development',
  };

  return (
    <CavosProvider config={cavosConfig}>
      <StarknetConfig
        chains={appChains}
        provider={provider}
        connectors={connectors}
        explorer={starkscan}
      >
        <ScaffoldStarkApp>{children}</ScaffoldStarkApp>
      </StarknetConfig>
    </CavosProvider>
  );
};