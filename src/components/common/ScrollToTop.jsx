import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router doesn't reset scroll position on navigation (that's a
// browser-native behavior SPAs have to opt into themselves) — without
// this, clicking a link while scrolled down a long page (a footer link,
// "related products", etc.) lands on the new page still scrolled down,
// which reads as "nothing happened."
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
