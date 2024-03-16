// used to mark unsupported tokens, these are hosted lists of unsupported tokens
//TODO
const SWAP_LIST = 'https://tokenlist.s3.ap-southeast-1.amazonaws.com/tokenlist.json';

export const UNSUPPORTED_LIST_URLS: string[] = [];
// export const UNSUPPORTED_LIST_URLS: string[] = [BA_LIST]

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  SWAP_LIST,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
];

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [SWAP_LIST];
