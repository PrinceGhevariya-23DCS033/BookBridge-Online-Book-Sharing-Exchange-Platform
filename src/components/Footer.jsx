import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <BookOpen className="h-8 w-8 text-teal-400" />
              <span className="ml-2 text-xl font-serif font-bold">BookBridge</span>
            </div>
            <p className="text-gray-300 mb-4">
              Connecting book donors with students in need, and creating a sustainable marketplace for used books.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-teal-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-teal-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-teal-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Our Impact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-teal-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/donate" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Donate Books
                </Link>
              </li>
              <li>
                <Link to="/sponsor" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Sponsor a Student
                </Link>
              </li>
              <li>
                <Link to="/request" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Request Books
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Buy & Sell
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Volunteer
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-teal-400 mt-0.5" />
                <span className="text-gray-300">
                  123 Book Street, Reading City,<br />Bookland, BK 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-teal-400" />
                <span className="text-gray-300">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-teal-400" />
                <span className="text-gray-300">info@bookbridge.org</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} BookBridge. All rights reserved.
          </p>
          <div className="flex space-x-4 text-sm">
            <Link to="/privacy" className="text-gray-300 hover:text-teal-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-teal-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/accessibility" className="text-gray-300 hover:text-teal-400 transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;