import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./authContext";
import { apiFetch, apiRequest, requestSessionRefresh } from "../lib/api";

const NETWORK_ERROR = Object.freeze({
  details: [],
  message: "Could not connect to the server.",
});

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function requestJson(requestPromise) {
  const response = await requestPromise;
  const data = await readJson(response);
  return { data, response };
}

function createNetworkErrorResult() {
  return {
    ok: false,
    data: { ...NETWORK_ERROR },
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const syncSessionRef = useRef(null);

  useEffect(() => {
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

  async function syncSession() {
    const requestId = beginRequest();

    try {
      const { data, response } = await requestJson(
        apiFetch("/api/auth/me", { method: "GET" })
      );

      if (canCommit(requestId)) {
        setUser(response.ok ? (data.user ?? null) : null);
      }

      return { ok: response.ok, data };
    } catch {
      if (canCommit(requestId)) {
        setUser(null);
      }

      return createNetworkErrorResult();
    } finally {
      if (canCommit(requestId)) {
        setLoading(false);
      }
    }
  }

  async function login(credentials) {
    const requestId = beginRequest();

    try {
      const { data, response } = await requestJson(
        apiRequest("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        })
      );

      if (response.ok && canCommit(requestId)) {
        setUser(data.user ?? null);
      }

      return { ok: response.ok, data };
    } catch {
      return createNetworkErrorResult();
    } finally {
      if (canCommit(requestId)) {
        setLoading(false);
      }
    }
  }

  async function register(credentials) {
    const requestId = beginRequest();

    try {
      const { data, response } = await requestJson(
        apiRequest("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        })
      );

      if (response.ok && canCommit(requestId)) {
        setUser(data.user ?? null);
      }

      return { ok: response.ok, data };
    } catch {
      return createNetworkErrorResult();
    } finally {
      if (canCommit(requestId)) {
        setLoading(false);
      }
    }
  }

  async function refresh() {
    const requestId = beginRequest();

    try {
      const { data, response } = await requestJson(requestSessionRefresh());

      if (canCommit(requestId)) {
        setUser(response.ok ? (data.user ?? null) : null);
      }

      return { ok: response.ok, data };
    } catch {
      return createNetworkErrorResult();
    } finally {
      if (canCommit(requestId)) {
        setLoading(false);
      }
    }
  }

  async function logout() {
    const requestId = beginRequest();

    try {
      const { data, response } = await requestJson(
        apiRequest("/api/auth/logout", {
          method: "POST",
        })
      );

      if (response.ok && canCommit(requestId)) {
        setUser(null);
      }

      return { ok: response.ok, data };
    } catch {
      return createNetworkErrorResult();
    } finally {
      if (canCommit(requestId)) {
        setLoading(false);
      }
    }
  }

  syncSessionRef.current = syncSession;

  useEffect(() => {
    void syncSessionRef.current?.();
  }, []);

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
