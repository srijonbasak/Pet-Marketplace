import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/Animation - 1751286329891.json';

const PetProductLottie = ({ style }) => (
  <Lottie animationData={animationData} loop={true} style={style} />
);

export default PetProductLottie;
