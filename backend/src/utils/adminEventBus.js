const clients = new Set();

export function addAdminClient(res) {
    clients.add(res);
}

export function removeAdminClient(res) {
    clients.delete(res);
}

export function broadcastAdminUsers() {
    const message = `event: users-updated\ndata: {}\n\n`;
    for (const res of clients) {
        res.write(message);
    }
}
