import React from 'react';
import * as LucideIcons from 'lucide-react';

const DashboardStatCard = ({ title, value, icon, trend, percentage, color = "teal" }) => {
  const IconComponent = LucideIcons[icon];
  
  const getColorClasses = (color) => {
    switch(color) {
      case 'teal':
        return {
          bgLight: 'bg-teal-100',
          bgDark: 'bg-teal-600',
          text: 'text-teal-600'
        };
      case 'blue':
        return {
          bgLight: 'bg-blue-100',
          bgDark: 'bg-blue-600',
          text: 'text-blue-600'
        };
      case 'green':
        return {
          bgLight: 'bg-green-100',
          bgDark: 'bg-green-600',
          text: 'text-green-600'
        };
      case 'orange':
        return {
          bgLight: 'bg-orange-100',
          bgDark: 'bg-orange-600',
          text: 'text-orange-600'
        };
      default:
        return {
          bgLight: 'bg-teal-100',
          bgDark: 'bg-teal-600',
          text: 'text-teal-600'
        };
    }
  };
  
  const colors = getColorClasses(color);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold font-serif text-gray-800">{value}</h3>
          
          {trend && (
            <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <LucideIcons.TrendingUp className={`h-4 w-4 mr-1 ${trend === 'up' ? '' : 'rotate-180'}`} />
              <span className="text-sm">{percentage}% {trend === 'up' ? 'increase' : 'decrease'}</span>
            </div>
          )}
        </div>
        
        <div className={`${colors.bgLight} p-3 rounded-full`}>
          {IconComponent && <IconComponent className={`h-6 w-6 ${colors.text}`} />}
        </div>
      </div>
    </div>
  );
};

export default DashboardStatCard;