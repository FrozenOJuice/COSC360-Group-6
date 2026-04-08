import { useEffect, useRef } from "react";

/**
 * Opens an SSE connection to /api/admin/users/stream and calls onUpdate()
 * whenever another admin changes a user's status. The connection is closed
 * on unmount. Requires admin auth (credentials sent via cookie).
 */
export function useAdminUsersStream(onUpdate) {
    const callbackRef = useRef(onUpdate);
    callbackRef.current = onUpdate;

    useEffect(() => {
        const es = new EventSource(`/api/admin/users/stream`, {
            withCredentials: true,
        });

        function handleUpdate() {
            callbackRef.current();
        }

        es.addEventListener("users-updated", handleUpdate);

        return () => {
            es.close();
        };
    }, []);
}
