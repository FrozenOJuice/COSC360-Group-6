import { useEffect, useRef } from "react";

/**
 * Opens an SSE connection to the given streamUrl and calls onUpdate()
 * whenever the server broadcasts a profile-updated event.
 */
export function useProfileStream(streamUrl, onUpdate) {
    const callbackRef = useRef(onUpdate);
    callbackRef.current = onUpdate;

    useEffect(() => {
        if (!streamUrl) return;

        const es = new EventSource(streamUrl, {
            withCredentials: true,
        });

        function handleUpdate() {
            callbackRef.current();
        }

        es.addEventListener("profile-updated", handleUpdate);

        return () => {
            es.close();
        };
    }, [streamUrl]);
}
