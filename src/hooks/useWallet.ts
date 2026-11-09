import { useState } from 'react';
import type { WalletSession } from '../services/web3/provider';
import { WalletService } from '../services/web3/walletService';

export function useWallet(service: WalletService) {
  const [session, setSession] = useState<WalletSession | null>(() => service.getSession());

  const connect = async () => {
    const nextSession = await service.connect();
    setSession(nextSession);
    return nextSession;
  };

  const disconnect = () => {
    service.disconnect();
    setSession(null);
  };

  const switchNetwork = async (chainId: number | string) => {
    await service.switchNetwork(chainId);
    setSession(service.getSession());
  };

  return { session, connect, disconnect, switchNetwork };
}