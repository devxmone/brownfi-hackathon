import { Suspense } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import styled from 'styled-components/macro';

import Footer from 'components/Footer';

import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader';

import BannerImg from 'assets/images/background-1.png';
import BannerImg2 from 'assets/images/background-2.png';

import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter';
import ErrorBoundary from '../components/ErrorBoundary';
import Header from '../components/Header';
import Polling from '../components/Header/Polling';
import Popups from '../components/Popups';
import Web3ReactManager from '../components/Web3ReactManager';
import { ThemedBackground } from '../theme';
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader';

import { RedirectDuplicateTokenIdsV2 } from './AddLiquidityV2/redirects';
import PoolV2 from './Pool/v2';
import PoolDetails from './PoolDetails/v2';
import { RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects';
import PoolFinder from './PoolFinder';
import RemoveLiquidity from './RemoveLiquidity';
import Swap from './Swap';
const AppWrapper = styled.div<{ isHomePage: boolean }>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: 100vh;
  background: ${() => `url(${BannerImg}) right top no-repeat`};
  background-color: ${({ theme }) => theme.primary1};
  background-size: inherit;
`;

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  flex: 1;
  z-index: 1;
  height: 100vh;
  justify-content: center;
  margin-bottom: 130px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 6rem;
  `};
`;

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: 2;
`;

const ImgBackground = styled.img`
  position: absolute;
  bottom: 0;
`;

export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Route component={GoogleAnalyticsReporter} />
        <Route component={DarkModeQueryParamReader} />
        <Route component={ApeModeQueryParamReader} />
        <AppWrapper isHomePage={location.pathname === '/'}>
          {/* <DisclaimerModal /> */}
          <img src={BannerImg2} alt='' style={{ position: 'absolute', bottom: 150, width: '100%' }} />
          <HeaderWrapper>
            <Header />
          </HeaderWrapper>

          <BodyWrapper>
            <ThemedBackground />
            <Popups />
            <Polling />
            <Web3ReactManager>
              <Switch>
                <Route exact strict path='/' component={Swap} />
                {/* <Route exact strict path='/farm' component={FarmListPage} />
                <Route exact strict path='/farm/:poolId' component={Farm} />

                <Route exact strict path='/assets' component={AssetsListPage} />

                <Route exact strict path='/stake' component={StakingPage} /> */}

                {/* <Route exact strict path="/send" component={RedirectPathToSwapOnly} /> */}
                <Route exact strict path='/swap/:outputCurrency' component={RedirectToSwap} />
                <Route exact strict path='/swap' component={Swap} />

                <Route exact strict path='/pool/import' component={PoolFinder} />
                <Route exact strict path='/pool/v2' component={PoolV2} />
                <Route exact strict path='/pool/v2/:address' component={PoolDetails} />
                {/* <Route exact strict path="/pool" component={Pool} /> */}
                <Redirect from='/pool' to='/pool/v2' />
                {/* <Route exact strict path="/pool/:tokenId" component={PositionPage} /> */}

                <Route
                  exact
                  strict
                  path='/add/v2/:currencyIdA?/:currencyIdB?'
                  component={RedirectDuplicateTokenIdsV2}
                />

                <Route
                  exact
                  strict
                  path='/add/:currencyIdA?/:currencyIdB?/:feeAmount?'
                  component={RedirectDuplicateTokenIdsV2}
                />

                {/* <Route
                  exact
                  strict
                  path="/increase/:currencyIdA?/:currencyIdB?/:feeAmount?/:tokenId?"
                  component={AddLiquidity}
                /> */}

                <Route exact strict path='/remove/v2/:currencyIdA/:currencyIdB' component={RemoveLiquidity} />
                <Route exact strict path='/remove/:currencyIdA/:currencyIdB' component={RemoveLiquidity} />
                {/* <Route exact strict path="/remove/:tokenId" component={RemoveLiquidityV3} /> */}

                {/* <Route exact strict path="/migrate/v2" component={MigrateV2} /> */}
                {/* <Route exact strict path="/migrate/v2/:address" component={MigrateV2Pair} /> */}

                <Route component={RedirectPathToSwapOnly} />
              </Switch>
            </Web3ReactManager>
          </BodyWrapper>

          <Footer />
        </AppWrapper>
      </Suspense>
    </ErrorBoundary>
  );
}
