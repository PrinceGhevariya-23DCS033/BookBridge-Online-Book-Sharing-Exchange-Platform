import React from 'react';
import { Quote } from 'lucide-react';

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <Quote className="absolute top-4 left-4 h-8 w-8 text-teal-100" />
      <div className="flex flex-col items-center">
        <img 
          src={testimonial.image} 
          alt={testimonial.name} 
          className="w-20 h-20 rounded-full object-cover mb-4 shadow-md"
        />
        <p className="text-gray-700 italic text-center mb-4 z-10 relative">
          "{testimonial.text}"
        </p>
        <div className="text-center">
          <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
          <p className="text-sm text-teal-600">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;