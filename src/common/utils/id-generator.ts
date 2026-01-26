export function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}
export function generateSessionId(): string {
    return Math.random().toString(36).substring(2)
}