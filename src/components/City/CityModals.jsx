import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useCountryState } from "./useCountryState";
import "../../styles/common/CommonModal.css";

// City Form Modal Component
export const CityFormModal = ({ isOpen, onClose, city, onSave, loading }) => {
    const [formData, setFormData] = useState({
        cityName: "",
        postalCode: "",
        stateName: "",
        stateId: "",
        countryName: "",
        countryId: "",
        status: "active"
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        countries,
        states,
        selectedCountry,
        selectedState,
        loading: dropdownLoading,
        countriesLoading,
        statesLoading,
        handleCountryChange,
        handleStateChange,
        findCountryByState,
        getStateIdByName,
        getCountryIdByName,
        resetSelections
    } = useCountryState();

    // Helper: Get country name for display
    const getCountryDisplayName = (country) =>
        country.countryName || country.name || country.title || 'Unknown Country';

    // Helper: Get state name for display
    const getStateDisplayName = (state) =>
        state.stateName || state.name || state.title || 'Unknown State';

    // Helper: Reset form data
    const getInitialFormData = () => ({
        cityName: "",
        postalCode: "",
        stateName: "",
        stateId: "",
        countryName: "",
        countryId: "",
        status: "active"
    });

    // Helper: Validate form
    const validateForm = (data) => {
        const newErrors = {};
        if (!data.cityName.trim()) {
            newErrors.cityName = "City name is required";
        } else if (data.cityName.length < 2) {
            newErrors.cityName = "City name must be at least 2 characters";
        }
        if (!data.postalCode.trim()) {
            newErrors.postalCode = "Postal code is required";
        } else if (!/^\d{6}$/.test(data.postalCode)) {
            newErrors.postalCode = "Postal code must be 6 digits";
        }
        if (!data.countryName.trim()) {
            newErrors.countryName = "Country is required";
        }
        if (!data.stateName.trim()) {
            newErrors.stateName = "State is required";
        }
        if (!data.stateId) {
            newErrors.stateName = "Please select a valid state";
        }
        if (!data.countryId) {
            newErrors.countryName = "Please select a valid country";
        }
        return newErrors;
    };

    // Helper: Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'countryName') {
            handleCountryChange(value);
            const countryId = getCountryIdByName(value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                countryId: countryId || "",
                stateName: "",
                stateId: ""
            }));
            handleStateChange("");
        } else if (name === 'stateName') {
            handleStateChange(value);
            const stateId = getStateIdByName(value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                stateId: stateId || ""
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Extracted: Render input field
    const renderInput = (label, name, type = "text", placeholder = "", maxLength = undefined) => (
        <div className="form-group">
            <label>{label}</label>
            <input
                type={type}
                name={name}
                className={errors[name] ? 'error' : ''}
                value={formData[name]}
                onChange={handleInputChange}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={isSubmitting || loading}
                autoComplete="off"
            />
            {errors[name] && (
                <span className="error-text">{errors[name]}</span>
            )}
        </div>
    );

    // Extracted: Render select field
    const renderSelect = (label, name, options, loadingFlag, disabledFlag, getDisplayName, emptyText) => (
        <div className="form-group">
            <label>{label}</label>
            <select
                name={name}
                className={`${errors[name] ? 'error' : ''} ${loadingFlag ? 'loading' : ''}`}
                value={formData[name]}
                onChange={handleInputChange}
                disabled={isSubmitting || loading || loadingFlag || disabledFlag}
            >
                <option value="">
                    {loadingFlag ? `Loading ${label.toLowerCase()}...` : emptyText}
                </option>
                {options.map((item) => (
                    <option key={item.id} value={getDisplayName(item)}>
                        {getDisplayName(item)}
                    </option>
                ))}
            </select>
            {errors[name] && (
                <span className="error-text">{errors[name]}</span>
            )}
        </div>
    );

    // Only run when modal opens or city changes
    useEffect(() => {
        if (!isOpen) return;
        if (city) {
            const countryForState = findCountryByState(city.stateName);
            const stateId = getStateIdByName(city.stateName);
            const countryId = getCountryIdByName(city.countryName || countryForState);
            const newFormData = {
                cityName: city.cityName || "",
                postalCode: city.postalCode || "",
                stateName: city.stateName || "",
                stateId: stateId || "",
                countryName: city.countryName || countryForState || "",
                countryId: countryId || "",
                status: city.status === "Active" || city.status === "True" ? "active" : "inactive"
            };
            setFormData(newFormData);
            if (countryForState) {
                handleCountryChange(countryForState);
                setTimeout(() => {
                    handleStateChange(city.stateName || "");
                }, 100);
            }
        } else {
            setFormData(getInitialFormData());
            resetSelections();
        }
        setErrors({});
        setIsSubmitting(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, city]);

    useEffect(() => {
        if (selectedCountry && selectedCountry !== formData.countryName) {
            const countryId = getCountryIdByName(selectedCountry);
            setFormData(prev => ({
                ...prev,
                countryName: selectedCountry,
                countryId: countryId || ""
            }));
        }
    }, [selectedCountry, formData.countryName, getCountryIdByName]);

    useEffect(() => {
        if (selectedState && selectedState !== formData.stateName) {
            const stateId = getStateIdByName(selectedState);
            setFormData(prev => ({
                ...prev,
                stateName: selectedState,
                stateId: stateId || ""
            }));
        }
    }, [selectedState, formData.stateName, getStateIdByName, getCountryIdByName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsSubmitting(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error("Error saving city:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting && !loading) {
            setErrors({});
            resetSelections();
            onClose();
        }
    };


    if (!isOpen) return null;

    return (
        <dialog
            className="modal-overlay"
            open={isOpen}
            onClose={handleClose}
            onClick={e => {
                if (e.target === e.currentTarget) handleClose();
            }}
            onKeyDown={e => {
                if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                    handleClose();
                }
            }}
        >
            <div className="modal-content form-modal">
                <div className="modal-header">
                    <h2>{city ? "Edit City" : "Add New City"}</h2>
                    <button
                        className="close-btn"
                        onClick={handleClose}
                        disabled={isSubmitting || loading}
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-row">
                            {renderInput("City Name", "cityName", "text", "Enter city name")}
                            {renderInput("Postal Code", "postalCode", "text", "Enter postal code", 6)}
                        </div>

                        <div className="form-row">
                            {renderSelect(
                                "Country",
                                "countryName",
                                countries,
                                countriesLoading,
                                false,
                                getCountryDisplayName,
                                "Select a country"
                            )}
                            {renderSelect(
                                "State",
                                "stateName",
                                states,
                                statesLoading,
                                !formData.countryName,
                                getStateDisplayName,
                                !formData.countryName
                                    ? "Select a country first"
                                    : states.length === 0
                                    ? "No states available"
                                    : "Select a state"
                            )}
                        </div>

                        {/* Status field - only show when editing */}
                        {city && (
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting || loading}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                            disabled={isSubmitting || loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={isSubmitting || loading || dropdownLoading}
                        >
                            {isSubmitting ? "Saving..." : city ? "Update City" : "Create City"}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

CityFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    city: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

// Delete Confirmation Modal Component
export const DeleteConfirmModal = ({ isOpen, onClose, city, onConfirm, loading }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!city) return;

        setIsDeleting(true);
        try {
            await onConfirm(city.id);
        } catch (error) {
            console.error("Error deleting city:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (!isDeleting && !loading) {
            onClose();
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen || !city) return null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content delete-modal">
                <div className="modal-header">
                    <h2>Confirm Delete</h2>
                    <button
                        className="close-btn"
                        onClick={handleClose}
                        disabled={isDeleting || loading}
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="warning-icon">⚠️</div>
                    <p>Are you sure you want to delete <strong>{city.cityName}</strong>?</p>
                    <p className="warning-text">This action cannot be undone.</p>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleClose}
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
                        {isDeleting ? "Deleting..." : "Delete City"}
                    </button>
                </div>
            </div>
        </div>
    );
};

DeleteConfirmModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    city: PropTypes.object,
    onConfirm: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

// View City Details Modal Component
export const ViewCityModal = ({ isOpen, onClose, city }) => {

    if (!isOpen || !city) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return "Invalid Date";
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content view-modal">
                <div className="modal-header">
                    <h2>City Details</h2>
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
                            <span className="detail-label">City Name:</span>
                            <span className="detail-value">{city.cityName}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Postal Code:</span>
                            <span className="detail-value">{city.postalCode}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">State:</span>
                            <span className="detail-value">{city.stateName}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Country:</span>
                            <span className="detail-value">{city.countryName}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value">
                                <span className={`status ${city.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                                    {city.status}
                                </span>
                            </span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">City ID:</span>
                            <span className="detail-value">{city.id}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Created Date:</span>
                            <span className="detail-value">{formatDate(city.createdAt)}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Last Modified:</span>
                            <span className="detail-value">{formatDate(city.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

ViewCityModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    city: PropTypes.shape({
        cityName: PropTypes.string,
        postalCode: PropTypes.string,
        stateName: PropTypes.string,
        countryName: PropTypes.string,
        status: PropTypes.string,
        id: PropTypes.string,
        createdAt: PropTypes.string,
        updatedAt: PropTypes.string
    })
};