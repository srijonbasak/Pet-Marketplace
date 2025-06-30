import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, useVelocity, useMotionValue, useAnimationFrame } from 'framer-motion';
// import LaserPointerCursor from './LaserPointerCursor';
import './InteractivePetBackground.css';
// LaserPointerCursor logic and import removed

// No pets to display; previously used for laser pointer effect
const pets = [];

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
  // Laser pointer logic removed
  const laserPosition = { get: () => ({ x: 0, y: 0 }) };

  return (
    <div className="interactive-pet-background">
      <div className="pet-container">
        {/* No pets to display */}
      </div>
    </div>
  );
};

export default InteractivePetBackground; 