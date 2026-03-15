import React from 'react';
import { BulkOrderForm } from '../../components/bulkOrder/BulkOrderForm';

const BulkOrderRequest: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 font-display mb-2">
          Bulk / Custom Order Request
        </h1>
        <p className="text-lg text-gray-600">
          Need large quantities or special product combinations? Submit a request and our team will contact you.
        </p>
      </div>

      <BulkOrderForm />
    </div>
  );
};

export default BulkOrderRequest;
