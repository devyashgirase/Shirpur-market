import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext<{
  currentIndex: number
  setCurrentIndex: (index: number) => void
  itemsLength: number
} | null>(null)

interface CarouselProps {
  children: React.ReactNode
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ children, className, autoPlay = false, autoPlayInterval = 3000 }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const items = React.Children.toArray(children)
    const itemsLength = items.length

    React.useEffect(() => {
      if (autoPlay && itemsLength > 1) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % itemsLength)
        }, autoPlayInterval)
        return () => clearInterval(interval)
      }
    }, [autoPlay, autoPlayInterval, itemsLength])

    return (
      <CarouselContext.Provider value={{ currentIndex, setCurrentIndex, itemsLength }}>
        <div ref={ref} className={cn("relative", className)}>
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(CarouselContext)
    if (!context) throw new Error("CarouselContent must be used within Carousel")

    return (
      <div
        ref={ref}
        className={cn("overflow-hidden", className)}
        {...props}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${context.currentIndex * 100}%)`,
          }}
        >
          {children}
        </div>
      </div>
    )
  }
)
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
        {...props}
      />
    )
  }
)
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const context = React.useContext(CarouselContext)
    if (!context) throw new Error("CarouselPrevious must be used within Carousel")

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full",
          className
        )}
        onClick={() => {
          const newIndex = context.currentIndex === 0 
            ? context.itemsLength - 1 
            : context.currentIndex - 1
          context.setCurrentIndex(newIndex)
        }}
        {...props}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    )
  }
)
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const context = React.useContext(CarouselContext)
    if (!context) throw new Error("CarouselNext must be used within Carousel")

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full",
          className
        )}
        onClick={() => {
          const newIndex = (context.currentIndex + 1) % context.itemsLength
          context.setCurrentIndex(newIndex)
        }}
        {...props}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    )
  }
)
CarouselNext.displayName = "CarouselNext"

const CarouselDots = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(CarouselContext)
    if (!context) throw new Error("CarouselDots must be used within Carousel")

    return (
      <div
        ref={ref}
        className={cn("flex justify-center space-x-2 mt-4", className)}
        {...props}
      >
        {Array.from({ length: context.itemsLength }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === context.currentIndex
                ? "bg-primary"
                : "bg-muted-foreground/30"
            )}
            onClick={() => context.setCurrentIndex(index)}
          />
        ))}
      </div>
    )
  }
)
CarouselDots.displayName = "CarouselDots"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
}