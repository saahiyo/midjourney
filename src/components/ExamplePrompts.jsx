import React, { memo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { examples } from '../constants/examplePrompts';

const ExamplePrompts = memo(({ onTryExample }) => {
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);

  useEffect(() => {
    if (containerRef.current && buttonRefs.current.length > 0) {
      gsap.fromTo(buttonRefs.current,
        { opacity: 0, y: 20, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.1,
          ease: "back.out(1.7)" 
        }
      );
    }
  }, []);

  const handleButtonClick = (example, index) => {
    if (buttonRefs.current[index]) {
      gsap.to(buttonRefs.current[index], {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    onTryExample(example);
  };

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2 justify-center mt-8">
      {examples.map((example, i) => (
        <button
          key={i}
          ref={el => buttonRefs.current[i] = el}
          onClick={() => handleButtonClick(example, i)}
          title={example}
          className="text-xs truncate max-w-xs px-2 py-1 rounded-full bg-gray-800 text-gray-200 hover:bg-gray-700"
          aria-label={`Try example prompt: ${example}`}
        >
          <i className="ri-arrow-right-up-long-line mr-2" aria-hidden="true"></i>
          {example}
        </button>
      ))}
    </div>
  );
});

ExamplePrompts.displayName = 'ExamplePrompts';

export default ExamplePrompts;
