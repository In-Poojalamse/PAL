// src/pages/Companies.tsx
import React, { useEffect } from 'react';
import { useJobPortal } from '../hooks/useJobPortal';

const Companies: React.FC = () => {
  const { companies, loading, fetchCompanies } = useJobPortal();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <div className="min-h-screen p-8 bg-white">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : companies.length === 0 ? (
        <p>No companies found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <div
              key={company._id}
              className="border p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{company.name}</h2>
              <p className="text-gray-600">{company.industry}</p>
              <p className="text-gray-600">{company.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
