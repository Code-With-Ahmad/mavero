import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPen } from "react-icons/fa6";
import toast from "react-hot-toast";
import useAdminUsers from "../../hooks/useAdminUsers";
import usePagination from "../../hooks/usePagination";
import useSortableData from "../../hooks/useSortableData";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../utils/formatCurrency";
import Skeleton from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";
import Pagination from "../../components/admin/Pagination";
import SortableTh from "../../components/admin/SortableTh";
import Checkbox from "../../components/common/Checkbox";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";

const SORT_COLUMNS = {
  name: (u) => (u.name || u.email)?.toLowerCase(),
  role: (u) => u.role,
  orders: (u) => u.orderCount,
  totalSpent: (u) => u.totalSpent,
  status: (u) => (u.disabled ? 1 : 0),
};

function EditUserModal({ user, onClose, onSave }) {
  const { t } = useTranslation();
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [isAdmin, setIsAdmin] = useState(user.role === "admin");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSave({ name: name.trim(), phone: phone.trim(), role: isAdmin ? "admin" : "customer" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t("admin.customers.editUserTitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="editUserName" className="label-uppercase mb-2 block">
            {t("admin.customers.name")}
          </label>
          <input
            id="editUserName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="editUserPhone" className="label-uppercase mb-2 block">
            {t("admin.customers.phone")}
          </label>
          <input
            id="editUserPhone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
          />
        </div>
        <Checkbox
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
          label={t("admin.customers.adminAccess")}
        />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminCustomers() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { users, loading, error, refetch, setDisabled, bulkSetDisabled, updateFields } = useAdminUsers();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [toggleTarget, setToggleTarget] = useState(null);
  const [bulkAction, setBulkAction] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const { sorted, sortKey, direction, toggleSort } = useSortableData(filtered, SORT_COLUMNS);
  const { page, setPage, totalPages, pageItems } = usePagination(sorted, 10);

  const toggleSelected = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleSaveEdit = async (fields) => {
    try {
      await updateFields(editingUser.id, fields);
      toast.success(t("admin.customers.updated", { email: editingUser.email }));
      setEditingUser(null);
    } catch {
      toast.error(t("admin.customers.couldNotUpdate"));
    }
  };

  const confirmToggle = async () => {
    const { user, nextDisabled } = toggleTarget;
    setConfirming(true);
    try {
      await setDisabled(user.id, nextDisabled);
      toast.success(
        t("admin.customers.statusUpdated", {
          email: user.email,
          status: nextDisabled ? t("admin.customers.disabled") : t("admin.customers.enable"),
        })
      );
      setToggleTarget(null);
    } catch {
      toast.error(t("admin.customers.couldNotUpdateStatus"));
    } finally {
      setConfirming(false);
    }
  };

  const confirmBulk = async () => {
    const { ids, disabled } = bulkAction;
    setConfirming(true);
    try {
      await bulkSetDisabled(ids, disabled);
      setSelected(new Set());
      toast.success(t("admin.customers.bulkUpdated", { count: ids.length }));
      setBulkAction(null);
    } catch {
      toast.error(t("admin.customers.couldNotUpdateStatus"));
    } finally {
      setConfirming(false);
    }
  };

  const startBulk = (disabled) => {
    const ids = Array.from(selected).filter((id) => id !== currentUser?.uid);
    if (ids.length === 0) return;
    setBulkAction({ ids, disabled });
  };

  return (
    <div>
      <div className="mb-6">
        <p className="label-uppercase">{t("common.brand")} Admin</p>
        <h1 className="mt-1 text-3xl font-semibold">{t("admin.customers.title")}</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder={t("admin.customers.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        {selected.size > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-charcoal-400 dark:text-ivory-300">
              {t("admin.customers.selected", { count: selected.size })}
            </span>
            <button type="button" onClick={() => startBulk(true)} className="btn-secondary py-1.5 text-xs">
              {t("admin.customers.bulkDisable")}
            </button>
            <button type="button" onClick={() => startBulk(false)} className="btn-secondary py-1.5 text-xs">
              {t("admin.customers.bulkEnable")}
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!loading && error && <ErrorState onRetry={refetch} />}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-charcoal-100 text-xs uppercase tracking-wider text-charcoal-400 dark:border-charcoal-500 dark:text-ivory-300">
                <th className="py-2 pe-4"></th>
                <SortableTh label={t("admin.customers.customer")} sortKey="name" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.customers.role")} sortKey="role" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.customers.orders")} sortKey="orders" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.customers.totalSpent")} sortKey="totalSpent" currentKey={sortKey} direction={direction} onSort={toggleSort} />
                <SortableTh label={t("admin.customers.status")} sortKey="status" currentKey={sortKey} direction={direction} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((u) => (
                <tr key={u.id} className="border-b border-charcoal-100 dark:border-charcoal-600">
                  <td className="py-3 pe-4">
                    {u.id !== currentUser?.uid && (
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selected.has(u.id)}
                          onChange={() => toggleSelected(u.id)}
                          aria-label={u.email}
                        />
                        <button
                          type="button"
                          onClick={() => setEditingUser(u)}
                          aria-label={t("common.edit")}
                          className="text-charcoal-400 hover:text-gold-600 dark:text-ivory-300"
                        >
                          <FaPen className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 pe-4">
                    <p className="font-medium text-charcoal-800 dark:text-ivory-100">{u.name || "—"}</p>
                    <p className="text-xs text-charcoal-400 dark:text-ivory-300">{u.email}</p>
                  </td>
                  <td className="py-3 pe-4 capitalize text-charcoal-500 dark:text-ivory-200">{u.role}</td>
                  <td className="py-3 pe-4">{u.orderCount}</td>
                  <td className="py-3 pe-4">{formatCurrency(u.totalSpent)}</td>
                  <td className="py-3 pe-4">
                    <ToggleSwitch
                      checked={!u.disabled}
                      disabled={u.id === currentUser?.uid}
                      label={u.disabled ? t("admin.customers.disabled") : t("admin.customers.active")}
                      onChange={(next) => setToggleTarget({ user: u, nextDisabled: !next })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveEdit} />
      )}

      {toggleTarget && (
        <ConfirmModal
          open
          onClose={() => setToggleTarget(null)}
          onConfirm={confirmToggle}
          submitting={confirming}
          danger={toggleTarget.nextDisabled}
          title={
            toggleTarget.nextDisabled
              ? t("admin.customers.confirmDisableTitle")
              : t("admin.customers.confirmEnableTitle")
          }
          message={
            toggleTarget.nextDisabled
              ? t("admin.customers.confirmDisable", { email: toggleTarget.user.email })
              : t("admin.customers.confirmEnable", { email: toggleTarget.user.email })
          }
          confirmLabel={toggleTarget.nextDisabled ? t("admin.customers.disable") : t("admin.customers.enable")}
        />
      )}

      {bulkAction && (
        <ConfirmModal
          open
          onClose={() => setBulkAction(null)}
          onConfirm={confirmBulk}
          submitting={confirming}
          danger={bulkAction.disabled}
          title={
            bulkAction.disabled
              ? t("admin.customers.confirmBulkDisableTitle")
              : t("admin.customers.confirmBulkEnableTitle")
          }
          message={
            bulkAction.disabled
              ? t("admin.customers.confirmBulkDisable", { count: bulkAction.ids.length })
              : t("admin.customers.confirmBulkEnable", { count: bulkAction.ids.length })
          }
          confirmLabel={bulkAction.disabled ? t("admin.customers.bulkDisable") : t("admin.customers.bulkEnable")}
        />
      )}
    </div>
  );
}
