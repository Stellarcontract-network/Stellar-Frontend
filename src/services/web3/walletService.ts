import type { Eip1193Provider, WalletSession } from './provider';

export class WalletService {
  private session: WalletSession | null = null;

  constructor(private readonly provider: Eip1193Provider) {}

  async connect(): Promise<WalletSession> {
    const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
    if (!Array.isArray(accounts) || typeof accounts[0] !== 'string') {
      throw new Error('No wallet account is available');
    }

    const chainId = await this.provider.request({ method: 'eth_chainId' });
    if (typeof chainId !== 'string') {
      throw new Error('The wallet returned an invalid chain ID');
    }

    this.session = { address: accounts[0], chainId: normalizeChainId(chainId) };
    return this.getSession() as WalletSession;
  }

  disconnect(): void {
    this.session = null;
  }

  async switchNetwork(chainId: number | string): Promise<void> {
    const normalizedChainId = normalizeChainId(chainId);
    await this.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: normalizedChainId }],
    });

    if (this.session) {
      this.session = { ...this.session, chainId: normalizedChainId };
    }
  }

  getSession(): WalletSession | null {
    return this.session ? { ...this.session } : null;
  }
}

function normalizeChainId(chainId: number | string): string {
  let numericChainId: bigint;

  try {
    if (typeof chainId === 'number') {
      if (!Number.isSafeInteger(chainId)) {
        throw new Error();
      }
      numericChainId = BigInt(chainId);
    } else if (/^0x[0-9a-f]+$/i.test(chainId) || /^\d+$/.test(chainId)) {
      numericChainId = BigInt(chainId);
    } else {
      throw new Error();
    }
  } catch {
    throw new Error('Invalid chain ID');
  }

  if (numericChainId <= 0n) {
    throw new Error('Invalid chain ID');
  }

  return `0x${numericChainId.toString(16)}`;
}