import api from "../axios";
import { Customer, Patient, InventoryItem, Sale } from "@/types/billing"; // assuming you have a Customer type

// Fetch all customers
export const getCustomers = async (): Promise<Customer[]> => {
  const res = await api.get("/customer/getCustomers"); // your local endpoint
  return res.data;
};

// Create a new customer
export const createCustomer = async (
  customer: Omit<Customer, "id">
): Promise<Customer> => {
  const res = await api.post("/customer/createCustomer", customer);
  return res.data;
};

// Update an existing customer
export const updateCustomer = async (
  customerId: string,
  updates: Partial<Customer>
): Promise<Customer> => {
  const res = await api.put(`/customer/updateCustomer/${customerId}`, updates);
  return res.data;
};

//get all the patient details
export const getPatients = async (): Promise<Patient[]> => {
  const res = await api.get("/patients/getPatients");
  const raw = res.data || [];

  // Normalize: ensure consistent structure
  const normalized = raw.map((p: any) => ({
    id: p.id || p._id || "", // fallback if backend uses _id
    patient_id: p.patient_id || "", // fallback if backend uses _id
    first_name: p.first_name,
    last_name: p.last_name,
    email: p.email,
    phone: p.phone,
    isPatient: true, // preserve the patient flag if your UI uses it
  }));

  return normalized;
};

// Get all medicines
export const getInventory = async (): Promise<InventoryItem[]> => {
  const res = await api.get("/inventory/getInventories");
  return res.data;
};

// Update stock quantity for a specific medicine
export const updateStock = async (
  medicineId: string,
  stock_quantity: number
): Promise<InventoryItem> => {
  const res = await api.put(`/inventory/updateInventory/${medicineId}`, {
    stock_quantity,
  });
  return res.data;
};

export const createSale = async (sale: Omit<Sale, "id">): Promise<Sale> => {
  const res = await api.post("/sale/createSale", sale);
  return res.data;
};

// Fetch all sales (with sale_items)
export const getSales = async (): Promise<Sale[]> => {
  const res = await api.get("/sale/getSales");
  return res.data;
};
