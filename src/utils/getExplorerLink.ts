import { ChainId, DEFAULT_CHAIN_ID } from 'constants/chains';

//TODO
const EXPLORER_PREFIXES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: 'bscscan.com',
  [ChainId.TESTNET]: 'sepolia.scrollscan.dev',
};

export const DEFAULT_EXPLORER = {
  [DEFAULT_CHAIN_ID]:
    'https://explorer.goerli.linea.build/tx/0xf75d0644bb1971377d8bd528a88b3241a08985be47e75de41aff8e35d42e04f4',
};

export enum ExplorerDataType {
  TRANSACTION = 'tx',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 */
export function getExplorerLink(chainId: ChainId, data: string, type: ExplorerDataType): string {
  const prefix = `https://${EXPLORER_PREFIXES[chainId] || EXPLORER_PREFIXES[ChainId.MAINNET]}`;

  switch (type) {
    case ExplorerDataType.TRANSACTION: {
      return `${prefix}/tx/${data}`;
    }
    case ExplorerDataType.TOKEN: {
      return `${prefix}/token/${data}`;
    }
    case ExplorerDataType.BLOCK: {
      return `${prefix}/block/${data}`;
    }
    case ExplorerDataType.ADDRESS:
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}
