import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { EVENTS } from "src/common/constants/events";
import { SendMessageDto } from "src/common/dto/send-message.dto";
import { CreateRoomDto } from "src/common/dto/create-room.dto";
import { generateRoomId } from "src/common/utils/id-generator";
import { JoinRoomDto } from "src/common/dto/join-room.dto";
import { LeaveRoomDto } from "src/common/dto/leave-room.dto";
import { ChatService } from "./services/chat.service";
import { RateLimitEntryService } from "./services/rate-limit-entry.service";


@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayDisconnect {

  constructor(private readonly chatService: ChatService, private readonly rateLimit: RateLimitEntryService) { }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = crypto.randomUUID();
    client.data.userId = userId;
    
    console.log('Client connected:', userId);
  }
  
  
  handleDisconnect(client: Socket) {
    const rooms = this.chatService.getClientRooms(client.id);
    
    rooms.forEach(roomId => {
      this.server.to(roomId).emit(
        EVENTS.MESSAGE, 
        this.chatService.buildSystemMessage(
          roomId, 
          `User ${client.data.alias} disconnected.`,
        )
      );
      
      this.chatService.removeClientToRoom(client.id, roomId)
      client.leave(roomId);
      console.log('Client disconnected:', client.data.userId);
    });

    this.chatService.removeClient(client.id)
  }


  @SubscribeMessage(EVENTS.CREATE_ROOM)
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateRoomDto,
  ) {
    const roomId = generateRoomId();

    client.join(roomId);
    client.data.alias = payload.alias;
    this.chatService.addClientToRoom(client.id, roomId);
    
    console.log('Sala creada por:', client.data.alias);
    
    return {
      event: EVENTS.CREATE_ROOM,
      data: {
        roomId,
        alias: payload.alias,
      },
    };
  }
  
  
  @SubscribeMessage(EVENTS.MESSAGE)
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto
  ) {
    const key = `${client.data.userId}:message`;
    console.log(payload.ciphertext);
    
    if (!this.chatService.isClientInRoom(client, payload.roomId)) {
      return {
        event: EVENTS.MESSAGE,
        data: {
          type: 'system',
          message: 'Unauthorized',
          timestamp: Date.now(),
        }
      }
    }
    
    if (!this.rateLimit.isAllowed(key)) {
      return {
        event: EVENTS.MESSAGE,
        data: {
          type: 'system',
          message: 'Too many messages. Slow down.',
          timestamp: Date.now(),
        }
      }
    }
    
    this.server
    .to(payload.roomId)
    .emit(EVENTS.MESSAGE, {
      roomId: payload.roomId,
      type: 'user',
      ciphertext: payload.ciphertext,
      iv: payload.iv,
      from: client.data.alias,
      timestamp: Date.now()
    });
  }
  
  
  @SubscribeMessage(EVENTS.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomDto,
  ) {
    
    const response = this.chatService.canJoinUserToRoom(
      payload.roomId, 
      client.id
    );    
    
    if (!response.flag) {
      return {
        event: EVENTS.JOIN_ROOM,
        success: false,
        error: response.message,
      };
    }
    
    client.join(payload.roomId);
    client.data.alias = payload.alias;
    
    this.chatService.addClientToRoom(client.id, payload.roomId)
    
    this.server
      .to(payload.roomId)
      .emit(EVENTS.MESSAGE, 
        this.chatService.buildSystemMessage(
          payload.roomId, 
          `User ${payload.alias} join.`,
        )
      );

    return {
      event: EVENTS.JOIN_ROOM,
      data: {
        roomId: payload.roomId,
        alias: payload.alias,
      },
    };
  }


  @SubscribeMessage(EVENTS.LEAVE_ROOM)
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LeaveRoomDto,
  ) {
    client.leave(payload.roomId);
    this.chatService.removeClientToRoom(client.id, payload.roomId)
    
    this.server
      .to(payload.roomId)
      .emit(EVENTS.MESSAGE, 
        this.chatService.buildSystemMessage(
          payload.roomId, 
          `User ${payload.alias} left.`)
      )

    return {
      event: EVENTS.LEAVE_ROOM,
      data: {
        roomId: payload.roomId,
        alias: payload.alias,
      },
    };
  }

}