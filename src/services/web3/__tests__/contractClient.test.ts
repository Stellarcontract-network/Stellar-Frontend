import { Interface } from 'ethers';
import type { Eip1193Provider, Eip1193RequestArguments } from '../provider';
import { callContract } from '../contractClient';

const address = '0x1234567890123456789012345678901234567890';
const abi = ['function balanceOf(address) view returns (uint256)'];

describe('contract client', () => {
  it('mocks an eth_call response and decodes the contract result', async () => {
    const contractInterface = new Interface(abi);
    const response = contractInterface.encodeFunctionResult('balanceOf', [42n]);
    const request = jest.fn<Promise<unknown>, [Eip1193RequestArguments]>().mockResolvedValue(response);
    const provider: Eip1193Provider = { request };

    const result = await callContract(provider, address, abi, 'balanceOf', [address]);

    expect(result[0]).toBe(42n);
    expect(request).toHaveBeenCalledWith({
      method: 'eth_call',
      params: [
        {
          to: address,
          data: contractInterface.encodeFunctionData('balanceOf', [address]),
        },
        'latest',
      ],
    });
  });
});