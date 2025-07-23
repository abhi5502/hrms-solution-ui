import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { API_ENDPOINTS, apiHelper } from "../../config/apiConfig";
import "../../styles/common/CommonModal.css";

// Helper for react-select option
const toOption = (item) => ({
  value: item.id,
  label: item.countryName || item.name || item.stateName || item.cityName,
});

export const CompanyModal = ({
  isOpen,
  onClose,
  company = null,
  onSave,
  loading,
  industries = [],
}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]); // GROUPED [{label, options: [...] }]
  const [cities, setCities] = useState([]);

  const [formData, setFormData] = useState({
    parentCompanyName: "",
    subCompanyName: "",
    legalName: "",
    registrationNumber: "",
    taxNumber: "",
    industryIds: [],
    establishedDate: "",
    website: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    countryIds: [],
    stateIds: [],
    cityIds: [],
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch countries when modal opens ---
  useEffect(() => {
    if (isOpen) fetchCountries();
  }, [isOpen]);

  // --- Populate for Edit ---
  useEffect(() => {
    if (company) {
      setFormData((prev) => ({
        ...prev,
        ...company,
        industryIds: company.industries
          ? company.industries.map((ind) => ind.id || ind)
          : [],
        countryIds: company.countryIds || (company.countryId ? [company.countryId] : []),
        stateIds: company.stateIds || (company.stateId ? [company.stateId] : []),
        cityIds: company.cityIds || (company.cityId ? [company.cityId] : []),
        status:
          company.status?.toLowerCase() === "true" || company.status === true
            ? "active"
            : "inactive",
        establishedDate: company.establishedDate
          ? company.establishedDate.substring(0, 10)
          : "",
      }));
    }
  }, [company]);

  // Fetch grouped states when countryIds change
  useEffect(() => {
    const fetchGroupedStates = async () => {
      if (formData.countryIds.length > 0) {
        try {
          const res = await apiHelper.post(API_ENDPOINTS.STATES.GROUPED_BY_COUNTRY, formData.countryIds);
          if (res.success && Array.isArray(res.data)) {
            // Format for react-select grouped options
            const groupedStates = res.data.map(group => ({
              label: group.countryName,
              options: (group.states || []).map(s => ({
                value: s.id,
                label: s.stateName || s.name,
                countryId: group.countryId
              }))
            })).filter(group => group.options.length > 0);
            setStates(groupedStates);
            // Flatten all states for filtering selected stateIds
            const allStatesFlat = groupedStates.flatMap(g => g.options);
            setFormData(prev => ({
              ...prev,
              stateIds: prev.stateIds.filter(sid => allStatesFlat.some(s => s.value === sid)),
              cityIds: prev.cityIds.filter(() => true),
            }));
          } else {
            setStates([]);
          }
        } catch {
          setStates([]);
        }
      } else {
        setStates([]);
        setCities([]);
        setFormData(prev => ({ ...prev, stateIds: [], cityIds: [] }));
      }
    };
    fetchGroupedStates();
  }, [formData.countryIds]);

  // --- Remove duplicates from stateIds after selection ---
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      stateIds: Array.from(new Set(prev.stateIds)),
    }));
  }, [formData.stateIds.length]);

  // --- Cities - fetch for selected stateIds ---
  useEffect(() => {
    if (formData.stateIds.length > 0) {
      const fetchAllCities = async () => {
        const result = await Promise.all(
          formData.stateIds.map((sid) => fetchCities(sid))
        );
        setCities(result.flat().filter(Boolean));
      };
      fetchAllCities();
    } else {
      setCities([]);
      setFormData((prev) => ({ ...prev, cityIds: [] }));
    }
  }, [formData.stateIds]);

  // --- API Calls ---
  const fetchCountries = async () => {
    try {
      const res = await apiHelper.get(API_ENDPOINTS.COUNTRIES.GET_ALL);
      if (res.success) setCountries(res.data || []);
      else setCountries([]);
    } catch {
      setCountries([]);
    }
  };
  // Removed unused fetchStates function
  async function fetchCities(stateId) {
    try {
      const res = await apiHelper.get(`${API_ENDPOINTS.CITIES.GET_ALL}?stateId=${stateId}`);
      return res.success ? res.data || [] : [];
    } catch {
      return [];
    }
  }

  // --- Validation ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.legalName.trim()) newErrors.legalName = "Legal Name required";
    if (!formData.countryIds || formData.countryIds.length === 0)
      newErrors.countryIds = "Country required";
    if (!formData.stateIds || formData.stateIds.length === 0)
      newErrors.stateIds = "State required";
    if (!formData.cityIds || formData.cityIds.length === 0)
      newErrors.cityIds = "City required";
    if (!formData.status) newErrors.status = "Status required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --- MultiSelect Generic Handler (with deduplication) ---
  const handleMultiSelectChangeGeneric = (name, selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOptions
        ? Array.from(new Set(selectedOptions.map((opt) => opt.value)))
        : [],
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // --- Industry MultiSelect ---
  const handleMultiSelectChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      industryIds: selectedOptions
        ? Array.from(new Set(selectedOptions.map((opt) => opt.value)))
        : [],
    }));
    if (errors["industryIds"]) setErrors((prev) => ({ ...prev, industryIds: "" }));
  };

  // --- Submit Handler ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    await onSave({
      ...formData,
      status: formData.status === "active",
      establishedDate: formData.establishedDate
        ? new Date(formData.establishedDate).toISOString()
        : null,
    });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  // --- Custom styles for react-select ---
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#23293a',
      color: '#fff',
      border: state.isFocused ? '1.5px solid #7c7c7c' : '1.5px solid #3a4157',
      boxShadow: 'none',
      minHeight: '48px',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',
      fontWeight: 500,
    }),
    input: (provided) => ({
      ...provided,
      color: '#fff',
      width: '100%',
      flex: 1,
      boxSizing: 'border-box',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#888',
      fontWeight: 400,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#23293a',
      color: '#fff',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#2c3242' : '#23293a',
      color: '#fff',
      cursor: 'pointer',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#2c3242',
      color: '#fff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#fff',
      backgroundColor: '#3a4157',
      ':hover': {
        backgroundColor: '#ff5252',
        color: '#fff',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#3a4157',
    }),
  };

  let submitButtonText = isSubmitting
    ? company
      ? "Updating..."
      : "Creating..."
    : company
    ? "Update Company"
    : "Create Company";

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
    >
      <div className="modal-content form-modal" tabIndex={-1}>
        <div className="modal-header">
          <h2>{company ? "Edit Company" : "Add Company"}</h2>
          <button className="close-btn" onClick={onClose} disabled={isSubmitting || loading} type="button">×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* --- Legal Name & Industry --- */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="legalName">
                  Legal Name <span style={{ color: "#ff5252" }}>*</span>
                </label>
                <input
                  type="text"
                  id="legalName"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleInputChange}
                  className={errors.legalName ? "error" : ""}
                  placeholder="Enter legal name"
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                />
                {errors.legalName && (
                  <span className="error-text">{errors.legalName}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="industryIds">Industry</label>
                <Select
                  inputId="industryIds"
                  isMulti
                  options={industries.map(toOption)}
                  value={industries.filter((ind) => formData.industryIds.includes(ind.id)).map(toOption)}
                  onChange={handleMultiSelectChange}
                  placeholder="Select industries"
                  classNamePrefix="react-select"
                  isDisabled={isSubmitting || loading}
                  styles={selectStyles}
                />
              </div>
            </div>
            {/* --- Registration/Tax --- */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registrationNumber">Registration Number</label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  className={errors.registrationNumber ? "error" : ""}
                  placeholder="Enter registration number"
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="taxNumber">Tax Number</label>
                <input
                  type="text"
                  id="taxNumber"
                  name="taxNumber"
                  value={formData.taxNumber}
                  onChange={handleInputChange}
                  className={errors.taxNumber ? "error" : ""}
                  placeholder="Enter tax number"
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                />
              </div>
            </div>
            {/* --- Country/State/City --- */}
            <div className="form-group">
              <label htmlFor="countryIds">Country <span style={{ color: "#ff5252" }}>*</span></label>
              <Select
                inputId="countryIds"
                isMulti
                options={countries.map(toOption)}
                value={countries.filter((c) => formData.countryIds.includes(c.id)).map(toOption)}
                onChange={(options) => handleMultiSelectChangeGeneric("countryIds", options)}
                placeholder="Select country"
                classNamePrefix="react-select"
                isDisabled={isSubmitting || loading}
                styles={selectStyles}
                closeMenuOnSelect={false}
                isSearchable={true}
              />
              {errors.countryIds && (
                <span className="error-text">{errors.countryIds}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="stateIds">State <span style={{ color: "#ff5252" }}>*</span></label>
              <Select
                inputId="stateIds"
                isMulti
                options={states}
                value={Array.from(
                  new Map(
                    states
                      .flatMap((g) => g.options || [])
                      .filter((opt) => formData.stateIds.includes(opt.value))
                      .map((opt) => [opt.value, opt])
                  ).values()
                )}
                onChange={(options) => handleMultiSelectChangeGeneric("stateIds", options)}
                placeholder="Select state"
                classNamePrefix="react-select"
                isDisabled={states.length === 0 || isSubmitting || loading}
                styles={{
                  ...selectStyles,
                  option: (provided, state) => {
                    const isSelectedCountry = formData.countryIds.includes(state.data.countryId);
                    return {
                      ...provided,
                      backgroundColor: state.isFocused
                        ? '#2c3242'
                        : isSelectedCountry
                          ? '#3a4157'
                          : '#23293a',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: isSelectedCountry ? 600 : 400,
                    };
                  },
                }}
                closeMenuOnSelect={false}
                isSearchable={true}
                formatGroupLabel={group => (
                  <div style={{
                    fontWeight: 700,
                    color: '#fff',
                    background: '#23293a',
                    padding: '4px 8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {group.label}
                  </div>
                )}
              />
              {errors.stateIds && (
                <span className="error-text">{errors.stateIds}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="cityIds">City <span style={{ color: "#ff5252" }}>*</span></label>
              <Select
                inputId="cityIds"
                isMulti
                options={cities.map(toOption)}
                value={cities.filter((c) => formData.cityIds.includes(c.id)).map(toOption)}
                onChange={(options) => handleMultiSelectChangeGeneric("cityIds", options)}
                placeholder="Select city"
                classNamePrefix="react-select"
                isDisabled={cities.length === 0 || isSubmitting || loading}
                styles={selectStyles}
                closeMenuOnSelect={false}
              />
              {errors.cityIds && (
                <span className="error-text">{errors.cityIds}</span>
              )}
            </div>
            {/* --- Status --- */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status <span style={{ color: "#ff5252" }}>*</span></label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={errors.status ? "error" : ""}
                  disabled={isSubmitting || loading}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && (
                  <span className="error-text">{errors.status}</span>
                )}
              </div>
            </div>
            {/* --- Established/Website/Contact --- */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="establishedDate">Established Date</label>
                <input
                  type="date"
                  id="establishedDate"
                  name="establishedDate"
                  value={formData.establishedDate}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                  placeholder="Enter website"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                  placeholder="Enter phone"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address1">Address 1</label>
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                  placeholder="Enter address 1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address2">Address 2</label>
                <input
                  type="text"
                  id="address2"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  disabled={isSubmitting || loading}
                  autoComplete="off"
                  placeholder="Enter address 2"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSubmitting || loading}
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
CompanyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  company: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  industries: PropTypes.array.isRequired,
};
// ========== Delete Modal ===========

export function DeleteConfirmCompanyModal({
  isOpen,
  onClose,
  company,
  onDelete,
  loading
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  if (!isOpen || !company) return null;
  
  const handleConfirm = async () => {
    setIsDeleting(true);
    await onDelete(company.id);
    setIsDeleting(false);
  };

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="modal-content delete-modal" style={{ outline: "none" }}>
        <div className="modal-header">
          <h2>Confirm Delete</h2>
          <button
            className="close-btn"
            onClick={onClose}
            disabled={isDeleting || loading}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center' }}>
          <p>Are you sure you want to delete this company?</p>
          <div style={{ fontWeight: 600, margin: '10px 0' }}>
            Company Name: <span style={{ fontWeight: 700 }}>{company.legalName}</span>
          </div>
          <p style={{ color: '#ff5252', fontWeight: 500 }}>This action cannot be undone.</p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center', gap: 16 }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isDeleting || loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-delete"
            onClick={handleConfirm}
            disabled={isDeleting || loading}
          >
            {isDeleting ? "Deleting..." : "Delete Company"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
// ========== View Modal ==========
export const ViewCompanyModal = ({ isOpen, onClose, company }) => {
  if (!isOpen || !company) return null;
  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      onClose={onClose}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={e => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="modal-content view-modal">
        <div className="modal-header">
          <h2>Company Details</h2>
          <button
            className="close-btn"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="details-container">
            <div className="detail-row">
              <span className="detail-label">Legal Name:</span>
              <span className="detail-value">{company.legalName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Registration Number:</span>
              <span className="detail-value">{company.registrationNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                <span className={`status ${company.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                  {company.status ? "Active" : "Inactive"}
                </span>
              </span>
            </div>
            {/* Add more fields as needed */}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );

};
ViewCompanyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  company: PropTypes.shape({
    legalName: PropTypes.string,
    registrationNumber: PropTypes.string,
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),

  })
};
