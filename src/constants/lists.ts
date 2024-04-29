// used to mark unsupported tokens, these are hosted lists of unsupported tokens
//TODO
const SWAP_LIST =
  'https://gist.githubusercontent.com/devxmone/f9381f330b2905431f8d1a89f8dbc81b/raw/61f7cb799289bc3a786f1aa459c0d220887015e9/gistfile1.json';

export const UNSUPPORTED_LIST_URLS: string[] = [];
// export const UNSUPPORTED_LIST_URLS: string[] = [BA_LIST]

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  SWAP_LIST,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
];

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [SWAP_LIST];
