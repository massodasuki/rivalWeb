// API Client using Dio with authentication handling
// Mirrors frontend/src/services/api.ts functionality

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:rival_mobile/config/environment.dart';
import 'package:rival_mobile/models/auth_models.dart';
import 'package:rival_mobile/utils/token_storage.dart';

/// Dio client with interceptors for authentication and error handling
class ApiClient {
  late final Dio _dio;
  final TokenStorage _tokenStorage;
  final FlutterSecureStorage _secureStorage;

  // Auth state listeners for handling 401 errors
  final List<VoidCallback> _authStateListeners = [];

  ApiClient({
    TokenStorage? tokenStorage,
    FlutterSecureStorage? secureStorage,
  })  : _tokenStorage = tokenStorage ?? TokenStorage(),
        _secureStorage = secureStorage ?? const FlutterSecureStorage() {
    _initDio();
  }

  void _initDio() {
    _dio = Dio(
      BaseOptions(
        baseUrl: Environment.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add request interceptor for auth token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStorage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Handle unauthorized - clear tokens and notify listeners
            await _tokenStorage.clearToken();
            for (final listener in _authStateListeners) {
              listener();
            }
          }
          return handler.next(error);
        },
      ),
    );

    // Add log interceptor for debugging (remove in production)
    _dio.interceptors.add(LogInterceptor(
      request: true,
      requestBody: true,
      responseBody: true,
      error: true,
    ));
  }

  /// Register auth state listener
  void addAuthStateListener(VoidCallback listener) {
    _authStateListeners.add(listener);
  }

  /// Remove auth state listener
  void removeAuthStateListener(VoidCallback listener) {
    _authStateListeners.remove(listener);
  }

  // Generic HTTP methods
  Future<T> get<T>(String path, {Map<String, dynamic>? queryParams}) async {
    final response = await _dio.get<T>(
      path,
      queryParameters: queryParams,
    );
    return response.data as T;
  }

  Future<T> post<T>(String path, {dynamic data}) async {
    final response = await _dio.post<T>(path, data: data);
    return response.data as T;
  }

  Future<T> patch<T>(String path, {dynamic data}) async {
    final response = await _dio.patch<T>(path, data: data);
    return response.data as T;
  }

  Future<T> delete<T>(String path) async {
    final response = await _dio.delete<T>(path);
    return response.data as T;
  }

  // Auth-specific methods
  Future<AuthResponse> login(LoginData data) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: data.toJson(),
    );
    final authResponse = AuthResponse.fromJson(response.data!);
    await _tokenStorage.saveToken(authResponse.accessToken);
    await _secureStorage.write(key: 'userId', value: authResponse.user.id.toString());
    return authResponse;
  }

  Future<AuthResponse> register(RegisterData data) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/register',
      data: data.toJson(),
    );
    final authResponse = AuthResponse.fromJson(response.data!);
    await _tokenStorage.saveToken(authResponse.accessToken);
    await _secureStorage.write(key: 'userId', value: authResponse.user.id.toString());
    return authResponse;
  }

  Future<User> getProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/auth/profile');
    return User.fromJson(response.data!);
  }

  Future<void> logout() async {
    await _tokenStorage.clearToken();
    await _secureStorage.delete(key: 'userId');
  }

  bool isAuthenticated() {
    return _tokenStorage.hasToken();
  }
}

// Provider for ApiClient
final apiClientProvider = Provider<ApiClient>((ref) {
  final client = ApiClient();
  // Register as disposable
  ref.onDispose(() {
    client.dispose();
  });
  return client;
});

// Extension to add dispose method
extension on ApiClient {
  void dispose() {
    // Cleanup if needed
  }
}
