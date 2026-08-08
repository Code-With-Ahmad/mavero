import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaGauge,
  FaBoxOpen,
  FaTags,
  FaClipboardList,
  FaUsers,
  FaTicket,
  FaStar,
  FaXmark,
} from "react-icons/fa6";

const LINK_DEFS = [
  { to: "/admin", key: "dashboard", icon: FaGauge, end: true },
  { to: "/admin/products", key: "products", icon: FaBoxOpen },
  { to: "/admin/categories", key: "categories", icon: FaTags },
  { to: "/admin/orders", key: "orders", icon: FaClipboardList },
  { to: "/admin/customers", key: "customers", icon: FaUsers },
  { to: "/admin/coupons", key: "coupons", icon: FaTicket },
  { to: "/admin/reviews", key: "reviews", icon: FaStar },
];

export default function AdminSidebar({ onNavigate, onClose }) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col bg-charcoal-800 text-ivory">
      <div className="flex items-center justify-between px-6 py-6">
        <Link to="/admin" className="font-serif text-xl font-semibold text-ivory">
          {t("common.brand")} <span className="text-gold-400">Admin</span>
        </Link>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t("nav.closeMenu")} className="lg:hidden">
            <FaXmark className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Admin">
        {LINK_DEFS.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-200 ${
                isActive
                  ? "bg-gold-500 text-charcoal-900"
                  : "text-ivory-200 hover:bg-charcoal-600"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {t(`admin.nav.${key}`)}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-6">
        <Link to="/" className="text-xs text-ivory-300 hover:text-gold-400">
          <span className="rtl:hidden">&larr; </span>
          {t("admin.nav.backToStore")}
          <span className="hidden rtl:inline"> &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
