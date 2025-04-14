import Navbar from '@/components/Navbar';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <main className={`h-full flex w-full flex-col pt-[${NAVBAR_HEIGHT}]`}>{children}</main>
    </div>
  );
};

export default Layout;
