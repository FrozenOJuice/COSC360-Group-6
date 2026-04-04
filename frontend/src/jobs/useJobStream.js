import { useEffect, useRef } from "react";
import { API_BASE_URL } from "../lib/api";

const JOB_EVENTS = ["job-created", "job-updated", "job-deleted"];

export function useJobStream(onEvent) {
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

    useEffect(() => {
        const es = new EventSource(`${API_BASE_URL}/api/jobs/stream`, {
            withCredentials: true,
        });

        function handleEvent(event) {
            try {
                const data = JSON.parse(event.data);
                onEventRef.current(event.type, data);
            } catch {
                //
            }
        }

        for (const type of JOB_EVENTS) {
            es.addEventListener(type, handleEvent);
        }

        return () => {
            es.close();
        };
    }, []);
}
