# Rival Mobile App

A Flutter mobile application that integrates with the Rival NestJS backend, providing sports matchmaking, team management, and community features.

## Features

- 🔐 Secure authentication with JWT tokens
- ⚽ Find and join sports matches
- 👥 Team management
- 💬 Community posts and interactions
- 🔔 Real-time notifications (WebSocket)
- 📱 Responsive Material 3 design

## Project Structure

```
lib/
├── config/           # Environment configuration
├── main.dart         # App entry point
├── models/           # Data models (freezed)
│   ├── auth_models.dart
│   ├── match_models.dart
│   ├── team_models.dart
│   └── community_models.dart
├── screens/          # UI screens
│   ├── login_screen.dart
│   ├── dashboard_screen.dart
│   └── matchmaking_screen.dart
├── services/         # API and business logic
│   ├── api_client.dart
│   ├── auth_service.dart
│   ├── match_service.dart
│   ├── team_service.dart
│   └── socket_service.dart
├── utils/            # Utilities
│   └── token_storage.dart
└── providers/        # Riverpod state management
```

## Getting Started

### Prerequisites

- Flutter 3.0+ SDK
- Dart 3.0+
- An existing NestJS backend running

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd rival_mobile
   ```
3. Install dependencies:
   ```bash
   flutter pub get
   ```
4. Generate model code:
   ```bash
   flutter pub run build_runner build
   ```
5. Update environment configuration:
   - Edit `lib/config/environment.dart` to set your backend URL

### Running the App

```bash
flutter run
```

## Configuration

### Backend URL

Update the `apiBaseUrl` in `lib/config/environment.dart`:

```dart
static String get apiBaseUrl {
  // For local development
  return 'http://localhost:3001';
  
  // For production
  return 'https://api.yourdomain.com';
}
```

### Environment Variables

For production builds, you can set environment variables:

```bash
flutter build apk --dart-define=BACKEND_URL=https://api.yourdomain.com
```

## Backend Integration

This mobile app is designed to work with the Rival NestJS backend. Ensure your backend has:

1. **CORS enabled** for mobile app origins
2. **JWT authentication** configured
3. **Socket.io** for real-time features

Example backend CORS configuration:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'myapp://'],
  credentials: true,
});
```

## Dependencies

- **flutter_riverpod**: State management
- **dio**: HTTP client with interceptors
- **go_router**: Navigation and routing
- **flutter_secure_storage**: Secure token storage
- **socket_io_client**: Real-time communication
- **freezed**: Immutable data classes
- **intl**: Internationalization and date formatting

## API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/register` | POST | User registration |
| `/auth/profile` | GET | Current user profile |
| `/matches` | GET/POST | List/Create matches |
| `/teams` | GET/POST | List/Create teams |
| `/community` | GET | List community posts |

## Development

### Code Generation

After modifying models, generate freezed code:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Testing

```bash
flutter test
```

## Production Build

### Android

```bash
flutter build apk --release
```

### iOS

```bash
flutter build ios --release
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and code generation
5. Submit a pull request

## License

MIT License - see LICENSE file for details
