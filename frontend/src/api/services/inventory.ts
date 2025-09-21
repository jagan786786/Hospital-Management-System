import api from "../axios";

// ✅ Fetch all inventory items
export const getInventory = async () => {
  const response = await api.get("/inventory/getInventories"); // adjust endpoint if needed
  return response.data;
};

// ✅ Fetch a single inventory item by ID
export const getInventoryById = async (id: string) => {
  const response = await api.get(`/inventory/getInventoryById/${id}`);
  return response.data;
};

// ✅ Create new inventory item
export const createInventory = async (payload: any) => {
  const response = await api.post("/inventory/createInventory", payload);
  return response.data;
};

// ✅ Update existing inventory item
export const updateInventory = async (id: string, payload: any) => {
  const response = await api.put(`/inventory/updateInventory/${id}`, payload);
  return response.data;
};

// ✅ Delete inventory item
export const deleteInventory = async (id: string) => {
  const response = await api.delete(`/inventory/deleteInventory/${id}`);
  return response.data;
};
