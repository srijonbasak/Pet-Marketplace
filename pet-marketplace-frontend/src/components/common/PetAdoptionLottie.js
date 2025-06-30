import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/Animation - 1751286209431.json';

const PetAdoptionLottie = ({ style }) => (
  <Lottie animationData={animationData} loop={true} style={style} />
);

export default PetAdoptionLottie;
