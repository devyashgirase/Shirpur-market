import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabaseApi } from '@/lib/supabase';

interface Banner {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
}

const BannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => {
          const next = (prev + 1) % banners.length;
          console.log('Auto-sliding from', prev, 'to', next, 'total banners:', banners.length);
          return next;
        });
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      const carouselBanners = await supabaseApi.getCarouselBanners();
      console.log('Loaded banners:', carouselBanners?.length || 0);
      setBanners(carouselBanners || []);
    } catch (error) {
      console.error('Failed to load carousel banners:', error);
      setBanners([]); // Show default banner on error
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading) {
    return (
      <div className="relative w-full h-56 md:h-72 lg:h-96 overflow-hidden bg-gray-200 animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500">Loading banners...</div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-56 md:h-72 lg:h-96 overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center px-4">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Welcome to Shirpur Delivery</h2>
            <p className="text-sm md:text-lg opacity-90">Fresh groceries delivered to your doorstep</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-56 md:h-72 lg:h-96 overflow-hidden mx-auto max-w-full">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-500 ease-in-out ${
            index === currentSlide 
              ? 'opacity-100 transform translate-x-0' 
              : 'opacity-0 transform translate-x-full'
          }`}
        >
          <div 
            className="w-full h-full relative cursor-pointer"
            onClick={() => {
              console.log('Banner clicked:', banner.link_url);
              if (banner.link_url) {
                if (banner.link_url.startsWith('product:')) {
                  const productId = banner.link_url.replace('product:', '');
                  console.log('Opening product modal:', productId);
                  window.dispatchEvent(new CustomEvent('productSelected', { detail: productId }));
                } else if (banner.link_url.includes('/product/')) {
                  const productId = banner.link_url.split('/product/')[1];
                  console.log('Opening product modal:', productId);
                  window.dispatchEvent(new CustomEvent('productSelected', { detail: productId }));
                } else if (banner.link_url.startsWith('category:')) {
                  const categoryId = banner.link_url.replace('category:', '');
                  console.log('Setting category:', categoryId);
                  window.dispatchEvent(new CustomEvent('categorySelected', { detail: categoryId }));
                  setTimeout(() => {
                    document.getElementById(`category-${categoryId}`)?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  console.log('Unknown link format:', banner.link_url);
                }
              } else {
                console.log('No link_url found for banner');
              }
            }}
          >
            {banner.image_url ? (
              <>
                <img 
                  src={banner.image_url} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />

              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
            )}

          </div>
        </div>
      ))}

      {/* Navigation Buttons - Only show if multiple banners */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            onClick={prevSlide}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            onClick={nextSlide}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;