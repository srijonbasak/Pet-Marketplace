import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/Animation - 1751286545783.json';

const RescueLottie = ({ style }) => (
  <Lottie animationData={animationData} loop={true} style={style} />
);

export default RescueLottie;
