import api from "./api";

// ================================
// Get All Customers
// ================================

export const getAllCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};

// ================================
// Get Single Customer
// ================================

export const getCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

// ================================
// Create Customer
// ================================

export const createCustomer = async (customerData) => {
  const response = await api.post(
    "/customers",
    customerData
  );
  return response.data;
};

// ================================
// Update Customer
// ================================

export const updateCustomer = async (
  id,
  customerData
) => {
  const response = await api.put(
    `/customers/${id}`,
    customerData
  );
  return response.data;
};

// ================================
// Delete Customer
// ================================

export const deleteCustomer = async (id) => {
  const response = await api.delete(
    `/customers/${id}`
  );
  return response.data;
};

// ================================
// Add Customer Note
// ================================

export const addCustomerNote = async (
  id,
  text
) => {
  const response = await api.post(
    `/customers/${id}/note`,
    { text }
  );
  return response.data;
};