import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: number) {
    client.join(`room_${roomId}`);
    return { event: 'joinedRoom', data: roomId };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: number) {
    client.leave(`room_${roomId}`);
    return { event: 'leftRoom', data: roomId };
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: { roomId: number; message: any }) {
    this.server.to(`room_${data.roomId}`).emit('newMessage', data.message);
    return { event: 'messageSent' };
  }
}