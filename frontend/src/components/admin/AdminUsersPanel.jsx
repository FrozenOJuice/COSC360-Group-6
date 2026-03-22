import { useEffect, useRef, useState } from "react";
import { fetchAdminUsers, updateAdminUserStatus } from "../../lib/adminApi";
import "../../styles/AdminUsersPanel.css";

const INITIAL_QUERY = Object.freeze({
  search: "",
  role: "",
  status: "",
  sortBy: "name",
  sortOrder: "asc",
  page: 1,
  limit: 10,
});

const EMPTY_RESULT = Object.freeze({
  users: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  sort: {
    by: "name",
    order: "asc",
  },
  filters: {
    search: "",
    role: "",
    status: "",
  },
});

function AdminUsersPanel() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [searchInput, setSearchInput] = useState("");
  const [result, setResult] = useState(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [pendingUserIds, setPendingUserIds] = useState({});
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchInput.trim();

      setQuery((current) => {
        if (current.search === nextSearch) {
          return current;
        }

        return {
          ...current,
          search: nextSearch,
          page: 1,
        };
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    let isActive = true;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);

    async function loadUsers() {
      try {
        const response = await fetchAdminUsers(query);

        if (!isActive || requestIdRef.current !== requestId) {
          return;
        }

        if (!response.ok) {
          setError(response.data.message || "Could not load users.");
          setLoading(false);
          return;
        }

        const nextUsers = Array.isArray(response.data.users) ? response.data.users : [];
        const nextPagination = response.data.pagination ?? EMPTY_RESULT.pagination;

        if (nextPagination.totalPages > 0 && query.page > nextPagination.totalPages) {
          setQuery((current) => (
            current.page === query.page
              ? { ...current, page: nextPagination.totalPages }
              : current
          ));
          return;
        }

        setResult({
          users: nextUsers,
          pagination: nextPagination,
          sort: response.data.sort ?? EMPTY_RESULT.sort,
          filters: response.data.filters ?? EMPTY_RESULT.filters,
        });
        setError("");
        setLoading(false);
      } catch {
        if (!isActive || requestIdRef.current !== requestId) {
          return;
        }

        setError("Could not connect to the server.");
        setLoading(false);
      }
    }

    void loadUsers();

    return () => {
      isActive = false;
    };
  }, [query, refreshTick]);

  function updateQuery(patch) {
    setQuery((current) => ({
      ...current,
      ...patch,
    }));
  }

  async function handleStatusChange(user, nextStatus) {
    setPendingUserIds((current) => ({
      ...current,
      [user.id]: true,
    }));
    setNotice("");

    try {
      const response = await updateAdminUserStatus(user.id, nextStatus);

      if (!response.ok) {
        setError(response.data.message || "Could not update user status.");
        return;
      }

      setError("");
      setNotice(
        `${response.data.user?.name || user.name} is now ${response.data.user?.status || nextStatus}.`
      );
      setRefreshTick((current) => current + 1);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setPendingUserIds((current) => {
        const nextState = { ...current };
        delete nextState[user.id];
        return nextState;
      });
    }
  }

  const totalPages = result.pagination.totalPages || 0;
  const canGoPrevious = query.page > 1;
  const canGoNext = totalPages > 0 && query.page < totalPages;

  return (
    <section className="admin-users-section" id="admin-users">
      <div className="section-heading admin-users-heading">
        <div>
          <p className="section-label">User Management</p>
          <h2>Search, review, and manage account access</h2>
        </div>
        <p className="admin-users-summary">
          {result.pagination.total} total users across the current search scope.
        </p>
      </div>

      <div className="admin-users-toolbar">
        <label className="admin-filter-field admin-filter-search">
          <span>Search</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or email"
          />
        </label>

        <label className="admin-filter-field">
          <span>Role</span>
          <select
            value={query.role}
            onChange={(event) => updateQuery({ role: event.target.value, page: 1 })}
          >
            <option value="">All roles</option>
            <option value="seeker">Job seeker</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label className="admin-filter-field">
          <span>Status</span>
          <select
            value={query.status}
            onChange={(event) => updateQuery({ status: event.target.value, page: 1 })}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>

        <label className="admin-filter-field">
          <span>Sort by</span>
          <select
            value={query.sortBy}
            onChange={(event) => updateQuery({ sortBy: event.target.value, page: 1 })}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="status">Status</option>
          </select>
        </label>

        <label className="admin-filter-field">
          <span>Order</span>
          <select
            value={query.sortOrder}
            onChange={(event) => updateQuery({ sortOrder: event.target.value, page: 1 })}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <label className="admin-filter-field">
          <span>Per page</span>
          <select
            value={query.limit}
            onChange={(event) => updateQuery({ limit: Number(event.target.value), page: 1 })}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      {error ? <div className="admin-panel-status admin-panel-status-error">{error}</div> : null}
      {notice ? <div className="admin-panel-status admin-panel-status-success">{notice}</div> : null}

      <div className="admin-users-table-shell">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Access</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="admin-users-empty">
                  Loading users...
                </td>
              </tr>
            ) : result.users.length === 0 ? (
              <tr>
                <td colSpan="6" className="admin-users-empty">
                  No users matched the current filters.
                </td>
              </tr>
            ) : (
              result.users.map((user) => {
                const isPending = !!pendingUserIds[user.id];
                const isAdmin = user.role === "admin";
                const nextStatus = user.status === "active" ? "disabled" : "active";
                const profileHref = user.role === "seeker"
                  ? `#admin/profiles/seeker/${user.id}`
                  : user.role === "employer"
                    ? `#admin/profiles/employer/${user.id}`
                    : "";

                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`admin-role-badge admin-role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge admin-status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      {isAdmin ? (
                        <span className="admin-action-protected">Protected</span>
                      ) : (
                        <button
                          type="button"
                          className="admin-status-action"
                          disabled={isPending}
                          onClick={() => handleStatusChange(user, nextStatus)}
                        >
                          {isPending
                            ? "Saving..."
                            : user.status === "active"
                              ? "Disable"
                              : "Enable"}
                        </button>
                      )}
                    </td>
                    <td>
                      {profileHref ? (
                        <a href={profileHref} className="admin-profile-link">
                          View Profile
                        </a>
                      ) : (
                        <span className="admin-action-protected">No Profile</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-users-pagination">
        <p>
          Page {result.pagination.page} of {Math.max(totalPages, 1)}
        </p>
        <div className="admin-users-pagination-actions">
          <button
            type="button"
            onClick={() => updateQuery({ page: query.page - 1 })}
            disabled={!canGoPrevious || loading}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => updateQuery({ page: query.page + 1 })}
            disabled={!canGoNext || loading}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdminUsersPanel;
