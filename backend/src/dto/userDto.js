export function toUserDto(user) {
    return {
        id: user.id ?? String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
    };
}
