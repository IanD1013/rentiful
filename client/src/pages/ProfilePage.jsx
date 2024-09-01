import axios from 'axios';
import { useContext, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import AccountNav from '../components/AccountNav';
import { UserContext } from '../UserContext';
import PlacesPage from './PlacesPage';

const ProfilePage = () => {
  const [redirect, setRedirect] = useState(null);
  const { user, ready, setUser } = useContext(UserContext);
  let { subpage } = useParams();

  if (subpage === undefined) subpage = 'profile';

  async function logout() {
    await axios.post('/logout');
    setRedirect('/');
    setUser(null);
  }

  if (!ready) return <div>Loading...</div>;

  if (ready && !user && !redirect) return <Navigate to="/login" />;

  if (redirect) return <Navigate to={redirect} />;

  return (
    <div>
      <AccountNav />

      {subpage === 'profile' && (
        <div className="text-center max-w-lg mx-auto">
          Logged in as {user.name} ({user.email}) <br />
          <button onClick={logout} className="primary max-w-sm mt-2">
            Logout
          </button>
        </div>
      )}

      {subpage === 'places' && <PlacesPage />}
    </div>
  );
};

export default ProfilePage;
