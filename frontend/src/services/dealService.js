import api from "./api";

// ===========================
// Get All Deals
// ===========================

export const getAllDeals = async () => {

  const response = await api.get("/deals");

  return response.data;

};

// ===========================
// Get Single Deal
// ===========================

export const getDealById = async (id) => {

  const response = await api.get(`/deals/${id}`);

  return response.data;

};

// ===========================
// Create Deal
// ===========================

export const createDeal = async (data) => {

  const response = await api.post("/deals", data);

  return response.data;

};

// ===========================
// Update Deal
// ===========================

export const updateDeal = async (id, data) => {

  const response = await api.put(`/deals/${id}`, data);

  return response.data;

};

// ===========================
// Delete Deal
// ===========================

export const deleteDeal = async (id) => {

  const response = await api.delete(`/deals/${id}`);

  return response.data;

};

// ===========================
// Change Stage
// ===========================

export const changeDealStage = async (

  id,

  stage

) => {

  const response = await api.put(

    `/deals/${id}/stage`,

    {

      stage,

    }

  );

  return response.data;

};

// ===========================
// Add Note
// ===========================

export const addDealNote = async (

  id,

  text

) => {

  const response = await api.post(

    `/deals/${id}/note`,

    {

      text,

    }

  );

  return response.data;

};
export const updateDealStage = async (

  id,

  stage

) => {

  const response = await api.put(

    `/deals/${id}/stage`,

    {

      stage,

    }

  );

  return response.data;

};