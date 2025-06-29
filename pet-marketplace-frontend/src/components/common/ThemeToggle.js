import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import './ThemeToggle.css';

const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30,
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle" data-theme={theme} onClick={toggleTheme}>
      <FontAwesomeIcon icon={faSun} className="sun-icon" />
      <FontAwesomeIcon icon={faMoon} className="moon-icon" />
      <motion.div className="handle" layout transition={spring} />
    </div>
  );
};

export default ThemeToggle; 