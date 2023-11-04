"use client";

import { useIsMounted } from "@/hooks/useIsMounted";
import Link from "next/link";
import { Fragment } from "react";
import { useAccount } from "wagmi";
import WalletList from "@/components/walletList";

export const dynamic = "force-dynamic";

export default function Home() {
  const { isConnected, address } = useAccount();
  const isMounted = useIsMounted();

  // if the component is not mounted, render nothing
  if (!isMounted) return null;

  return (
    <main className="flex flex-col py-6">
      <div className="flex flex-col h-full gap-6 justify-center items-center">
        <Fragment>
          {isConnected && (
            <Link href="/create-wallet">
              <a className="px-4 py-2 bg-blue-500 transition-colors hover:bg-blue-500 rounded-lg font-bold">
                Create New Wallet
              </a>
            </Link>
          )}
          {address && <WalletList address={address} />}
        </Fragment>
      </div>
    </main>
  );
}