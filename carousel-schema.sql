-- Drop existing table if exists
DROP TABLE IF EXISTS public.carousel_items CASCADE;

-- Create carousel_items table in Supabase
CREATE TABLE public.carousel_items (
    id BIGSERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for now
ALTER TABLE public.carousel_items DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.carousel_items TO anon;
GRANT ALL ON public.carousel_items TO authenticated;
GRANT USAGE ON SEQUENCE public.carousel_items_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.carousel_items_id_seq TO authenticated;

-- Create index for better performance
CREATE INDEX idx_carousel_items_active ON public.carousel_items(is_active);
CREATE INDEX idx_carousel_items_order ON public.carousel_items(display_order);

-- Insert sample data for testing
INSERT INTO public.carousel_items (product_id, product_name, title, description, image_url, price, is_active, display_order) VALUES
(1, 'Fresh Tomatoes', '🍅 Fresh Farm Tomatoes', 'Premium quality red tomatoes straight from the farm', 'https://images.unsplash.com/photo-1546470427-e5d491d7e4b8?w=800&h=400&fit=crop', 40.00, true, 1);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';