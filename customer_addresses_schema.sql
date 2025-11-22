-- Customer Addresses Table Schema for Supabase
-- Run this in Supabase SQL Editor

CREATE TABLE public.customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_phone VARCHAR(15) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    coordinates JSONB,
    address_type VARCHAR(50) DEFAULT 'other',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_customer_addresses_phone ON public.customer_addresses(customer_phone);
CREATE INDEX idx_customer_addresses_default ON public.customer_addresses(is_default);

-- Enable RLS
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Allow all operations policy
CREATE POLICY "Allow all operations" ON public.customer_addresses FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_customer_addresses_updated_at 
    BEFORE UPDATE ON public.customer_addresses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample addresses
INSERT INTO public.customer_addresses (customer_phone, name, phone, address, landmark, city, state, pincode, address_type, is_default) VALUES
('+919876543210', 'Rahul Sharma', '+919876543210', 'Shop No 15, Main Market', 'Near SBI Bank', 'Shirpur', 'Maharashtra', '425405', 'home', true),
('+919876543211', 'Priya Patel', '+919876543211', 'Flat 201, Sunrise Apartment', 'Bus Stand Road', 'Shirpur', 'Maharashtra', '425405', 'home', true);

SELECT 'Customer Addresses table created successfully!' as message;