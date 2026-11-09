import { act, renderHook } from '@testing-library/react';
import type { Eip1193RequestArguments, Eip1193Provider } from '../provider';
import { useWallet } from '../../../hooks/useWallet';
import { WalletService } from '../walletService';

const account = '0x1234567890123456789012345678901234567890';

describe('wallet service', () => {
  let request: jest.Mock<Promise<unknown>, [Eip1193RequestArguments]>;
  let service: WalletService;

  beforeEach(() => {
    request = jest.fn(async ({ method }) => {
      if (method === 'eth_requestAccounts') return [account];
      if (method === 'eth_chainId') return '0x1';
      return null;
    });
    const provider: Eip1193Provider = { request };
    service = new WalletService(provider);
  });

  it('connects the wallet and stores its account and network', async () => {
    const { result } = renderHook(() => useWallet(service));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.session).toEqual({ address: account, chainId: '0x1' });
    expect(request).toHaveBeenNthCalledWith(1, { method: 'eth_requestAccounts' });
    expect(request).toHaveBeenNthCalledWith(2, { method: 'eth_chainId' });
  });

  it('disconnects the wallet session', async () => {
    const { result } = renderHook(() => useWallet(service));

    await act(async () => {
      await result.current.connect();
    });
    act(() => result.current.disconnect());

    expect(result.current.session).toBeNull();
    expect(service.getSession()).toBeNull();
  });

  it('switches network and updates the connected session', async () => {
    const { result } = renderHook(() => useWallet(service));

    await act(async () => {
      await result.current.connect();
      await result.current.switchNetwork(11155111);
    });

    expect(request).toHaveBeenLastCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
    expect(result.current.session).toEqual({ address: account, chainId: '0xaa36a7' });
  });
});