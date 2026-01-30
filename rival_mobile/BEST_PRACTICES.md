# Flutter Mobile App Best Practices

This document outlines best practices for building and maintaining the Rival Flutter mobile app that integrates with the NestJS backend.

## 1. Project Structure

```
lib/
├── config/           # Environment configuration
├── models/           # Data models (freezed for immutability)
├── screens/          # UI screens (organized by feature)
├── services/         # API clients and business logic
├── providers/        # Riverpod providers and state management
├── utils/            # Utility classes and helpers
├── widgets/          # Reusable UI components
├── main.dart         # App entry point
└── routing.dart      # GoRouter configuration
```

## 2. State Management with Riverpod

### Provider Organization
- Use `Provider` for simple dependencies (API clients, services)
- Use `StateNotifierProvider` for complex state with business logic
- Use `FutureProvider` for async data (API responses)
- Use `StreamProvider` for real-time data (WebSocket)

### Example Pattern
```dart
// State class (immutable)
class MatchState {
  final List<Match> matches;
  final bool isLoading;
  final String? error;

  const MatchState({
    this.matches = const [],
    this.isLoading = false,
    this.error,
  });
}

// StateNotifier for business logic
class MatchNotifier extends StateNotifier<MatchState> {
  final MatchService _matchService;

  MatchNotifier(this._matchService) : super(const MatchState());

  Future<void> fetchMatches() async {
    state = state.copyWith(isLoading: true);
    try {
      final matches = await _matchService.getMatches();
      state = state.copyWith(matches: matches, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}

// Provider
final matchNotifierProvider = StateNotifierProvider<MatchNotifier, MatchState>((ref) {
  final matchService = ref.watch(matchServiceProvider);
  return MatchNotifier(matchService);
});
```

## 3. API Integration with Dio

### Request Interceptor (Authentication)
```dart
_dio.interceptors.add(
  InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await _tokenStorage.getToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
  ),
);
```

### Error Handling
```dart
_dio.interceptors.add(
  InterceptorsWrapper(
    onError: (error, handler) async {
      if (error.response?.statusCode == 401) {
        // Handle unauthorized - clear tokens, redirect to login
        await _tokenStorage.clearToken();
        // Emit auth state change
      }
      return handler.next(error);
    },
  ),
);
```

### Best Practices
1. **Always use interceptors** for auth tokens
2. **Set proper timeouts** (10 seconds for connect/receive)
3. **Handle 401 errors globally** with auth state change
4. **Use generic response types** for type safety
5. **Log requests in development** only

## 4. Authentication Best Practices

### Token Storage
- Use `flutter_secure_storage` for JWT tokens
- Never store tokens in plain text
- Clear tokens on 401 responses and logout

### Login Flow
1. Call `/auth/login` with credentials
2. Store JWT token securely
3. Update auth state
4. Redirect to dashboard
5. Fetch user profile

### Logout Flow
1. Call API logout endpoint (optional)
2. Clear stored tokens
3. Reset all providers
4. Redirect to login screen

## 5. Error Handling

### Network Errors
```dart
try {
  final response = await _apiClient.getMatches();
  return response;
} on DioException catch (e) {
  if (e.type == DioExceptionType.connectionTimeout) {
    throw NetworkException('Connection timeout');
  }
  throw handleApiError(e);
}
```

### User-Friendly Error Messages
- Map technical errors to user-friendly messages
- Show snackbars for transient errors
- Provide retry actions
- Log errors for debugging

## 6. UI Best Practices

### Responsive Design
- Use `MediaQuery` for screen dimensions
- Support different orientations
- Test on multiple screen sizes

### Loading States
- Show loading indicators during API calls
- Use skeleton loaders for content
- Disable buttons during submission

### Pull-to-Refresh
```dart
RefreshIndicator(
  onRefresh: () async {
    ref.read(matchNotifierProvider.notifier).fetchMatches();
  },
  child: ListView(...),
)
```

## 7. Performance Optimization

### List Optimization
- Use `ListView.builder` for long lists
- Implement pagination for large datasets
- Cache network images

### Image Caching
```dart
CachedNetworkImage(
  imageUrl: user.avatarUrl,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```

### Provider Optimization
- Use `select` for granular rebuilds
- Avoid rebuilding entire widgets when only specific data changes
- Use `ref.listen` for side effects

## 8. Security

### API Security
- Always use HTTPS in production
- Validate tokens on every request
- Implement rate limiting
- Sanitize user inputs

### Local Storage
- Encrypt sensitive data
- Use biometric authentication for critical actions
- Clear sensitive data on app background

## 9. Testing

### Unit Tests
```dart
void main() {
  test('login with valid credentials', () async {
    final authService = MockAuthService();
    final result = await authService.login('test@example.com', 'password');
    expect(result.user.email, 'test@example.com');
  });
}
```

### Widget Tests
```dart
testWidgets('login screen shows error on invalid input', (tester) async {
  await tester.pumpWidget(const LoginScreen());
  await tester.tap(find.text('Login'));
  expect(find.text('Please enter your email'), findsOneWidget);
});
```

## 10. Backend Endpoints Reference

| Feature | Endpoint | Method | Auth Required |
|---------|----------|--------|---------------|
| Login | `/auth/login` | POST | No |
| Register | `/auth/register` | POST | No |
| Get Profile | `/auth/profile` | GET | Yes |
| Get Users | `/users` | GET | Yes |
| Get User by ID | `/users/:id` | GET | Yes |
| Get Matches | `/matches` | GET | Yes |
| Create Match | `/matches` | POST | Yes |
| Get Teams | `/teams` | GET | Yes |
| Create Team | `/teams` | POST | Yes |
| Get Posts | `/community` | GET | Yes |

## 11. Environment Configuration

Development:
- Backend URL: `http://localhost:3001`
- Enable debug logging
- Use development API keys

Production:
- Backend URL: `https://api.yourdomain.com`
- Disable debug logging
- Use production API keys

## 12. Common Issues & Solutions

### CORS Errors
- Ensure backend CORS configuration includes mobile app origin
- For development, use appropriate ports

### Token Expiration
- Handle 401 errors gracefully
- Implement automatic logout
- Show session expired message

### Slow API Calls
- Implement pagination
- Add loading states
- Cache responses where appropriate

## 13. Resources

- [Riverpod Documentation](https://riverpod.dev)
- [Dio Package](https://pub.dev/packages/dio)
- [Go Router](https://pub.dev/packages/go_router)
- [Flutter Secure Storage](https://pub.dev/packages/flutter_secure_storage)
