import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/reducers/authSlice';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left Menu */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/menu"
            className="text-gray-700 font-medium hover:text-teal-500 hover:underline transition-all duration-300"
          >
            Menu
          </Link>
          <Link
            to="/reservation"
            className="text-gray-700 font-medium hover:text-teal-500 hover:underline transition-all duration-300"
          >
            Reservation
          </Link>
        </div>

        {/* Logo (Center) */}
        <Link to="/" className="text-2xl font-bold font-poppins text-gray-900 absolute left-1/2 transform -translate-x-1/2">
          Coffee Shop
        </Link>

        {/* Right Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/order"
            className="text-gray-700 font-medium hover:text-teal-500 hover:underline transition-all duration-300"
          >
            Order
          </Link>
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-gray-700 font-medium hover:text-teal-500 hover:underline transition-all duration-300"
              >
                {user.name}
              </Link>
              <Button
                variant="default"
                onClick={handleLogout}
                className="bg-teal-500 text-white hover:bg-teal-600 transition-all duration-300"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 font-medium hover:text-teal-500 hover:underline transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 font-medium hover:text-teal-500 hover:underline transition-all duration-300"
>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={toggleMobileMenu} className="text-gray-700">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, y: '-100%' }}
        animate={{ opacity: isMobileMenuOpen ? 1 : 0, y: isMobileMenuOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-white fixed inset-0 z-40 flex flex-col items-center justify-center space-y-6 text-lg"
      >
        <Button
          variant="ghost"
          onClick={toggleMobileMenu}
          className="absolute top-4 right-4 text-gray-700"
        >
          <X size={24} />
        </Button>
        <Link
          to="/menu"
          onClick={toggleMobileMenu}
          className="text-gray-700 font-medium hover:text-teal-500 transition-all duration-300"
        >
          Menu
        </Link>
        <Link
          to="/reservation"
          onClick={toggleMobileMenu}
          className="text-gray-700 font-medium hover:text-teal-500 transition-all duration-300"
        >
          Reservation
        </Link>
        <Link
          to="/order"
          onClick={toggleMobileMenu}
          className="text-gray-700 font-medium hover:text-teal-500 transition-all duration-300"
        >
          Order
        </Link>
        {user ? (
          <>
            <Link
              to="/profile"
              onClick={toggleMobileMenu}
              className="text-gray-700 font-medium hover:text-teal-500 transition-all duration-300"
            >
              {user.name}
            </Link>
            <Button
              variant="default"
              onClick={() => {
                handleLogout();
                toggleMobileMenu();
              }}
              className="bg-teal-500 text-white hover:bg-teal-600"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={toggleMobileMenu}
              className="text-gray-700 font-medium hover:text-teal-500 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={toggleMobileMenu}
              className="text-gray-700 font-medium hover:text-teal-500 transition-all duration-300"
            >
              Register
            </Link>
          </>
        )}
      </motion.div>
    </header>
  );
};

export default Header;