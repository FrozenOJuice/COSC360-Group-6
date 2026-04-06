import { useEffect, useRef } from "react";
import { API_BASE_URL } from "../lib/api";

export function useDiscussionStream(jobId, onDiscussionUpdate) {
    const callbackRef = useRef(onDiscussionUpdate);
    callbackRef.current = onDiscussionUpdate;

    useEffect(() => {
        if (!jobId) return;

        const es = new EventSource(
            `${API_BASE_URL}/api/jobs/${jobId}/discussion/stream`,
            { withCredentials: true }
        );

        function handleUpdate(event) {
            try {
                const data = JSON.parse(event.data);
                callbackRef.current(data);
            } catch {
                // ignore malformed events
            }
        }

        es.addEventListener("discussion-updated", handleUpdate);

        return () => {
            es.close();
        };
    }, [jobId]);
}
