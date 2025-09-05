import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUserPlus, FaBuilding, FaVideo, FaClipboardList, FaChartLine, FaCubes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Import useAuth

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get the logout function

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext
  };

  const dashboardItems = [
    { name: 'Personnel Management', icon: <FaUserPlus className="text-4xl text-primary" />, path: '/admin/personnel' },
    { name: 'Emplacement Management', icon: <FaBuilding className="text-4xl text-info" />, path: '/admin/emplacements' },
    { name: 'Guard Management', icon: <FaUserShield className="text-4xl text-warning" />, path: '/admin/guards' },
    { name: 'Kiosk Devices', icon: <FaVideo className="text-4xl text-success" />, path: '/admin/kiosks' },
    { name: 'Requests & Logs', icon: <FaClipboardList className="text-4xl text-error" />, path: '/admin/requests-logs' },
    { name: 'Daily Summaries', icon: <FaChartLine className="text-4xl text-secondary" />, path: '/admin/daily-summaries' },
    { name: 'Blockchain Monitor', icon: <FaCubes className="text-4xl text-accent" />, path: '/admin/blockchain' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            className="card card-compact bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow duration-300"
            onClick={() => navigate(item.path)}
          >
            <div className="card-body items-center text-center">
              {item.icon}
              <h2 className="card-title mt-4">{item.name}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;