import { FC } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

import styled from 'styled-components/macro';

import { AccountElement } from 'components/Header';
import SocialRow from 'components/Social';
import Web3Status from 'components/Web3Status';

import BannerImg2 from 'assets/images/background-2.png';
import BannerImg from 'assets/images/banner.webp';
import Banner1Img from 'assets/images/banner-1.png';
import BrownFi from 'assets/images/brownfi.png';

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > div {
    padding: 0 56px;
    color: ${({ theme }) => theme.primary1};
    text-align: center;
    font-size: 42px;
    font-weight: 700;
    letter-spacing: -1.68px;
    text-align: center;

    &:not(:last-of-type) {
      position: relative;

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 37px;
        width: 1px;
        background: ${({ theme }) => theme.primary1};
      }
    }

    p {
      color: ${({ theme }) => theme.bg1};
      font-size: 14px;
      font-weight: 400;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
      display: flex;
      flex-direction: column;
      
      > div {
        padding: 32px 0;

        &:not(:last-of-type) {
          position: relative;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            top: auto;
            left: 50%;
            right: auto;
            transform: translate(-50%, -50%);
            height: 1px;
            width: 110px;
            background: ${({ theme }) => theme.primary1};
          }
        }
      }
    `};
`;

const Card = styled.div`
  border-radius: 13px;
  background: ${() => `#fff url(${BrownFi}) center center no-repeat`};
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 33px 30px 19px;
  text-align: left;
  color: ${({ theme }) => theme.black};
  font-size: 14px;
  font-weight: 400;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  h5 {
    color: ${({ theme }) => theme.primary1};
    margin: 0 0 15px;
    font-size: 29px;
    font-weight: 700;
  }

  > div {
    margin: 0 0 15px;
  }

  > div {
    width: fit-content;
  }
`;

const ImgClass = 'w-[100%] absolute h-[100%] object-cover top-0 left-0';
const CenterClass =
  'text-center w-[100%] m-[0_auto] z-[1] relative p-[16px] xl:p-[0_16px] max-w-[768px] xl:max-w-[1436px] flex flex-col items-center';

const Home: FC = () => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <main className='w-[100%]'>
      <div className='grid-cols-1	xl:grid-cols-2' />
      <section className='relative p-[137px_0] h-[100vh] flex items-center min-h-[500px]'>
        <img src={BannerImg} alt='' className={ImgClass} />
        <div className={CenterClass}>
          <img className='w-[100%] max-w-[569px] m-[0_auto_12.5px]' src={Banner1Img} alt='' />
          <div>
            <h1 className='text-bg1 text-[46px] font-[700] mb-[14px]'>BROWN SWAP</h1>
            <h5 className='text-bg1 text-[16px] md:text-[22px] xl:text-[29px] md:mt-0 font-[400] mb-[27px]'>
              Swap and earn with the most trusted DEX on EVM
            </h5>
            <div className='flex gap-[18px] items-center justify-center'>
              <SocialRow />
              <AccountElement active style={{ pointerEvents: 'auto' }}>
                <Web3Status />
              </AccountElement>
            </div>
          </div>
        </div>
      </section>

      <section className='relative p-[100px_0] flex items-center min-h-[500px]'>
        <img src={BannerImg2} alt='' className={ImgClass} />

        <div className={CenterClass}>
          <FeatureItem>
            <div ref={ref}>
              <CountUp start={0} end={inView ? 124.66 : 0} duration={3} separator='.' useEasing={true}>
                {({ countUpRef }) => <span ref={countUpRef} />}
              </CountUp>
              K <p>Trade Volume</p>
            </div>
            <div>
              <CountUp start={0} end={inView ? 345.66 : 0} duration={3} separator='.' useEasing={true}>
                {({ countUpRef }) => <span ref={countUpRef} />}
              </CountUp>
              M <p>Staked Reward</p>
            </div>
            <div>
              <CountUp start={0} end={inView ? 54 : 0} duration={3} separator='.' useEasing={true}>
                {({ countUpRef }) => <span ref={countUpRef} />}
              </CountUp>
              M <p>Farm Reward</p>
            </div>
          </FeatureItem>

          <div className='grid grid-cols-1 xl:grid-cols-2 justify-center gap-[12px] max-w-[900px] m-[63px_auto]'>
            <Card>
              <div>
                <h5>#1 Native DEX on EVM</h5>
                <p>BrownFi allows you to earn more rewards through Concentrated Liquidity Market Maker (CLMM).</p>
              </div>
              <AccountElement active style={{ pointerEvents: 'auto' }}>
                <Web3Status />
              </AccountElement>
            </Card>

            <div className='grid grid-cols-1 justify-center gap-[12px] max-w-[900px]'>
              {[
                { title: 'Swap', desc: 'Swap any token on EVM in seconds, just by connecting your wallet.' },
                { title: 'Stake', desc: 'Stake token and earn reward' },
                { title: 'Farm', desc: 'Farm LP token and earn token reward' },
              ].map(({ title, desc }, index) => (
                <div
                  key={index}
                  className='rounded-[13px] bg-[#f8f8f8] p-[23px_19px_19px] text-left text-black text-[14px] font-[400]'
                >
                  <h5 className='text-primary1 text-[20px] font-[700] m-0'>{title}</h5>
                  {desc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
