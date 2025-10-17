-- Add price_per_unit column to medicine_inventory table
ALTER TABLE public.medicine_inventory 
ADD COLUMN price_per_unit DECIMAL(10,2) DEFAULT 0.00;

-- Create customers table
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email),
  UNIQUE(phone)
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  gst_enabled BOOLEAN DEFAULT false,
  gst_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sale_items table
CREATE TABLE public.sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES public.medicine_inventory(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for customers
CREATE POLICY "Healthcare staff can view customers" 
ON public.customers 
FOR SELECT 
USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Pharmacists and admins can manage customers" 
ON public.customers 
FOR ALL 
USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for sales
CREATE POLICY "Healthcare staff can view sales" 
ON public.sales 
FOR SELECT 
USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Pharmacists and admins can manage sales" 
ON public.sales 
FOR ALL 
USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for sale_items
CREATE POLICY "Healthcare staff can view sale items" 
ON public.sale_items 
FOR SELECT 
USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Pharmacists and admins can manage sale items" 
ON public.sale_items 
FOR ALL 
USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();