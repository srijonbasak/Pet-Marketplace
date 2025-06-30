import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/Animation - 1751282861435.json';


const HomeLottieAnimation = ({ style }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.18))',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(6px)',
      boxShadow: '0 4px 32px 0 rgba(0,0,0,0.12)',
      padding: 16,
      ...style,
    }}
  >
    <Lottie
      animationData={animationData}
      loop={true}
      style={{ width: '100%', height: '100%' }}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
    />
  </div>
);

export default HomeLottieAnimation;
