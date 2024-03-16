import { FC } from 'react';

import { SOCIAL } from 'components/Menu';

const SocialRow: FC = () => (
  <div className='flex items-center justify-center'>
    {SOCIAL.map(({ link, icon, text }, index) => (
      <div className='p-[0_20px]' key={index}>
        <a href={link}>
          <img src={icon} alt={text} />
        </a>
      </div>
    ))}
  </div>
);

export default SocialRow;
