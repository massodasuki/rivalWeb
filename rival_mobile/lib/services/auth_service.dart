// Authentication Service
// Mirrors frontend/src/services/authService.ts functionality

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rival_mobile/models/auth_models.dart';
import 'package:rival_mobile/services/api_client.dart';
import 'package:rival_mobile/utils/token_storage.dart';

/// AuthService handles all authentication-related API calls
class AuthService {
  final ApiClient _apiClient;

  AuthService(this._apiClient);

  Future<AuthResponse> login(String email, String password) async {
    return await _apiClient.login(
      LoginData(email: email, password: password),
    );
  }

  Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
    int skillLevel = 1,
    List<String> sportPreferences = const [],
  }) async {
    return await _apiClient.register(
      RegisterData(
        name: name,
        email: email,
        password: password,
        skillLevel: skillLevel,
        sportPreferences: sportPreferences,
      ),
    );
  }

  Future<User> getCurrentUser() async {
    return await _apiClient.getProfile();
  }

  Future<void> logout() async {
    await _apiClient.logout();
  }

  bool isAuthenticated() {
    return _apiClient.isAuthenticated();
  }
}

// Provider for AuthService
final authServiceProvider = Provider<AuthService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthService(apiClient);
});

// Auth State Notifier using Riverpod
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  const AuthState.initial()
      : user = null,
        isLoading = false,
        error = null;

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AuthState.initial());

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.login(email, password);
      state = state.copyWith(
        user: response.user,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _authService.register(
        name: name,
        email: email,
        password: password,
      );
      state = state.copyWith(
        user: response.user,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> fetchCurrentUser() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.getCurrentUser();
      state = state.copyWith(
        user: user,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState.initial();
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

// Provider for AuthNotifier
final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});
