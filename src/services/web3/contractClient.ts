import { Interface, type InterfaceAbi, type Result } from 'ethers';
import type { Eip1193Provider } from './provider';

export async function callContract(
  provider: Eip1193Provider,
  address: string,
  abi: InterfaceAbi,
  method: string,
  args: readonly unknown[] = [],
): Promise<Result> {
  const contractInterface = new Interface(abi);
  const data = contractInterface.encodeFunctionData(method, [...args]);
  const response = await provider.request({
    method: 'eth_call',
    params: [{ to: address, data }, 'latest'],
  });

  if (typeof response !== 'string') {
    throw new Error('The contract provider returned an invalid response');
  }

  return contractInterface.decodeFunctionResult(method, response);
}