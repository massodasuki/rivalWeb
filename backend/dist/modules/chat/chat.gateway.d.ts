import { Server, Socket } from 'socket.io';
export declare class ChatGateway {
    server: Server;
    handleJoinRoom(client: Socket, roomId: number): {
        event: string;
        data: number;
    };
    handleLeaveRoom(client: Socket, roomId: number): {
        event: string;
        data: number;
    };
    handleMessage(data: {
        roomId: number;
        message: any;
    }): {
        event: string;
    };
}
