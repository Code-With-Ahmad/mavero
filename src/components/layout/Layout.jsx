import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ConfigWarningBanner from "../common/ConfigWarningBanner";
import CookieConsentBanner from "../common/CookieConsentBanner";
import CartDrawer from "../cart/CartDrawer";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ConfigWarningBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsentBanner />
      <CartDrawer />
    </div>
  );
}
