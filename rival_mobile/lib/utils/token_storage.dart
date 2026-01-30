// Token Storage using Flutter Secure Storage
// Securely stores JWT tokens on device

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Utility class for secure token storage
class TokenStorage {
  static const String _tokenKey = 'authToken';
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();

  /// Save token to secure storage
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _tokenKey, value: token);
  }

  /// Retrieve token from secure storage
  Future<String?> getToken() async {
    return await _secureStorage.read(key: _tokenKey);
  }

  /// Check if token exists
  Future<bool> hasToken() async {
    final token = await _secureStorage.read(key: _tokenKey);
    return token != null && token.isNotEmpty;
  }

  /// Clear token from secure storage
  Future<void> clearToken() async {
    await _secureStorage.delete(key: _tokenKey);
  }

  /// Get user ID from secure storage
  Future<int?> getUserId() async {
    final userIdStr = await _secureStorage.read(key: 'userId');
    if (userIdStr != null) {
      return int.tryParse(userIdStr);
    }
    return null;
  }

  /// Save user ID to secure storage
  Future<void> saveUserId(int userId) async {
    await _secureStorage.write(key: 'userId', value: userId.toString());
  }
}

// Provider for TokenStorage
final tokenStorageProvider = TokenStorage();
