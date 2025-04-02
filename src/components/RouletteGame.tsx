
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Define the roulette item interface
interface RouletteItem {
  id: number;
  label: string;
  color: string;
}

const RouletteGame: React.FC = () => {
  // Wheel ref
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Game state
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<RouletteItem | null>(null);
  const [rotation, setRotation] = useState(0);
  const isMobile = useIsMobile();
  
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

  // Calculate the angle for each segment
  const segmentAngle = 360 / rouletteItems.length;
  
  // Function to start the roulette
  const startRoulette = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Calculate random number of full rotations (3-6 full rotations)
    const fullRotations = 3 + Math.floor(Math.random() * 4);
    
    // Calculate random final position (0 to items.length-1)
    const randomSegment = Math.floor(Math.random() * rouletteItems.length);
    
    // Calculate total rotation in degrees
    // We add a small offset to ensure the wheel stops in the middle of a segment
    const targetRotation = rotation + (fullRotations * 360) + (randomSegment * segmentAngle);
    
    // Animate the wheel
    if (wheelRef.current) {
      // Apply CSS transition for smooth spinning
      wheelRef.current.style.transition = 'transform 5s cubic-bezier(0.2, 0.1, 0.1, 1)';
      wheelRef.current.style.transform = `rotate(${targetRotation}deg)`;
      
      // Update the internal rotation state
      setRotation(targetRotation);
      
      // Set the result after animation ends
      setTimeout(() => {
        finishRoulette(randomSegment);
      }, 5000); // 5 seconds - same as transition duration
    }
  };
  
  // Function to handle the end of the roulette animation
  const finishRoulette = (segmentIndex: number) => {
    // The winning segment is opposite to the pointer (which points to the top)
    // Since the wheel rotates clockwise, we need to find the opposite segment
    const winningIndex = (rouletteItems.length - segmentIndex) % rouletteItems.length;
    const selectedItem = rouletteItems[winningIndex];
    
    // Set the result and update game state
    setResult(selectedItem);
    setIsSpinning(false);
    
    // Display the result
    toast.success(`You've won: ${selectedItem.label}!`);
  };
  
  // Reset wheel transition after spinning
  useEffect(() => {
    if (!isSpinning && wheelRef.current) {
      // Remove transition after spinning completes for instant response on next spin
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'none';
        }
      }, 50);
    }
  }, [isSpinning]);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8">
      <div className="mb-4 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Roulette Game</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Press the button to spin the roulette and win a prize!</p>
      </div>
      
      {/* Roulette wheel container with indicator */}
      <div className="relative mb-6 sm:mb-8 flex justify-center">
        {/* The pointer/indicator at the top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
          <div className="w-6 h-6 bg-primary transform rotate-45"></div>
        </div>
        
        {/* Container for the wheel */}
        <div className={cn(
          "relative",
          isMobile ? "w-64 h-64" : "w-80 h-80",
          "rounded-full border-4 border-gray-300 overflow-hidden"
        )}>
          {/* The rotating wheel */}
          <div 
            ref={wheelRef}
            className="w-full h-full absolute"
          >
            {/* Wheel segments */}
            {rouletteItems.map((item, index) => {
              // Calculate rotation for this segment
              const rotation = index * segmentAngle;
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "absolute w-full h-full origin-center",
                    item.color
                  )}
                  style={{
                    transform: `rotate(${rotation}deg) skewY(${90 - segmentAngle}deg)`,
                    transformOrigin: "center bottom"
                  }}
                >
                  {/* Segment text */}
                  <div 
                    className={cn(
                      "absolute whitespace-nowrap left-1/2 text-white font-bold",
                      isMobile ? "text-sm top-6" : "text-lg top-8"
                    )}
                    style={{
                      transform: `translateX(-50%) rotate(${segmentAngle/2}deg)`,
                      transformOrigin: "center bottom"
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Center of wheel */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-800 z-10"></div>
        </div>
      </div>
      
      {/* Game controls */}
      <div className="text-center">
        <Button 
          size={isMobile ? "default" : "lg"} 
          disabled={isSpinning}
          onClick={startRoulette}
          className={isMobile ? "px-6 py-4" : "px-8 py-6 text-lg"}
        >
          {isSpinning ? "Spinning..." : "Spin the Roulette!"}
        </Button>
        
        {result && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted rounded-lg">
            <p className="font-medium">You won:</p>
            <p className="text-lg sm:text-xl font-bold">{result.label}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouletteGame;
