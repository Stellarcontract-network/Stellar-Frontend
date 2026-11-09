export interface Eip1193RequestArguments {
  method: string;
  params?: readonly unknown[];
}

export interface Eip1193Provider {
  request(args: Eip1193RequestArguments): Promise<unknown>;
}

export interface WalletSession {
  address: string;
  chainId: string;
}