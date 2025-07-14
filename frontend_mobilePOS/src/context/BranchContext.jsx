import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

console.log('BranchContext loaded'); // Add this line

const BranchContext = createContext();

export function BranchProvider({ children }) {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load branches from API
  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/branches');
      setBranches(response.data || []);
      
      // If no branch is selected, try to select the first active branch
      const savedBranchId = localStorage.getItem('selected_branch_id');
      if (savedBranchId) {
        const savedBranch = response.data.find(b => b.id.toString() === savedBranchId);
        if (savedBranch) {
          setSelectedBranch(savedBranch);
        }
      } else if (response.data.length > 0) {
        // Default to first active branch if none selected
        const activeBranch = response.data.find(b => b.active) || response.data[0];
        if (activeBranch) {
          setSelectedBranch(activeBranch);
          localStorage.setItem('selected_branch_id', activeBranch.id);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      setError('Failed to load branches');
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set the active branch
  const selectBranch = useCallback((branch) => {
    if (branch && branch.id) {
      setSelectedBranch(branch);
      localStorage.setItem('selected_branch_id', branch.id);
      localStorage.setItem('branch_id', branch.id);
      
      // Refresh the page to apply branch-specific data
      window.location.reload();
    }
  }, []);

  // Add a new branch
  const addBranch = async (branchData) => {
    console.log('Calling addBranch with:', branchData);
    try {
      const response = await api.post('/branches', branchData);
      await fetchBranches(); // Refresh branches list
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add branch' 
      };
    }
  };

  // Update a branch
  const updateBranch = async (id, branchData) => {
    console.log('Calling updateBranch with:', id, branchData);
    try {
      const response = await api.put(`/branches/${id}`, branchData);
      await fetchBranches(); // Refresh branches list
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update branch' 
      };
    }
  };

  // Delete a branch
  const deleteBranch = async (id) => {
    console.log('Calling deleteBranch with:', id);
    try {
      await api.delete(`/branches/${id}`);
      await fetchBranches(); // Refresh branches list
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete branch' 
      };
    }
  };

  // Toggle branch active status
  const toggleBranchStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/branches/${id}/status`, { active: !currentStatus });
      await fetchBranches(); // Refresh branches list
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update branch status' 
      };
    }
  };

  // Load branches on component mount
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return (
    <BranchContext.Provider 
      value={{ 
        branches, 
        selectedBranch,
        loading,
        error,
        selectBranch,
        addBranch,
        updateBranch,
        deleteBranch,
        toggleBranchStatus,
        refreshBranches: fetchBranches
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}
