-- Create cart_items table for Supabase
CREATE TABLE IF NOT EXISTS public.cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_phone TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for cart_items
CREATE POLICY "Users can view their own cart items" ON public.cart_items
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own cart items" ON public.cart_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own cart items" ON public.cart_items
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
    FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON public.cart_items TO anon;
GRANT ALL ON public.cart_items TO authenticated;
GRANT USAGE ON SEQUENCE public.cart_items_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.cart_items_id_seq TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_phone ON public.cart_items(user_phone);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);