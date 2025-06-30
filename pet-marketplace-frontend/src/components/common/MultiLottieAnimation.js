import React from 'react';
import Lottie from 'lottie-react';

import animation1 from '../../assets/Animation - 1751282696187.json';
import animation2 from '../../assets/Animation - 1751282739623.json';

const animations = [animation1, animation2];

const positions = [
  { top: '0%', left: '-5%', width: '65%' },
  { top: '25%', left: '45%', width: '65%' },
];

const MultiLottieAnimation = ({ style }) => (
  <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
    {animations.map((anim, idx) => (
      <div
        key={idx}
        style={{
          position: 'absolute',
          ...positions[idx],
          opacity: 0.92 - idx * 0.12,
          filter: 'none',
          pointerEvents: 'none',
        }}
      >
        <Lottie animationData={anim} loop={true} style={{ width: '100%', height: '100%' }} />
      </div>
    ))}
  </div>
);

export default MultiLottieAnimation;
