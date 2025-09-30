import { Link } from 'react-router-dom';
import { Coffee, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About Section */}
        <div>
          <div className="flex items-center mb-4">
            <Coffee size={24} className="mr-2 text-teal-500" />
            <h3 className="text-lg font-semibold font-poppins">Coffee Shop</h3>
          </div>
          <p className="text-sm">
            Enjoy the best coffee in town with a cozy atmosphere. Your perfect coffee break starts here!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 font-poppins">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/menu"
                className="hover:text-teal-500 hover:underline transition-all duration-300"
              >
                Menu
              </Link>
            </li>
            <li>
              <Link
                to="/reservation"
                className="hover:text-teal-500 hover:underline transition-all duration-300"
              >
                Reservation
              </Link>
            </li>
            <li>
              <Link
                to="/order"
                className="hover:text-teal-500 hover:underline transition-all duration-300"
              >
                Order
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-teal-500 hover:underline transition-all duration-300"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 font-poppins">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <Mail size={16} className="mr-2 text-teal-500" />
              <a href="mailto:info@coffeeshop.com" className="hover:text-teal-500">
                info@coffeeshop.com
              </a>
            </li>
            <li className="flex items-center">
              <Phone size={16} className="mr-2 text-teal-500" />
              <a href="tel:+1234567890" className="hover:text-teal-500">
                +1 (234) 567-890
              </a>
            </li>
            <li className="flex items-center">
              <MapPin size={16} className="mr-2 text-teal-500" />
              <span>123 Coffee St, Brew City</span>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4 font-poppins">Follow Us</h3>
          <div className="flex space-x-4">
<a href="https://facebook.com" className="hover:text-teal-500 transition-all duration-300">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" className="hover:text-teal-500 transition-all duration-300">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" className="hover:text-teal-500 transition-all duration-300">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-sm border-t border-gray-200 pt-4">
        <p>© 2025 Coffee Shop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
