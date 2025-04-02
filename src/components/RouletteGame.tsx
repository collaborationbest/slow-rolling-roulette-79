import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import './RouletteWheel.css';

// Define the roulette item interface
interface RouletteItem {
  id: number;
  label: string;
  color: string;
  probability?: number; // Optional: for weighted probabilities
}

const RouletteGame: React.FC = () => {
  // Game state
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<RouletteItem | null>(null);
  const [spinDegree, setSpinDegree] = useState(0);
  const [totalRotation, setTotalRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
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
  
  // Function to start the roulette
  const startRoulette = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setResult(null);
    
    // Calculate segment angle
    const segmentAngle = 360 / rouletteItems.length;
    
    // Determine the number of full rotations (between 3-5)
    const fullRotations = 3 + Math.floor(Math.random() * 3); // 3-5 full rotations
    
    // Determine the winning prize
    const winningIndex = Math.floor(Math.random() * rouletteItems.length);
    
    // Calculate final stopping position 
    // We add 360 * fullRotations for the complete turns, then add the specific segment position
    // We subtract the segment angle because our indicator is at top (0 degrees)
    const rotation = 360 * fullRotations + (winningIndex * segmentAngle);
    
    // Set new total rotation (keep track of accumulated rotation)
    const newTotalRotation = totalRotation + rotation;
    setTotalRotation(newTotalRotation);
    
    // Spin the wheel with CSS animation
    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 5s cubic-bezier(0.1, 0.7, 0.1, 1)";
      wheelRef.current.style.transform = `rotate(${newTotalRotation}deg)`;
    }
    
    // After animation completes, show result
    setTimeout(() => {
      setIsSpinning(false);
      const selectedItem = rouletteItems[winningIndex];
      setResult(selectedItem);
      toast.success(`You've won: ${selectedItem.label}!`);
    }, 5000); // Match this time with the CSS transition duration
  };

  // Calculate segment size based on number of items
  const segmentAngle = 360 / rouletteItems.length;
  
  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8">
      <div className="mb-4 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Roulette Game</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Press the button to spin the roulette and win a prize!</p>
      </div>
      
      {/* Roulette wheel container */}
      <div className="roulette-container relative mx-auto mb-8">
        {/* Indicator/pointer */}
        <div className="wheel-pointer"></div>
        
        {/* The wheel itself */}
        <div 
          ref={wheelRef} 
          className="roulette-wheel"
          style={{ 
            transform: `rotate(${totalRotation}deg)`
          }}
        >
          {rouletteItems.map((item, index) => {
            // Calculate rotation for this segment
            const rotation = index * segmentAngle;
            
            return (
              <div
                key={item.id}
                className={cn(
                  "wheel-segment",
                  item.color,
                  result?.id === item.id ? "segment-winner" : ""
                )}
                style={{
                  transform: `rotate(${rotation}deg) skewY(${90 - segmentAngle}deg)`,
                  transformOrigin: "50% 100%"
                }}
              >
                <span 
                  className="segment-label" 
                  style={{ 
                    transform: `skewY(${-(90 - segmentAngle)}deg) rotate(${segmentAngle / 2}deg)` 
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
          
          {/* Inner circle */}
          <div className="wheel-inner-circle"></div>
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
