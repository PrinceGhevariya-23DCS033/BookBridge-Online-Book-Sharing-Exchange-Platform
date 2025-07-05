import React from 'react';
import { Clock, GraduationCap, Award } from 'lucide-react';

const RequestCard = ({ request }) => {
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Matched':
        return 'bg-blue-100 text-blue-800';
      case 'Fulfilled':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-serif font-semibold text-gray-800 line-clamp-2">{request.title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyBadge(request.urgency)}`}>
            {request.urgency} Priority
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <GraduationCap className="h-4 w-4 mr-2 text-teal-600" />
            <span>{request.grade}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Award className="h-4 w-4 mr-2 text-teal-600" />
            <span>{request.genre}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-teal-600" />
            <span>Requested on {new Date(request.requestDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <p className="text-gray-700 italic text-sm">"{request.reason}"</p>
          <p className="text-gray-600 text-sm mt-1">— {request.requestedBy}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(request.status)}`}>
            {request.status}
          </span>
          
          {request.status === 'Pending' && (
            <button 
              className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md transition-colors"
              onClick={() => alert(`Sponsoring ${request.title} for ${request.requestedBy}`)}
            >
              Sponsor Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;