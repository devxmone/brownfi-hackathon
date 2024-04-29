//TODO
export enum ChainId {
  MAINNET = 534352,
  TESTNET = 534351,
}

export type ChainIdValue = `${ChainId}` extends `${infer T extends number}` ? T : never;
// TODO
export const DEFAULT_CHAIN_ID = '0x8274f';
export const DEFAULT_NETWORK_NAME = 'Scroll Testnet';

export const NETWORK_URLS: {
  [chainId in ChainId]: string;
} = {
  [ChainId.MAINNET]: `https://scroll-mainnet.public.blastapi.io	`,
  [ChainId.TESTNET]: `https://sepolia-rpc.scroll.io	`,
};

export const DEFAULT_NETWORK_URL = {
  [DEFAULT_CHAIN_ID]: 'https://sepolia-rpc.scroll.io	',
};
