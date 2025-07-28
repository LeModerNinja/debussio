import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

/**
 * Interactive star rating component that supports half-star precision
 * Click on the left half of a star for .5 rating, right half for full rating
 */
export function StarRating({ rating, onRatingChange, size = 'md', readonly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };
  
  const displayRating = hoverRating !== null ? hoverRating : rating;
  
  const handleMouseMove = (starIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const isLeftHalf = x < width / 2;
    
    const newRating = starIndex + (isLeftHalf ? 0.5 : 1);
    setHoverRating(newRating);
  };
  
  const handleClick = (starIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const isLeftHalf = x < width / 2;
    
    const newRating = starIndex + (isLeftHalf ? 0.5 : 1);
    onRatingChange(newRating);
  };
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(null);
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          const filled = displayRating >= starValue;
          const halfFilled = displayRating >= i + 0.5 && displayRating < starValue;
          
          return (
            <div
              key={i}
              className={`relative ${readonly ? '' : 'cursor-pointer'}`}
              onMouseMove={(e) => handleMouseMove(i, e)}
              onClick={(e) => handleClick(i, e)}
            >
              {/* Background star (empty) */}
              <Star className={`${sizes[size]} text-muted-foreground/30`} />
              
              {/* Filled star */}
              <div className="absolute inset-0 overflow-hidden">
                <Star 
                  className={`${sizes[size]} text-yellow-400 fill-yellow-400 transition-all duration-150 ${
                    filled ? 'w-full' : halfFilled ? 'w-1/2' : 'w-0'
                  }`}
                  style={{
                    clipPath: filled ? 'none' : halfFilled ? 'inset(0 50% 0 0)' : 'inset(0 100% 0 0)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Rating display */}
      <span className="ml-2 text-sm text-muted-foreground">
        {displayRating.toFixed(1)}/5.0
      </span>
    </div>
  );
}