import React from 'react';
import Image from './Image';

const PlaceImg = ({ place, index = 0, className = '' }) => {
  if (!place.photos?.length) return '';

  if (!className) {
    className = 'object-cover';
  }

  return <Image className={className} src={place.photos[index]} />;
};

export default PlaceImg;
