import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './LaserPointerCursor.css';

const LaserPointerCursor = ({ onPositionChange }) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newPos = { x: e.clientX, y: e.clientY };
      setPosition(newPos);
      if (onPositionChange) {
        onPositionChange(newPos);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onPositionChange]);

  return (
    <motion.div
      className="laser-dot"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 800, damping: 40 }}
    />
  );
};

export default LaserPointerCursor; 