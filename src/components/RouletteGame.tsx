
import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import Swiper styles
import 'swiper/css';

// Define the roulette item interface
interface RouletteItem {
  id: number;
  label: string;
  color: string;
}

const RouletteGame: React.FC = () => {
  // Create swiper instance ref
  const swiperRef = useRef<any>(null);
  
  // Game state
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<RouletteItem | null>(null);
  const [animationId, setAnimationId] = useState<number | null>(null);
  
  // Roulette items - you can customize these
  const rouletteItems: RouletteItem[] = [
    { id: 1, label: "Prize 1", color: "bg-red-500" },
    { id: 2, label: "Prize 2", color: "bg-blue-500" },
    { id: 3, label: "Prize 3", color: "bg-green-500" },
    { id: 4, label: "Prize 4", color: "bg-yellow-500" },
    { id: 5, label: "Prize 5", color: "bg-purple-500" },
    { id: 6, label: "Prize 6", color: "bg-pink-500" },
    { id: 7, label: "Prize 7", color: "bg-indigo-500" },
    { id: 8, label: "Prize 8", color: "bg-orange-500" },
  ];

  // Create a larger array of items to ensure continuous looping
  // We use a lot of duplicates to ensure smooth infinite looping
  const duplicatedItems = [...rouletteItems, ...rouletteItems, ...rouletteItems, ...rouletteItems, ...rouletteItems];
  
  // Function to start the roulette
  const startRoulette = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Set initial speed and position
    let speed = 100; // Initial speed (pixels per animation frame)
    let deceleration = 0.98; // Rate of deceleration (0.98 = 2% slower each step)
    let minSpeed = 0.5; // Minimum speed before stopping
    
    // Start from a random position for variety
    const startPosition = Math.floor(Math.random() * rouletteItems.length) * 200;
    
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.setTranslate(-startPosition);
      
      let totalDistance = 0;
      const itemWidth = 200; // Width of each item
      
      // Animation function for smooth deceleration
      const animate = () => {
        if (!swiperRef.current || !swiperRef.current.swiper) return;
        
        const swiper = swiperRef.current.swiper;
        let currentTranslate = swiper.getTranslate();
        
        // Apply the current speed
        currentTranslate -= speed;
        totalDistance += speed;
        
        // Handle looping - if we've moved too far, reset position while maintaining visual continuity
        const totalWidth = itemWidth * rouletteItems.length;
        
        // If we've moved beyond the width of one set of items, loop back
        if (Math.abs(currentTranslate) > totalWidth * 3) {
          // Reset position to maintain the same visual item but earlier in the sequence
          currentTranslate = currentTranslate % totalWidth;
        }
        
        swiper.setTranslate(currentTranslate);
        
        // Reduce speed gradually
        speed *= deceleration;
        
        // Continue animation or stop
        if (speed > minSpeed) {
          const id = requestAnimationFrame(animate);
          setAnimationId(id);
        } else {
          // When almost stopped, ensure the center item is properly aligned
          alignCenterItem(currentTranslate);
        }
      };
      
      // Start the animation
      const id = requestAnimationFrame(animate);
      setAnimationId(id);
    }
  };
  
  // Function to ensure center item alignment when stopping
  const alignCenterItem = (currentTranslate: number) => {
    if (!swiperRef.current || !swiperRef.current.swiper) return;
    
    const itemWidth = 200; // Width of each roulette item
    
    // Calculate the current position in terms of items
    const currentItem = Math.abs(currentTranslate) / itemWidth;
    
    // Calculate the nearest item position that would center an item
    const nearestCenteredItem = Math.round(currentItem);
    
    // Calculate the exact translate value that would center this item
    const targetTranslate = -(nearestCenteredItem * itemWidth);
    
    // Smoothly animate to the centered position
    const startTranslate = currentTranslate;
    const distance = targetTranslate - startTranslate;
    let progress = 0;
    
    const smoothAlign = () => {
      if (!swiperRef.current || !swiperRef.current.swiper) return;
      
      progress += 0.05; // Increment by 5% each frame
      
      if (progress >= 1) {
        // Animation complete - set final position and finish
        swiperRef.current.swiper.setTranslate(targetTranslate);
        finishRoulette(targetTranslate);
        return;
      }
      
      // Easing function for smooth motion (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // Calculate current position
      const newTranslate = startTranslate + (distance * easedProgress);
      swiperRef.current.swiper.setTranslate(newTranslate);
      
      // Continue animation
      requestAnimationFrame(smoothAlign);
    };
    
    smoothAlign();
  };
  
  // Function to handle the end of the roulette animation
  const finishRoulette = (finalPosition: number) => {
    if (!swiperRef.current || !swiperRef.current.swiper) return;
    
    // Calculate which item is selected (centered)
    const itemWidth = 200; // Width of each roulette item
    const adjustedPosition = Math.abs(finalPosition);
    const selectedIndex = Math.round(adjustedPosition / itemWidth) % rouletteItems.length;
    const selectedItem = rouletteItems[selectedIndex];
    
    // Set the result and update game state
    setResult(selectedItem);
    setIsSpinning(false);
    
    // Display the result
    toast.success(`You've won: ${selectedItem.label}!`);
  };
  
  // Clean up animation on component unmount
  useEffect(() => {
    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [animationId]);

  // Initialize swiper with infinite loop settings
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper;
      // Set initial position to the middle of the duplicated items
      const initialPosition = -(rouletteItems.length * 200 * 2);
      swiper.setTranslate(initialPosition);
    }
  }, [rouletteItems.length]);

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Roulette Game</h2>
        <p className="text-muted-foreground">Press the button to spin the roulette and win a prize!</p>
      </div>
      
      {/* Roulette container with indicator */}
      <div className="relative mb-8">
        {/* Center indicator */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary z-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full border-4 border-primary z-10 bg-background"></div>
        
        {/* Swiper container */}
        <div className="overflow-hidden">
          <Swiper
            ref={swiperRef}
            slidesPerView={5}
            spaceBetween={0}
            centeredSlides={true}
            allowTouchMove={false}
            initialSlide={rouletteItems.length * 2} // Start from the middle set of items
            className="roulette-swiper"
          >
            {duplicatedItems.map((item, index) => (
              <SwiperSlide key={`${item.id}-${index}`} className="flex justify-center p-2">
                <div 
                  className={cn(
                    "w-40 h-40 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md transition-transform",
                    item.color,
                    result?.id === item.id ? "ring-4 ring-white ring-opacity-70 scale-105" : ""
                  )}
                >
                  {item.label}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      
      {/* Game controls */}
      <div className="text-center">
        <Button 
          size="lg" 
          disabled={isSpinning}
          onClick={startRoulette}
          className="px-8 py-6 text-lg"
        >
          {isSpinning ? "Spinning..." : "Spin the Roulette!"}
        </Button>
        
        {result && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="font-medium">You won:</p>
            <p className="text-xl font-bold">{result.label}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouletteGame;
