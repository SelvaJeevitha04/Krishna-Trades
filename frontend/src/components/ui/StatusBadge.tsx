import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '');
    
    switch (normalizedStatus) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' };
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800', icon: '✓' };
      case 'processing':
        return { color: 'bg-purple-100 text-purple-800', icon: '⚙️' };
      case 'shipped':
        return { color: 'bg-indigo-100 text-indigo-800', icon: '🚚' };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800', icon: '✅' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: '❌' };
      case 'instock':
        return { color: 'bg-green-100 text-green-800', icon: '✓' };
      case 'lowstock':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
      case 'outofstock':
        return { color: 'bg-red-100 text-red-800', icon: '✕' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '•' };
    }
  };

  const { color, icon } = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${color} ${sizeClasses[size]} ${className}`}>
      <span className="mr-1">{icon}</span>
      {status}
    </span>
  );
};

export default StatusBadge;
