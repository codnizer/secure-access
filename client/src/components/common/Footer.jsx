import React from 'react';

const Footer = () => {
  return (
    <footer className="footer footer-center p-4 bg-base-300 text-base-content mt-8">
      <aside>
        <p>Copyright © {new Date().getFullYear()} - SecureAccess System</p>
      </aside>
    </footer>
  );
};

export default Footer;