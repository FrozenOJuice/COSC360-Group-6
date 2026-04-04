const clientsByJobId = new Map();

export function addDiscussionClient(jobId, res) {
    if (!clientsByJobId.has(jobId)) {
        clientsByJobId.set(jobId, new Set());
    }
    clientsByJobId.get(jobId).add(res);
}

export function removeDiscussionClient(jobId, res) {
    const clients = clientsByJobId.get(jobId);
    if (!clients) return;
    clients.delete(res);
    if (clients.size === 0) {
        clientsByJobId.delete(jobId);
    }
}

export function broadcastDiscussion(jobId, data) {
    const clients = clientsByJobId.get(String(jobId));
    if (!clients) return;
    const message = `event: discussion-updated\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
        res.write(message);
    }
}
