const PERIPHERY_TESTNET = {
  factory: '0x77876Cf69B8B0C6802E5A882a39E08f9CfC20F33',
  weth9: '0x5300000000000000000000000000000000000004',
  router: '0x7524856bB5af50F9A131D79e872E845645f9Dd5d',
  mockUSDC: '0xf56dc6695cF1f5c364eDEbC7Dc7077ac9B586068',
  multicall2: '0xE48e433a1e82bfAbB6A81aFE3f2B120eF5A45643',
  miniChef: '0x11D04b3FB27Cf54e35f5c5671Bf39562ADbeB332',
  appToken: '0xbEe409165B84c3f5a1C769a6e9e515eC7B4B955c',
};

//TODO
const MAINNET_PERIPHERY = {
  factory: '0x77876Cf69B8B0C6802E5A882a39E08f9CfC20F33',
  weth9: '0x5300000000000000000000000000000000000004',
  router: '0x7524856bB5af50F9A131D79e872E845645f9Dd5d',
  multicall2: '0x8c181f4B9040F1a2C941EfD3b608712cF86F1957',
  minichef: '0x3A5E791405526EFaDf1432Bac8d114B77Da3628c',
  appToken: '0x8E9851cF4edd2Cf688Ef4964236087754621bF12',
  USDC: '0xf56dc6695cF1f5c364eDEbC7Dc7077ac9B586068',
};

const TESTNET_STABLE_PAIRS: string[] = [];

const MAINNET_STABLE_PAIRS: string[] = [];

export const MAINNET = {
  ...MAINNET_PERIPHERY,
  stablePairs: MAINNET_STABLE_PAIRS,
  airdrop: '0xb9A52744213eA63D57F389622e1d569Bb4705207',
  xappToken: '0xdf0D02351A3e7A21D3936cf1CFd1ee554Cee0a80',
};

export const TESTNET = {
  ...PERIPHERY_TESTNET,
  stablePairs: TESTNET_STABLE_PAIRS,
  airdrop: '0x2F7Ad6172388aED2017FBfA1631724F172360Ab1',
  xappToken: '0xa1C7DAE5EFc171C25672555Fe8A9d9ceB13341C2', // true one is '0x3A5E791405526EFaDf1432Bac8d114B77Da3628c',
};
