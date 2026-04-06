const clientsByUserId = new Map();

export function addProfileClient(userId, res) {
    if (!clientsByUserId.has(userId)) {
        clientsByUserId.set(userId, new Set());
    }
    clientsByUserId.get(userId).add(res);
}

export function removeProfileClient(userId, res) {
    const clients = clientsByUserId.get(userId);
    if (!clients) return;
    clients.delete(res);
    if (clients.size === 0) {
        clientsByUserId.delete(userId);
    }
}

export function broadcastProfile(userId) {
    const clients = clientsByUserId.get(String(userId));
    if (!clients) return;
    const message = `event: profile-updated\ndata: {}\n\n`;
    for (const res of clients) {
        res.write(message);
    }
}
