import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  FaBars,
  FaXmark,
  FaMagnifyingGlass,
  FaHeart,
  FaBagShopping,
  FaUser,
  FaSun,
  FaMoon,
  FaChevronDown,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import LanguageSwitcher from "../common/LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();
  const { user, profile, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { itemCount, openDrawer } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const NAV_LINKS = [
    { to: "/", label: t("nav.home") },
    { to: "/shop", label: t("nav.shop") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const accountRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchValue.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    navigate("/");
    toast.success(t("toast.loggedOut"));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-100 bg-ivory/95 backdrop-blur dark:border-charcoal-500 dark:bg-charcoal-800/95">
      <div className="container-boutique flex h-20 items-center justify-between gap-4">
        <button
          type="button"
          className="text-charcoal-700 dark:text-ivory-100 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label={t("nav.openMenu")}
        >
          <FaBars className="h-5 w-5" />
        </button>

        <Link to="/" className="shrink-0 font-serif text-2xl font-semibold tracking-wide">
          {t("common.brand")}
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `label-uppercase transition-colors duration-200 ease-refined hover:text-gold-600 dark:hover:text-gold-400 ${
                  isActive ? "text-gold-600 dark:text-gold-400" : ""
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `label-uppercase transition-colors duration-200 ease-refined hover:text-gold-600 dark:hover:text-gold-400 ${
                  isActive ? "text-gold-600 dark:text-gold-400" : ""
                }`
              }
            >
              {t("nav.adminPanel")}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            className="text-charcoal-600 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
            aria-label={t("nav.search")}
            aria-expanded={searchOpen}
          >
            <FaMagnifyingGlass className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="text-charcoal-600 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
            aria-label={theme === "dark" ? t("nav.switchToLight") : t("nav.switchToDark")}
          >
            {theme === "dark" ? (
              <FaSun className="h-[18px] w-[18px]" />
            ) : (
              <FaMoon className="h-[18px] w-[18px]" />
            )}
          </button>

          <LanguageSwitcher />

          <Link
            to="/wishlist"
            className="relative hidden text-charcoal-600 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400 sm:block"
            aria-label={`${t("nav.wishlist")}${wishlistItems.length ? ` (${wishlistItems.length})` : ""}`}
          >
            <FaHeart className="h-[18px] w-[18px]" />
            {wishlistItems.length > 0 && (
              <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-medium text-charcoal-900">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openDrawer}
            className="relative text-charcoal-600 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
            aria-label={`${t("nav.cart")}${itemCount ? ` (${itemCount})` : ""}`}
          >
            <FaBagShopping className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -end-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-medium text-charcoal-900">
                {itemCount}
              </span>
            )}
          </button>

          <div className="relative" ref={accountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((s) => !s)}
              className="flex items-center gap-1.5 text-charcoal-600 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
              aria-label={t("nav.account")}
              aria-expanded={accountOpen}
            >
              <FaUser className="h-[18px] w-[18px]" />
              <FaChevronDown className="hidden h-3 w-3 sm:block" />
            </button>

            {accountOpen && (
              <div className="absolute end-0 mt-3 w-56 border border-charcoal-100 bg-ivory py-2 shadow-lift dark:border-charcoal-500 dark:bg-charcoal-700">
                {user ? (
                  <>
                    <div className="border-b border-charcoal-100 px-4 py-2 dark:border-charcoal-500">
                      <p className="truncate text-sm font-medium text-charcoal-800 dark:text-ivory-100">
                        {profile?.name || user.email}
                      </p>
                      <p className="truncate text-xs text-charcoal-400 dark:text-ivory-300">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-ivory-200 dark:text-ivory-100 dark:hover:bg-charcoal-600"
                    >
                      {t("nav.myAccount")}
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-ivory-200 dark:text-ivory-100 dark:hover:bg-charcoal-600"
                    >
                      {t("nav.myOrders")}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-ivory-200 dark:text-ivory-100 dark:hover:bg-charcoal-600"
                      >
                        {t("nav.adminPanel")}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-start text-sm text-burgundy-500 hover:bg-ivory-200 dark:text-burgundy-300 dark:hover:bg-charcoal-600"
                    >
                      {t("nav.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-ivory-200 dark:text-ivory-100 dark:hover:bg-charcoal-600"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-ivory-200 dark:text-ivory-100 dark:hover:bg-charcoal-600"
                    >
                      {t("nav.signup")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-charcoal-100 bg-ivory px-4 py-4 dark:border-charcoal-500 dark:bg-charcoal-800">
          <form onSubmit={handleSearchSubmit} className="container-boutique flex gap-2">
            <input
              type="search"
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="input-field flex-1"
              aria-label={t("product.searchPlaceholder")}
            />
            <button type="submit" className="btn-primary">
              {t("common.search")}
            </button>
          </form>
        </div>
      )}

      {mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-charcoal-900/60"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 start-0 flex w-full max-w-xs flex-col bg-ivory p-6 dark:bg-charcoal-800">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-serif text-xl font-semibold">{t("common.brand")}</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label={t("nav.closeMenu")}
                  className="text-charcoal-600 dark:text-ivory-200"
                >
                  <FaXmark className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-6" aria-label="Mobile primary">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `label-uppercase text-base transition-colors duration-200 ease-refined ${
                        isActive ? "text-gold-600 dark:text-gold-400" : ""
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `label-uppercase text-base transition-colors duration-200 ease-refined ${
                      isActive ? "text-gold-600 dark:text-gold-400" : ""
                    }`
                  }
                >
                  {t("nav.wishlist")}
                </NavLink>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `label-uppercase text-base transition-colors duration-200 ease-refined ${
                        isActive ? "text-gold-600 dark:text-gold-400" : ""
                      }`
                    }
                  >
                    {t("nav.adminPanel")}
                  </NavLink>
                )}
              </nav>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
