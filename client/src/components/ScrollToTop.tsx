import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * with smooth behavior whenever the route changes.
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top with smooth behavior on route change
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  return null; // This component doesn't render anything
}