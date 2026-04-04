const clients = new Map();

export function addUserClient(userId, res) {
    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }
    clients.get(userId).add(res);
}

export function removeUserClient(userId, res) {
    const userClients = clients.get(userId);
    if (!userClients) return;
    userClients.delete(res);
    if (userClients.size === 0) {
        clients.delete(userId);
    }
}

export function broadcastUserStatus(userId, status) {
    const userClients = clients.get(userId);
    if (!userClients) return;
    const message = `event: account-status\ndata: ${JSON.stringify({ status })}\n\n`;
    for (const res of userClients) {
        res.write(message);
    }
}
