import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AnimatedCard from './AnimatedCard';
import SkeletonCard from './SkeletonCard';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const FeaturedPetsCarousel = ({ pets, loading }) => {
  if (loading) {
    return (
      <Swiper
        modules={[Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
        }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <SwiperSlide key={index}>
            <SkeletonCard />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop={true}
      breakpoints={{
        768: { slidesPerView: 2 },
        992: { slidesPerView: 3 },
      }}
    >
      {pets.map(pet => (
        <SwiperSlide key={pet._id}>
          <AnimatedCard className="pet-card">
            <Card.Img variant="top" src={pet.images?.[0]?.url || 'https://via.placeholder.com/250x250'} alt={pet.name} className="pet-card-img" />
            <Card.Body>
              <Card.Title>{pet.name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">{pet.breed}</Card.Subtitle>
            </Card.Body>
            <Card.Footer>
              <Link to={`/pets/${pet._id}`} className="btn btn-sm btn-primary w-100">
                View Details
              </Link>
            </Card.Footer>
          </AnimatedCard>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default FeaturedPetsCarousel; 