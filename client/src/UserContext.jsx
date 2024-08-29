import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext({});

// eslint-disable-next-line react/prop-types
export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    // without this when refresh the page we dont have the context anymore, this is
    // because when we load the app, we should grab login status. We have the cookie
    // but we dont have context because we are only setting context at the login
    // page when we logged in. If user is empty, try to fetch the user from the server
    if (!user) {
      axios.get('/profile').then(({ data }) => {
        setUser(data);
      });
    }
  }, []);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}
