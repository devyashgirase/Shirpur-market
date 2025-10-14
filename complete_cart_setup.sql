-- Drop existing table if it has issues
DROP TABLE IF EXISTS public.cart_items CASCADE;

-- Create cart_items table
CREATE TABLE public.cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_phone TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON public.cart_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.cart_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.cart_items FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON public.cart_items TO anon;
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
GRANT USAGE ON SEQUENCE public.cart_items_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.cart_items_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.cart_items_id_seq TO service_role;

-- Create indexes
CREATE INDEX idx_cart_items_user_phone ON public.cart_items(user_phone);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- Refresh schema
NOTIFY pgrst, 'reload schema';