import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

@Injectable()
export class ChatService {

    private readonly clientRooms = new Map<string, Set<string>>();
    private readonly roomClients = new Map<string, Set<string>>();
    readonly MAX_USERS_PER_ROOM = 12;
    readonly MAX_ROOMS_PER_SOCKET = 1;

    isClientInRoom(
        client: Socket,
        roomId: string,
    ): boolean {
        return this.clientRooms.get(client.id)?.has(roomId) ?? false;
    }

    buildSystemMessage(
        roomId: string,
        text: string,
    ) {
        return {
            roomId,
            type: 'system',
            message: text,
            timestamp: Date.now(),
        }
    }

    canJoinUserToRoom(roomId: string, cliendId: string) {
        //Room exist
        if (!this.roomClients.get(roomId)) {
            return {
                flag: false,
                message: "Room does not exist.",
            };
        }

        //Rooms limit
        const clientRoomCount = this.clientRooms.get(cliendId)?.size ?? 0;
        if (clientRoomCount >= this.MAX_ROOMS_PER_SOCKET) {
            return {
                flag:false,
                message: "You have reached the room limit.",
            }    
        }

        //Room full
        const roomSize = this.roomClients.get(roomId)?.size ?? 0
        if (roomSize >= this.MAX_USERS_PER_ROOM) {
            return {
                flag: false,
                message: "Room is full.",
            }
        }
        
        //User is connected
        if (this.clientRooms.get(cliendId)?.has(roomId)) {
            return {
                flag: false,
                message: "User is already connected.",
            };
        }

        return {
            flag:true,
        }
    }


    addClientToRoom(clientId: string, roomId: string) {
        if (!this.roomClients.has(roomId)) {
            this.roomClients.set(roomId, new Set());
        }
        if (!this.clientRooms.has(clientId)) {
            this.clientRooms.set(clientId, new Set());
        }
        this.roomClients.get(roomId)!.add(clientId)
        this.clientRooms.get(clientId)!.add(roomId);
    }

    removeClientToRoom(clientId: string, roomId: string) {
        this.roomClients.get(roomId)?.delete(clientId);
        if (this.roomClients.get(roomId)?.size === 0) {
            this.roomClients.delete(roomId);
        }
        this.clientRooms.get(clientId)?.delete(roomId);
    }

    getClientRooms(clientId: string) {
        return Array.from(this.clientRooms.get(clientId) ?? []);
    }

    removeClient(clientId: string) {
        this.clientRooms.delete(clientId);
    }
}