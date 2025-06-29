import React from 'react';
import { Card } from 'react-bootstrap';
import './SkeletonCard.css';

const PetSilhouette = () => (
  <svg className="skeleton-silhouette" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2">
    <path d="M425.793 253.345c0-43.214-35.038-78.252-78.252-78.252-43.214 0-78.252 35.038-78.252 78.252 0 43.214 35.038 78.252 78.252 78.252 43.214 0 78.252-35.038 78.252-78.252m-252.617 15.65c0-29.076-23.593-52.669-52.669-52.669-29.076 0-52.669 23.593-52.669 52.669 0 29.076 23.593 52.669 52.669 52.669 29.076 0 52.669-23.593 52.669-52.669m-1.756 122.062c0-36.958-29.924-66.883-66.883-66.883-36.958 0-66.883 29.925-66.883 66.883 0 36.958 29.925 66.883 66.883 66.883 36.959 0 66.883-29.925 66.883-66.883m221.434-1.755c0-35.2-28.579-63.779-63.779-63.779-35.2 0-63.779 28.579-63.779 63.779 0 35.2 28.579 63.779 63.779 63.779 35.2 0 63.779-28.579 63.779-63.779"/>
  </svg>
);

const SkeletonCard = () => {
  return (
    <Card className="skeleton-card h-100 shadow-sm">
      <div className="skeleton-card-img">
        <PetSilhouette />
      </div>
      <Card.Body>
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-subtitle" />
      </Card.Body>
      <Card.Footer>
        <div className="skeleton-line skeleton-button" />
      </Card.Footer>
    </Card>
  );
};

export default SkeletonCard; 