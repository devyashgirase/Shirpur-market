import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const panCornerBanners = [
  {
    id: 1,
    title: 'Fresh Pan Masala',
    subtitle: 'Premium quality pan ingredients',
    color: 'bg-gradient-to-r from-green-600 to-emerald-700'
  },
  {
    id: 2,
    title: 'Betel Leaves Special',
    subtitle: 'Fresh betel leaves daily',
    color: 'bg-gradient-to-r from-emerald-600 to-green-700'
  },
  {
    id: 3,
    title: 'Pan Corner Combo',
    subtitle: 'Complete pan making kit',
    color: 'bg-gradient-to-r from-teal-600 to-green-600'
  }
];

interface PanCornerCarouselProps {
  onBannerClick: () => void;
}

const PanCornerCarousel = ({ onBannerClick }: PanCornerCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % panCornerBanners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % panCornerBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + panCornerBanners.length) % panCornerBanners.length);
  };

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-lg cursor-pointer" onClick={onBannerClick}>
      {panCornerBanners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className={`w-full h-full ${banner.color} flex items-center justify-center text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="relative z-10 text-center px-4">
              <h3 className="text-xl md:text-3xl font-bold mb-2">🌿 {banner.title}</h3>
              <p className="text-sm md:text-base opacity-90">{banner.subtitle}</p>
              <div className="mt-3">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  Click to explore →
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
        {panCornerBanners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(index);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PanCornerCarousel;