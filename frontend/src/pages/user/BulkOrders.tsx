import React from 'react';
import { Link } from 'react-router-dom';
import { BulkOrderTable } from '../../components/bulkOrder/BulkOrderTable';
import { PlusIcon } from '@heroicons/react/24/outline';

const BulkOrders: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 font-display mb-2">
            My Bulk Orders
          </h1>
          <p className="text-lg text-gray-600">
            Track and view history of your large wholesale requests.
          </p>
        </div>
        
        <Link to="/bulk-order" className="btn btn-primary inline-flex items-center">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Request
        </Link>
      </div>

      <BulkOrderTable />
    </div>
  );
};

export default BulkOrders;
