import { Server } from 'socket.io';

let io: Server | null = null;

export const initSocket = (socketIoServer: Server) => {
    io = socketIoServer;
};

export const getSocket = (): Server | null => {
    if (!io) {
        console.warn('[Socket] Attempted to get socket before initialization');
        return null; // Return null instead of throwing to prevent agent crashes during tests
    }
    return io;
};
