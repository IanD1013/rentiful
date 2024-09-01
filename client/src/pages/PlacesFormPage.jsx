import axios from 'axios';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AccountNav from '../components/AccountNav';
import Perks from '../components/Perks';
import PhotosUploader from '../components/PhotosUploader';

const PlacesFormPage = () => {
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get('/places/' + id).then((response) => {
      const { title, address, photos, description, perks, extraInfo, checkIn, checkOut, maxGuests } = response.data;
      setTitle(title);
      setAddress(address);
      setAddedPhotos(photos);
      setDescription(description);
      setPerks(perks);
      setExtraInfo(extraInfo);
      setCheckIn(checkIn);
      setCheckOut(checkOut);
      setMaxGuests(maxGuests);
    });
  }, [id]);

  function inputHeader(text) {
    return <h2 className="text-2xl mt-4">{text}</h2>;
  }

  function inputDescription(text) {
    return <p className="text-gray-500 text-sm">{text}</p>;
  }

  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  async function savePlace(e) {
    e.preventDefault();
    const placeData = { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests };

    if (id) {
      // update
      await axios.put('/places', { id, ...placeData });
      setRedirect(true);
    } else {
      // create
      await axios.post('/places', placeData);
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to="/account/places" />;
  }

  return (
    <div>
      <AccountNav />

      <form onSubmit={savePlace}>
        {preInput('Title', 'Title for your place, should be short and catchy as in advertisement')}
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title, for example: My lovely apartment" />

        {preInput('Address', 'Address to this place')}
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="address" />

        {preInput('Photos', 'More = better')}
        <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

        {preInput('Description', 'Description of the place')}
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        {preInput('Perks', 'Select all the perks of your place')}
        <Perks selected={perks} onChange={setPerks} />

        {preInput('Extra info', 'House rules, etc')}
        <textarea value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} />

        {preInput('Check in & out times', 'Add check in and out times, remember to have some time window for cleaning the room between guests')}
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <h3 className="mt-2 -mb-1">Check in time</h3>
            <input type="text" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} placeholder="14" />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Check out time</h3>
            <input type="text" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} placeholder="11" />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Max number of guests</h3>
            <input type="number" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} />
          </div>
        </div>

        <button className="primary my-4">Save</button>
      </form>
    </div>
  );
};

export default PlacesFormPage;
