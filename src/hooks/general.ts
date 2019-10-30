import { useEffect } from "react";

export const useWindowSize = (handleResize: () => void) => {
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
};
