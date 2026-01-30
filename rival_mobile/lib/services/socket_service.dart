// Socket Service for Real-time Communication
// Mirrors frontend/src/services/socketService.ts functionality

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart';
import 'package:rival_mobile/config/environment.dart';
import 'package:rival_mobile/utils/token_storage.dart';

/// Socket.io service for real-time communication
class SocketService {
  Socket? _socket;
  final TokenStorage _tokenStorage;

  SocketService(this._tokenStorage);

  /// Connect to socket with authentication
  Future<Socket> connect() async {
    final token = await _tokenStorage.getToken();

    if (_socket?.connected == true) {
      return _socket!;
    }

    _socket = io(
      Environment.wsBaseUrl,
      Options(
        auth: {'token': token},
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      ),
    );

    _socket?.on('connect', (_) {
      print('Socket connected: ${_socket?.id}');
    });

    _socket?.on('disconnect', (reason) {
      print('Socket disconnected: $reason');
    });

    _socket?.on('connect_error', (error) {
      print('Socket connection error: $error');
    });

    return _socket!;
  }

  /// Disconnect socket
  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  /// Check if connected
  bool isConnected() {
    return _socket?.connected ?? false;
  }

  /// Emit event
  void emit(String event, [dynamic data]) {
    _socket?.emit(event, data);
  }

  /// Listen to event
  void on(String event, void Function(dynamic) handler) {
    _socket?.on(event, handler);
  }

  /// Remove event listener
  void off(String event, [void Function(dynamic)? handler]) {
    _socket?.off(event, handler);
  }

  /// Join a room
  void joinRoom(String room) {
    emit('join_room', {'room': room});
  }

  /// Leave a room
  void leaveRoom(String room) {
    emit('leave_room', {'room': room});
  }
}

// Provider for SocketService
final socketServiceProvider = Provider<SocketService>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  return SocketService(tokenStorage);
});

// Socket State Notifier
class SocketState {
  final bool connected;
  final String? socketId;

  const SocketState({
    this.connected = false,
    this.socketId,
  });

  const SocketState.initial()
      : connected = false,
        socketId = null;
}

class SocketNotifier extends StateNotifier<SocketState> {
  final SocketService _socketService;

  SocketNotifier(this._socketService) : const SocketState.initial();

  Future<void> connect() async {
    try {
      await _socketService.connect();
      state = const SocketState(connected: true);
    } catch (e) {
      state = const SocketState(connected: false);
    }
  }

  void disconnect() {
    _socketService.disconnect();
    state = const SocketState.initial();
  }
}

// Provider for SocketNotifier
final socketNotifierProvider = StateNotifierProvider<SocketNotifier, SocketState>((ref) {
  final socketService = ref.watch(socketServiceProvider);
  return SocketNotifier(socketService);
});
