'use client';

import { useGetAuthUserQuery } from '@/state/api';
import { useParams } from 'next/navigation';
import ImagePreviews from './ImagePreviews';

const SingleListing = () => {
  const { id } = useParams();
  const propertyId = Number(id);
  const { data: authUser } = useGetAuthUserQuery();

  return (
    <div>
      <ImagePreviews images={['/singlelisting-2.jpg', '/singlelisting-3.jpg']} />
    </div>
  );
};

export default SingleListing;
