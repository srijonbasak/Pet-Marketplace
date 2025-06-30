import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/Animation - 1751286590179 (1).json';

const HeroLottie = ({ style }) => (
  <Lottie animationData={animationData} loop={true} style={style} />
);

export default HeroLottie;
