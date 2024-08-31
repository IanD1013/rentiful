import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const PlacesPage = () => {
  const { action } = useParams();

  return (
    <div>
      {action !== 'new' && (
        <div className="text-center">
          <Link className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full" to={'/account/places/new'}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add new place
          </Link>
        </div>
      )}

      {action === 'new' && (
        <div>
          <form>
            <h2 className="text-2xl mt-4">Title</h2>
            <p className="text-gray-500 text-sm">title for your place, should be short and catchy as in advertisement</p>
            <input type="text" placeholder="title, for example: My lovely apartment" />

            <h2 className="text-2xl mt-4">Address</h2>
            <p className="text-gray-500 text-sm">Address to this place</p>
            <input type="text" placeholder="address" />

            <h2 className="text-2xl mt-4">Photos</h2>
            <p className="text-gray-500 text-sm">More = better</p>
            <div className="mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              <button className="border bg-transparent rounded-2xl p-8 text-2xl text-gray-600">+</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlacesPage;
