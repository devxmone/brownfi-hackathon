import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';

import { useActiveWeb3React } from 'hooks/web3';

import 'inter-ui';
import './i18n';

import Blocklist from './components/Blocklist';
import { NetworkContextName } from './constants/misc';
import App from './pages/App';
import ApplicationUpdater from './state/application/updater';
import ListsUpdater from './state/lists/updater';
import MulticallUpdater from './state/multicall/updater';
import TransactionUpdater from './state/transactions/updater';
import UserUpdater from './state/user/updater';
import getLibrary from './utils/getLibrary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import store from './state';
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from './theme';

import './index.css';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

function Updaters() {
  return (
    <>
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <ExposeProvider />
        <Blocklist>
          <Provider store={store}>
            <Updaters />
            <ThemeProvider>
              <ThemedGlobalStyle />
              <HashRouter>
                <App />
              </HashRouter>
            </ThemeProvider>
          </Provider>
        </Blocklist>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </StrictMode>,
);

declare global {
  interface Window {
    $getLibrary: typeof getLibrary;
  }
}
function ExposeProvider() {
  const { library } = useActiveWeb3React();
  window.$getLibrary = () => library!;
  return null;
}

serviceWorkerRegistration.unregister();
