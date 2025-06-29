import React from 'react';
import { Card } from 'react-bootstrap';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const hoverEffect = {
  scale: 1.05,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },
};

const AnimatedCard = ({ children, className }) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hoverEffect}
      className="h-100"
    >
      <Card className={`h-100 shadow-sm ${className}`}>
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard; 