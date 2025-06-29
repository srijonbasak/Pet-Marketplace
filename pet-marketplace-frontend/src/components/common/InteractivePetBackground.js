import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, useVelocity, useMotionValue, useAnimationFrame } from 'framer-motion';
import LaserPointerCursor from './LaserPointerCursor';
import './InteractivePetBackground.css';

// Using local assets for reliability
const pets = [
  { 
    id: 'cat', 
    url: '/cat.png', // A cute, peeking cat from the public folder
    stiffness: 220, damping: 30, mass: 1,
    xOffset: -50, yOffset: 20
  },
  { 
    id: 'dog', 
    url: '/dog.png', // A happy Corgi from the public folder
    stiffness: 120, damping: 25, mass: 1.5,
    xOffset: 50, yOffset: 100
  },
];

const Pet = ({ pet, target }) => {
  const x = useSpring(0, { stiffness: pet.stiffness, damping: pet.damping, mass: pet.mass });
  const y = useSpring(0, { stiffness: pet.stiffness, damping: pet.damping, mass: pet.mass });

  const velocityX = useVelocity(x);
  const velocityY = useVelocity(y);
  const velocity = useTransform(
    [velocityX, velocityY],
    ([latestX, latestY]) => Math.sqrt(Math.pow(latestX, 2) + Math.pow(latestY, 2))
  );

  const rotate = useTransform(velocity, [0, 1000], [0, 30], { clamp: false });
  const scale = useTransform(velocity, [0, 500], [1, 1.3], { clamp: false });

  useAnimationFrame(() => {
    const targetPos = target.get();
    x.set(targetPos.x);
    y.set(targetPos.y);
  });

  return (
    <motion.div
      className="interactive-pet"
      style={{
        x,
        y,
        rotate,
        scale,
      }}
    >
      <img src={pet.url} alt={pet.id} />
    </motion.div>
  );
};

const InteractivePetBackground = () => {
  const [isHovered, setIsHovered] = useState(false);
  const laserPosition = useMotionValue({ x: -100, y: -100 });

  const handlePositionChange = (pos) => {
    laserPosition.set(pos);
  };

  return (
    <div 
      className="interactive-pet-background" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && <LaserPointerCursor onPositionChange={handlePositionChange} />}
      <div className="pet-container">
        {pets.map((pet, i) => (
          <Pet key={i} pet={pet} target={laserPosition} />
        ))}
      </div>
    </div>
  );
};

export default InteractivePetBackground; 