import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FaBars, FaSun, FaMoon } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success(t("toast.loggedOut"));
  };

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-charcoal-900">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="fixed h-screen w-64">
            <AdminSidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-charcoal-100 bg-ivory px-4 py-4 dark:border-charcoal-500 dark:bg-charcoal-800 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("nav.openMenu")}
              className="text-charcoal-600 dark:text-ivory-200 lg:hidden"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <span className="hidden text-sm text-charcoal-400 dark:text-ivory-300 lg:block">
              {t("admin.signedInAs")}{" "}
              <span className="text-charcoal-700 dark:text-ivory-100">{profile?.name || profile?.email}</span>
            </span>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? t("nav.switchToLight") : t("nav.switchToDark")}
                className="text-charcoal-600 hover:text-gold-600 dark:text-ivory-200 dark:hover:text-gold-400"
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium uppercase tracking-wider text-charcoal-500 hover:text-burgundy-500 dark:text-ivory-200 dark:hover:text-burgundy-300"
              >
                {t("nav.logout")}
              </button>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-charcoal-900/60"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 start-0 w-64">
              <AdminSidebar onNavigate={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
