import { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiHelper } from '../../config/apiConfig';

export const useCountryState = () => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [allStates, setAllStates] = useState([]); // Store all states for filtering
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);

  // Fetch all countries on component mount
  useEffect(() => {
    fetchCountries();
    fetchAllStates();
  }, []);

  const fetchCountries = async () => {
    try {
      setCountriesLoading(true);
      console.log("Fetching countries from:", API_ENDPOINTS.COUNTRIES.GET_ALL);
      
      const result = await apiHelper.get(API_ENDPOINTS.COUNTRIES.GET_ALL);
      
      console.log("Countries API Response:", result);

      if (result.success) {
        setCountries(result.data || []);
      } else {
        console.error("Failed to fetch countries:", result.message);
        setCountries([]);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountries([]);
    } finally {
      setCountriesLoading(false);
    }
  };

  const fetchAllStates = async () => {
    try {
      setStatesLoading(true);
      console.log("Fetching states from:", API_ENDPOINTS.STATES.GET_ALL);
      
      const result = await apiHelper.get(API_ENDPOINTS.STATES.GET_ALL);
      
      console.log("States API Response:", result);

      if (result.success) {
        setAllStates(result.data || []);
      } else {
        console.error("Failed to fetch states:", result.message);
        setAllStates([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setAllStates([]);
    } finally {
      setStatesLoading(false);
    }
  };

  // Handle country selection
  const handleCountryChange = (countryName) => {
    setSelectedCountry(countryName);
    setSelectedState(''); // Reset state when country changes
    
    if (countryName) {
      // Filter states based on selected country
      const filteredStates = allStates.filter(state => 
        state.countryName === countryName || 
        state.country === countryName ||
        state.countryId === getCountryIdByName(countryName)
      );
      setStates(filteredStates);
    } else {
      setStates([]);
    }
  };

  // Handle state selection
  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
  };

  // Get country ID by name (helper function)
  const getCountryIdByName = (countryName) => {
    const country = countries.find(c => 
      c.countryName === countryName || 
      c.name === countryName
    );
    return country ? country.id : null;
  };

  // Get state ID by name (helper function)
  const getStateIdByName = (stateName) => {
    const state = allStates.find(s => 
      s.stateName === stateName || 
      s.name === stateName
    );
    return state ? state.id : null;
  };

  // Get state by ID (helper function)
  const getStateById = (stateId) => {
    return allStates.find(s => s.id === stateId);
  };

  // Get country by ID (helper function)
  const getCountryById = (countryId) => {
    return countries.find(c => c.id === countryId);
  };

  // Get states for a specific country
  const getStatesForCountry = (countryName) => {
    if (!countryName) return [];
    
    return allStates.filter(state => 
      state.countryName === countryName || 
      state.country === countryName ||
      state.countryId === getCountryIdByName(countryName)
    );
  };

  // Find country by state name (useful for editing)
  const findCountryByState = (stateName) => {
    const state = allStates.find(s => 
      s.stateName === stateName || 
      s.name === stateName
    );
    
    if (state) {
      // Try to find country by different possible field names
      if (state.countryName) {
        return state.countryName;
      } else if (state.country) {
        return state.country;
      } else if (state.countryId) {
        const country = countries.find(c => c.id === state.countryId);
        return country ? (country.countryName || country.name) : '';
      }
    }
    return '';
  };

  // Reset selections
  const resetSelections = () => {
    setSelectedCountry('');
    setSelectedState('');
    setStates([]);
  };

  // Refresh data
  const refreshData = async () => {
    await Promise.all([fetchCountries(), fetchAllStates()]);
  };

  return {
    countries,
    states,
    allStates,
    selectedCountry,
    selectedState,
    loading: countriesLoading || statesLoading,
    countriesLoading,
    statesLoading,
    handleCountryChange,
    handleStateChange,
    getStatesForCountry,
    findCountryByState,
    getCountryIdByName,
    getStateIdByName,
    getStateById,
    getCountryById,
    resetSelections,
    refreshData,
    fetchCountries,
    fetchAllStates
  };
};