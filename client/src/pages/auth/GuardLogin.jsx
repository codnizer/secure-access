import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import { useNavigate, Link } from 'react-router-dom';
import { FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';

const GuardLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth(); // Get the login function from AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // The login function now returns an object with success and error properties
      const result = await login(email, password, 'guard'); // Pass role as guard
      
      if (!result.success) {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
      // If successful, the login function handles navigation automatically
    } catch (err) {
      // Fallback error handling
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Header with Guard Icon */}
          <div className="text-center mb-4">
            <div className="avatar placeholder mb-4">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <FaUserShield className="text-2xl" />
              </div>
            </div>
            <h2 className="card-title text-center block text-2xl">Guard Login</h2>
            <p className="text-sm text-gray-600 mt-2">Access your guard dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="guard@example.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error mt-4">
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <FaUserShield className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer with link to admin login */}
          <div className="divider"></div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Are you an administrator?{' '}
              <Link to="/" className="link link-primary">
                Admin Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardLogin;
