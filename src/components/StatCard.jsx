import React from 'react';
import * as LucideIcons from 'lucide-react';

const StatCard = ({ stat }) => {
  const IconComponent = LucideIcons[stat.icon];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="bg-teal-100 p-4 rounded-full">
        {IconComponent && <IconComponent className="h-6 w-6 text-teal-600" />}
      </div>
      <div>
        <p className="text-gray-600 text-sm">{stat.title}</p>
        <p className="text-2xl font-bold font-serif text-gray-800">{stat.value}</p>
      </div>
    </div>
  );
};

export default StatCard;