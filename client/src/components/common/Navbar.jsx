import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl normal-case">
          SecureAccess
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
          {/* Add more links as your app grows */}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;