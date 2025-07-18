import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CityFormModal, DeleteConfirmModal, ViewCityModal } from "./CityModals";
import { CommonTable } from "../Common/CommonTable";
import { CommonPagination } from "../Common/CommonPagination";
import { useCommonTable } from "../../hooks/useCommonTable";
import { API_ENDPOINTS, apiHelper } from "../../config/apiConfig";
import "../../styles/common/CommonTable.css";
import "../../styles/common/CommonModal.css";

// Skeleton Loading Component
const CitiesSkeleton = () => (
    <div className="table-container">
        <div className="loading">Loading cities...</div>
    </div>
);

export const City = () => {
    const {
        data: cities,
        setData: setCities,
        loading,
        setLoading,
        operationLoading,
        setOperationLoading,
        currentPage,
        totalPages,
        handlePageChange,
        handlePrevPage,
        handleNextPage,
        //sortField,
        //sortDirection,
        handleSort,
        getSortIndicator,
        getSortClass,
        searchTerm,
        handleSearch,
        clearSearch,
        getFilteredData,
        //getSortedData,
        getPaginatedData,
        isFormModalOpen,
        isDeleteModalOpen,
        isViewModalOpen,
        selectedItem,
        editingItem,
        handleAdd,
        handleEdit,
        handleDelete,
        handleView,
        closeModals,
        itemsPerPage
    } = useCommonTable([], 10);

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCities = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("Fetching cities from:", API_ENDPOINTS.CITIES.GET_ALL);

            const result = await apiHelper.get(API_ENDPOINTS.CITIES.GET_ALL);

            console.log("Cities API Response:", result);

            if (result.success) {
                const mappedCities = result.data.map(city => ({
                    id: city.id,
                    cityName: city.cityName,
                    postalCode: city.postalCode,
                    stateName: city.stateName,
                    countryName: city.countryName,
                    status: city.status === "True" || city.status === true ? "Active" : "Inactive",
                    createdAt: city.createdDate,
                    updatedAt: city.modifiedDate
                }));

                console.log("Mapped Cities:", mappedCities);
                setCities(mappedCities);
            } else {
                setError("Failed to fetch cities");
                toast.error("Failed to fetch cities");
            }
        } catch (err) {
            setError("Error connecting to server");
            toast.error("Error connecting to server");
            console.error("Error fetching cities:", err);
        } finally {
            setLoading(false);
        }
    };

    // Define columns for the common table
    const columns = [
        {
            field: 'cityName',
            header: 'City Name',
            sortable: true,
            sortClass: getSortClass('cityName'),
            sortIndicator: getSortIndicator('cityName'),
            onSort: handleSort,
            className: 'city-name'
        },
        {
            field: 'postalCode',
            header: 'Postal Code',
            sortable: true,
            sortClass: getSortClass('postalCode'),
            sortIndicator: getSortIndicator('postalCode'),
            onSort: handleSort
        },
        {
            field: 'stateName',
            header: 'State',
            sortable: true,
            sortClass: getSortClass('stateName'),
            sortIndicator: getSortIndicator('stateName'),
            onSort: handleSort
        },
        {
            field: 'countryName',
            header: 'Country',
            sortable: true,
            sortClass: getSortClass('countryName'),
            sortIndicator: getSortIndicator('countryName'),
            onSort: handleSort
        },
        {
            field: 'status',
            header: 'Status',
            sortable: true,
            sortClass: getSortClass('status'),
            sortIndicator: getSortIndicator('status'),
            onSort: handleSort,
            render: (city) => (
                <span className={`status ${city.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                    {city.status}
                </span>
            )
        }
    ];

    // Get filtered cities with multiple search fields
    const getFilteredCities = () => {
        return getFilteredData(['cityName', 'stateName', 'countryName', 'postalCode']);
    };

    // Get paginated cities with search fields
    const getPaginatedCities = () => {
        return getPaginatedData(['cityName', 'stateName', 'countryName', 'postalCode']);
    };

    // API handlers
    const isDuplicateCity = (cityName, postalCode, excludeId = null) => {
        return cities.some(
            (city) =>
                (excludeId ? city.id !== excludeId : true) &&
                (city.cityName.toLowerCase().trim() === cityName.toLowerCase().trim() ||
                    city.postalCode === postalCode)
        );
    };

    const handleCityApiResponse = async (
        result,
        cityData,
        successMsg,
        fetchCitiesCallback
    ) => {
        if (result.success && (!result.statusCode || result.statusCode === 200)) {
            await fetchCitiesCallback();
            toast.success(successMsg);
            return true;
        } else if (result.statusCode === 409) {
            toast.error(
                `City "${cityData.cityName}" or postal code "${cityData.postalCode}" already exists! Please choose different values.`
            );
        } else {
            toast.error(
                result.message ||
                `Failed to ${successMsg
                    .toLowerCase()
                    .replace(" successfully!", "")}`
            );
        }
        return false;
    };

    const updateCity = async (cityData) => {
        try {
            let result;
            let requestData;

            try {
                requestData = {
                    id: editingItem.id,
                    cityName: cityData.cityName,
                    postalCode: cityData.postalCode,
                    stateId: cityData.stateId,
                    countryId: cityData.countryId,
                    status: cityData.status.toLowerCase() === "active"
                };

                console.log("Update city request data (boolean format):", requestData);

                result = await apiHelper.put(API_ENDPOINTS.CITIES.UPDATE, requestData);

                if (result.success) {
                    return await handleCityApiResponse(
                        result,
                        cityData,
                        "City updated successfully!",
                        fetchCities
                    );
                }
                console.log("Boolean format failed, trying string format...");
            } catch (err) {
                console.log("Boolean format error:", err.message);
            }

            try {
                requestData = {
                    id: editingItem.id,
                    cityName: cityData.cityName,
                    postalCode: cityData.postalCode,
                    stateId: cityData.stateId,
                    countryId: cityData.countryId,
                    status: cityData.status.toLowerCase() === "active" ? "True" : "False"
                };

                console.log("Update city request data (string format):", requestData);

                result = await apiHelper.put(API_ENDPOINTS.CITIES.UPDATE, requestData);

                return await handleCityApiResponse(
                    result,
                    cityData,
                    "City updated successfully!",
                    fetchCities
                );
            } catch (err) {
                console.log("String format error:", err.message);
                throw err;
            }
        } catch (err) {
            console.error("Update city error:", err);
            toast.error(`Failed to update city: ${err.message}`);
            return false;
        }
    };

    const createCity = async (cityData) => {
        try {
            const requestData = {
                cityName: cityData.cityName,
                postalCode: cityData.postalCode,
                stateId: cityData.stateId,
                countryId: cityData.countryId
            };

            console.log("Create city request data:", requestData);

            const result = await apiHelper.post(API_ENDPOINTS.CITIES.CREATE, requestData);

            return await handleCityApiResponse(
                result,
                cityData,
                "City created successfully!",
                fetchCities
            );
        } catch (err) {
            console.error("Create city error:", err);
            toast.error(`Failed to create city: ${err.message}`);
            return false;
        }
    };

    const handleSaveCity = async (cityData) => {
        try {
            setOperationLoading(true);

            // Validate required IDs
            if (!cityData.stateId) {
                toast.error("Please select a valid state");
                return;
            }
            if (!cityData.countryId) {
                toast.error("Please select a valid country");
                return;
            }

            if (isDuplicateCity(cityData.cityName, cityData.postalCode, editingItem?.id)) {
                toast.error("City name or postal code already exists");
                return;
            }

            let operationSuccessful = false;

            if (editingItem) {
                operationSuccessful = await updateCity(cityData);
            } else {
                operationSuccessful = await createCity(cityData);
            }

            if (operationSuccessful) {
                closeModals();
            }
        } catch (err) {
            toast.error("Error saving city. Please try again.");
            console.error("Error saving city:", err);
        } finally {
            setOperationLoading(false);
        }
    };

    const handleConfirmDelete = async (cityId) => {
        try {
            setOperationLoading(true);

            const result = await apiHelper.delete(API_ENDPOINTS.CITIES.DELETE(cityId));

            if (result.success) {
                await fetchCities();
                toast.success("City deleted successfully!");
            } else {
                toast.error("Failed to delete city");
            }

            closeModals();
        } catch (err) {
            toast.error("Error deleting city");
            console.error("Error deleting city:", err);
        } finally {
            setOperationLoading(false);
        }
    };

    // Error state
    if (error) {
        return (
            <div className="table-container">
                <div className="page-header">
                    <h1>Cities</h1>
                </div>
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <>
            <CommonTable
                title="Cities"
                data={getPaginatedCities()}
                columns={columns}
                loading={loading}
                operationLoading={operationLoading}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                onClearSearch={clearSearch}
                onAdd={handleAdd}
                searchPlaceholder="Search cities, states, countries..."
                addButtonText="Add City"
                noDataMessage="No cities found"
                searchResultsCount={getFilteredCities().length}
            >
                {(city) => (
                    <>
                        <button
                            className="btn-view"
                            title="View City Details"
                            onClick={() => handleView(city)}
                            disabled={operationLoading}
                        >
                            👁️
                        </button>
                        <button
                            className="btn-edit"
                            title="Edit City"
                            onClick={() => handleEdit(city)}
                            disabled={operationLoading}
                        >
                            ✏️
                        </button>
                        <button
                            className="btn-delete"
                            title="Delete City"
                            onClick={() => handleDelete(city)}
                            disabled={operationLoading}
                        >
                            🗑️
                        </button>
                    </>
                )}
            </CommonTable>

            {getFilteredCities().length > 0 && (
                <CommonPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={getFilteredCities().length}
                    searchTerm={searchTerm}
                    onPageChange={handlePageChange}
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
                />
            )}

            {/* Modals */}
            <CityFormModal
                isOpen={isFormModalOpen}
                onClose={closeModals}
                city={editingItem}
                onSave={handleSaveCity}
                loading={operationLoading}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={closeModals}
                city={selectedItem}
                onConfirm={handleConfirmDelete}
                loading={operationLoading}
            />

            <ViewCityModal
                isOpen={isViewModalOpen}
                onClose={closeModals}
                city={selectedItem}
            />
        </>
    );
};