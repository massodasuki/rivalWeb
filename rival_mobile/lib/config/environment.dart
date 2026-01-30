// Environment configuration
// Mirrors frontend/.env configuration

import 'package:flutter/material.dart';

/// Environment configuration for the app
class Environment {
  // Backend API URL
  // Use localhost for development, replace with your production URL
  static String get apiBaseUrl {
    // Check for environment variable or use default
    // In production, this would be your backend URL
    const backendUrl = String.fromEnvironment('BACKEND_URL', defaultValue: 'http://localhost:3001');
    return backendUrl;
  }

  // WebSocket URL for real-time communication
  static String get wsBaseUrl {
    // Socket.io uses the same base URL as the API
    return apiBaseUrl;
  }

  // Connection timeout in seconds
  static const int connectionTimeout = 10;

  // Receive timeout in seconds
  static const int receiveTimeout = 10;

  // Debug mode - enable for development
  static bool get isDebug {
    return true; // Set to false in production
  }
}

// Environment enum for different build types
enum EnvironmentType {
  development,
  staging,
  production,
}

// Build configuration
class AppConfig {
  final EnvironmentType type;
  final String apiBaseUrl;

  const AppConfig({
    required this.type,
    required this.apiBaseUrl,
  });

  static AppConfig get current {
    // Determine environment based on build mode
    const apiUrl = Environment.apiBaseUrl;
    
    if (apiUrl.contains('localhost') || apiUrl.contains('127.0.0.1')) {
      return const AppConfig(
        type: EnvironmentType.development,
        apiBaseUrl: 'http://localhost:3001',
      );
    }
    
    return const AppConfig(
      type: EnvironmentType.staging,
      apiBaseUrl: apiUrl,
    );
  }
}
