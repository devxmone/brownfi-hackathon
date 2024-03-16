//TODO
export enum ChainId {
  MAINNET = 59144,
  TESTNET = 59140,
}

export type ChainIdValue = `${ChainId}` extends `${infer T extends number}` ? T : never;
// TODO
export const DEFAULT_CHAIN_ID = '0xe704';
export const DEFAULT_NETWORK_NAME = 'Linea Testnet';

export const NETWORK_URLS: {
  [chainId in ChainId]: string;
} = {
  [ChainId.MAINNET]: `https://mainnet.infura.io/v3/`,
  [ChainId.TESTNET]: `https://linea-goerli.blockpi.network/v1/rpc/public`,
};

export const DEFAULT_NETWORK_URL = {
  [DEFAULT_CHAIN_ID]: 'https://linea-goerli.blockpi.network/v1/rpc/public',
};
