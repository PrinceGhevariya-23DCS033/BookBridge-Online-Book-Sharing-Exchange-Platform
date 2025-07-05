import { ArrowRight, BookOpen, Gift, GraduationCap, ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import StatCard from '../components/StatCard';
import TestimonialCard from '../components/TestimonialCard';
import { stats } from '../data/stats';
import { testimonials } from '../data/testimonials';

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-500 to-blue-500 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                Share knowledge, <span className="italic">change lives</span>
              </h1>
              <p className="text-xl opacity-90 max-w-lg">
                BookBridge connects book donors with users in need, while creating a sustainable marketplace for used books.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/donate" className="bg-white text-teal-600 px-6 py-3 rounded-md font-medium shadow-md hover:bg-gray-100 transition-colors">
                  Donate a Book
                </Link>
                <Link to="/request" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-teal-600 transition-colors">
                  Request a Book
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.pexels.com/photos/5077074/pexels-photo-5077074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="users with books" 
                className="rounded-lg shadow-2xl transform rotate-2 transition-transform duration-500 hover:rotate-0"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">How You Can Help</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our community of book lovers who are making education accessible to all.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Donate Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="bg-teal-100 p-4 rounded-full inline-block mb-4">
                <BookOpen className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Donate a Book</h3>
              <p className="text-gray-600 mb-4">
                Donate your gently used books to users who need them most.
              </p>
              <Link to="/donate" className="text-teal-600 font-medium hover:text-teal-700 inline-flex items-center">
                <span>Donate Now</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Sponsor Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
                <Gift className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sponsor a Book</h3>
              <p className="text-gray-600 mb-4">
                Purchase new books for users who need specific textbooks.
              </p>
              <Link to="/sponsor" className="text-green-600 font-medium hover:text-green-700 inline-flex items-center">
                <span>Sponsor Now</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Request Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Request a Book</h3>
              <p className="text-gray-600 mb-4">
                users can request books they need for their education.
              </p>
              <Link to="/request" className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                <span>Request Book</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            {/* Marketplace Card */}
            <div className="bg-white rounded-lg shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="bg-orange-100 p-4 rounded-full inline-block mb-4">
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Buy & Sell Books</h3>
              <p className="text-gray-600 mb-4">
                Marketplace for buying and selling gently used books at affordable prices.
              </p>
              <Link to="/marketplace" className="text-orange-600 font-medium hover:text-orange-700 inline-flex items-center">
                <span>Explore Marketplace</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Impact Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">Our Impact</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Together, we're making a real difference in users' lives through the power of books.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from the users, donors, and sellers who have made BookBridge their community.
            </p>
          </div>
          
          <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-3 w-3 mx-1 rounded-full ${
                    currentTestimonial === index ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Every book shared helps a student reach their potential. Join our mission today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/donate" 
              className="bg-white text-teal-600 px-6 py-3 rounded-md font-medium shadow-md hover:bg-gray-100 transition-colors"
            >
              Donate a Book
            </Link>
            <Link 
              to="/sponsor" 
              className="bg-teal-600 text-white border border-white px-6 py-3 rounded-md font-medium shadow-md hover:bg-teal-700 transition-colors"
            >
              Sponsor a Book
            </Link>
            <Link 
              to="/request" 
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-teal-600 transition-colors"
            >
              Request a Book
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;