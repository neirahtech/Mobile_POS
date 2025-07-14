import React from 'react';
import { useBranch } from '../context/BranchContext';

const BranchSelector = () => {
  const { 
    branches, 
    selectedBranch, 
    selectBranch, 
    loading, 
    error 
  } = useBranch();

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    if (branchId) {
      const branch = branches.find(b => b.id.toString() === branchId);
      if (branch) {
        selectBranch(branch);
      }
    }
  };

  if (loading) return <div className="px-4 py-2">Loading branches...</div>;
  if (error) return <div className="text-red-500 px-4 py-2">{error}</div>;
  if (!branches.length) return <div className="px-4 py-2">No branches available</div>;

  return (
    <div className="px-4 py-2">
      <label htmlFor="branch-select" className="sr-only">Select Branch</label>
      <select
        id="branch-select"
        value={selectedBranch?.id || ''}
        onChange={handleBranchChange}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        <option value="">Select a branch</option>
        {branches.map((branch) => (
          <option 
            key={branch.id} 
            value={branch.id}
            disabled={!branch.active}
            className={!branch.active ? 'text-gray-400' : ''}
          >
            {branch.name} {!branch.active && '(Inactive)'}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BranchSelector;
