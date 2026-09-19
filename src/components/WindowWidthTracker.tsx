import { useState, useEffect } from 'react';

export function WindowWidthTracker() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: removes listener to prevent memory leaks and state updates on unmounted component
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="window-tracker" title="Live window resize effect with cleanup">
      <span className="tracker-dot"></span>
      <span>Window: <strong>{width}px</strong></span>
    </div>
  );
}
