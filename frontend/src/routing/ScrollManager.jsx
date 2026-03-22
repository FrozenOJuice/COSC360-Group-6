import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (location.hash) {
        const element = document.getElementById(location.hash.slice(1));
        if (element) {
          element.scrollIntoView();
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [location.hash, location.pathname]);

  return null;
}

export default ScrollManager;
