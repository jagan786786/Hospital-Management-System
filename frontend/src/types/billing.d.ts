export interface Customer {
  id: string; // optional
  name: string;
  email: string;
  phone: string;
  address?: string; // optional
}

export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  isPatient?: boolean;
}

export interface InventoryItem {
  _id: string;
  brand_name: string;
  generic_name: string;
  form: string;
  strength?: string;
  quantity_available: number;
  selling_price?: number;
  manufacturer?: string;
}

export interface SaleItem {
  medicine_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  customer_id: string;
  subtotal: number;
  gst_enabled: boolean;
  gst_amount: number;
  coupon_code?: string;
  discount_amount?: number;
  total_amount: number;
  sale_items: SaleItem[];
}

// export interface SaleItem {
//   _id: string;
//   medicine_id: string;
//   name: string;
//   quantity: number;
//   unit_price: number;
//   total_price: number;
//   created_at: string;
// }

// export interface Sale {
//   _id: string;
//   customer_id: string;
//   subtotal: number;
//   gst_enabled: boolean;
//   gst_amount: number;
//   total_amount: number;
//   status: string;
//   coupon_code: string | null;
//   discount_amount: number;
//   sale_items: SaleItem[];
//   created_at: string;
//   updated_at: string;
//   __v?: number;
// }
