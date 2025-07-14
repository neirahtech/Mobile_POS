import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useBranch } from '../context/BranchContext';
import api from '../utils/axios';

export default function GRNPage() {
  const { selectedBranch, branches } = useBranch();
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Always sync localStorage.branch_id with selectedBranch.id
  useEffect(() => {
    if (selectedBranch && selectedBranch.id) {
      localStorage.setItem('branch_id', String(selectedBranch.id));
      fetchGRNs(selectedBranch.id);
    }
  }, [selectedBranch?.id]);

  const fetchGRNs = async (branchId) => {
    // Always use Number(branchId)
    const branchIdNum = Number(branchId);
    await api.get('/grn', { params: { branch_id: branchIdNum } });
  };

  const createGRN = async (grnData) => {
    const branchIdNum = Number(selectedBranch.id);
    localStorage.setItem('branch_id', String(branchIdNum));
    await api.post('/grn', { ...grnData, branch_id: branchIdNum });
  };

  const updateGRN = async (grn_id, grnData) => {
    const branchIdNum = Number(selectedBranch.id);
    await api.put(`/grn/${grn_id}`, { ...grnData, branch_id: branchIdNum });
  };

  const handleDelete = async (grn_id) => {
    const branchIdNum = Number(selectedBranch.id);
    await api.delete(`/grn/${grn_id}`, { params: { branch_id: branchIdNum } });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">GRN List</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0492C2]"></div>
          <span className="text-[#0369A1] font-medium">Loading GRNs...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#E6F4F9]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#0369A1] uppercase tracking-wider">GRN ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#0369A1] uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#0369A1] uppercase tracking-wider">Invoice No.</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#0369A1] uppercase tracking-wider">Invoice Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#0369A1] uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#0369A1] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No GRNs found for the selected branch.
                    </td>
                  </tr>
                ) : (
                  grns.map((grn) => (
                    <tr key={grn.grn_id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grn.grn_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{grn.supplier_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{grn.invoice_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(grn.invoice_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{grn.invoice_total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            className="text-[#0369A1] hover:text-[#024E7D] transition-colors"
                            type="button"
                            onClick={() => openEdit(grn)}
                            title="Edit GRN"
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 transition-colors"
                            type="button"
                            onClick={() => handleDelete(grn.grn_id)}
                            title="Delete GRN"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}