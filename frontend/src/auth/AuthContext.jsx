import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./authContext";
import { API_BASE_URL, requestJson, requestSessionRefreshJson } from "../lib/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function beginRequest() {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (isMountedRef.current) {
      setLoading(true);
    }

    return requestId;
  }

  function canCommit(requestId) {
    return isMountedRef.current && requestIdRef.current === requestId;
  }

  const syncSession = useCallback(async () => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (isMountedRef.current) {
      setLoading(true);
    }

    const result = await requestJson("/api/auth/me", { method: "GET" }, {
      fallbackMessage: "Could not load the current session.",
    });

    if (isMountedRef.current && requestIdRef.current === requestId) {
      setUser(result.ok ? (result.data.user ?? null) : null);
      setLoading(false);
    }

    return result;
  }, []);

  async function login(credentials) {
    const result = await requestJson("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }, {
      fallbackMessage: "Could not log in.",
    });

    if (result.ok && isMountedRef.current) {
      setUser(result.data.user ?? null);
    }

    return result;
  }

  async function register(credentials) {
    const result = await requestJson("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }, {
      fallbackMessage: "Could not create account.",
    });

    if (result.ok && isMountedRef.current) {
      setUser(result.data.user ?? null);
    }

    return result;
  }

  async function refresh() {
    const requestId = beginRequest();
    const result = await requestSessionRefreshJson({
      fallbackMessage: "Could not refresh session.",
    });

    if (canCommit(requestId)) {
      setUser(result.ok ? (result.data.user ?? null) : null);
      setLoading(false);
    }

    return result;
  }

  async function logout() {
    const requestId = beginRequest();
    const result = await requestJson("/api/auth/logout", {
      method: "POST",
    }, {
      fallbackMessage: "Could not log out.",
    });

    if (result.ok && canCommit(requestId)) {
      setUser(null);
    }

    if (canCommit(requestId)) {
      setLoading(false);
    }

    return result;
  }

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function hydrateInitialSession() {
      const result = await requestJson("/api/auth/me", { method: "GET" }, {
        fallbackMessage: "Could not load the current session.",
      });

      if (isMountedRef.current && requestIdRef.current === requestId) {
        setUser(result.ok ? (result.data.user ?? null) : null);
        setLoading(false);
      }
    }

    void hydrateInitialSession();
  }, []);

  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (!user) return;

    const es = new EventSource(`${API_BASE_URL}/api/auth/stream`, {
      withCredentials: true,
    });

    es.addEventListener("account-status", (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "disabled") {
        logoutRef.current();
      }
    });

    return () => {
      es.close();
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
        register,
        syncSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
