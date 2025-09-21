// src/api/services/supplier.ts
import api from "../axios";

// ✅ Get all suppliers
export const getSuppliers = async () => {
  const response = await api.get("/supplier/getSuppliers");
  return response.data; // expected array of suppliers
};

// ✅ Get single supplier by ID
export const getSupplierById = async (id: string) => {
  const response = await api.get(`/supplier/getSupplierById/${id}`);
  return response.data;
};

// ✅ Create new supplier
export const createSupplier = async (supplierData: {
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  address?: string;
  gst_number?: string;
}) => {
  const response = await api.post("/supplier/createSupplier", supplierData);
  return response.data;
};

// ✅ Update supplier
export const updateSupplier = async (id: string, supplierData: Partial<{
  supplier_name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  address?: string;
  gst_number?: string;
  is_active?: boolean;
}>) => {
  const response = await api.put(`/supplier/updateSupplier/${id}`, supplierData);
  return response.data;
};

// ✅ Delete supplier
export const deleteSupplier = async (id: string) => {
  const response = await api.delete(`/supplier/deleteSupplier/${id}`);
  return response.data;
};
