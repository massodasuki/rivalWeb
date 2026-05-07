// Main App Entry Point with Providers and Routing
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rival_mobile/screens/login_screen.dart';
import 'package:rival_mobile/screens/dashboard_screen.dart';
import 'package:rival_mobile/screens/matchmaking_screen.dart';

void main() {
  runApp(
    const ProviderScope(
      child: RivalApp(),
    ),
  );
}

// Router Configuration
final GoRouter _router = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      name: 'register',
      builder: (context, state) => const RegisterScreenPlaceholder(),
    ),
    GoRoute(
      path: '/dashboard',
      name: 'dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/matchmaking',
      name: 'matchmaking',
      builder: (context, state) => const MatchmakingScreen(),
    ),
    GoRoute(
      path: '/teams',
      name: 'teams',
      builder: (context, state) => const TeamsScreenPlaceholder(),
    ),
    GoRoute(
      path: '/community',
      name: 'community',
      builder: (context, state) => const CommunityScreenPlaceholder(),
    ),
    GoRoute(
      path: '/profile',
      name: 'profile',
      builder: (context, state) => const ProfileScreenPlaceholder(),
    ),
    GoRoute(
      path: '/matches/create',
      name: 'create-match',
      builder: (context, state) => const CreateMatchScreenPlaceholder(),
    ),
    GoRoute(
      path: '/matches/:id',
      name: 'match-details',
      builder: (context, state) => MatchDetailsScreenPlaceholder(
        matchId: int.parse(state.pathParameters['id']!),
      ),
    ),
  ],
  redirect: (context, state) {
    // Add authentication redirect logic here
    final isAuthenticated = false; // Check auth state
    final isLoginRoute = state.uri.path == '/login';

    if (!isAuthenticated && !isLoginRoute) {
      return '/login';
    }
    if (isAuthenticated && isLoginRoute) {
      return '/dashboard';
    }
    return null;
  },
);

class RivalApp extends ConsumerWidget {
  const RivalApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'Rival - Sports Community',
      theme: _buildTheme(),
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }

  ThemeData _buildTheme() {
    final base = ThemeData.light();

    return base.copyWith(
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        primary: Colors.blue.shade700,
        secondary: Colors.orange.shade500,
      ),
      useMaterial3: true,
      cardTheme: CardTheme(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
      buttonTheme: ButtonThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      appBarTheme: AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        surfaceTintColor: Colors.white,
      ),
      navigationBarTheme: NavigationBarThemeData(
        indicatorColor: Colors.blue.shade100,
      ),
    );
  }
}

// Placeholder screens for routes not yet implemented
class RegisterScreenPlaceholder extends StatelessWidget {
  const RegisterScreenPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register')),
      body: const Center(child: Text('Register Screen - To be implemented')),
    );
  }
}

class TeamsScreenPlaceholder extends StatelessWidget {
  const TeamsScreenPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Teams')),
      body: const Center(child: Text('Teams Screen - To be implemented')),
      bottomNavigationBar: _buildBottomNavBar(context),
    );
  }
}

class CommunityScreenPlaceholder extends StatelessWidget {
  const CommunityScreenPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Community')),
      body: const Center(child: Text('Community Screen - To be implemented')),
      bottomNavigationBar: _buildBottomNavBar(context),
    );
  }
}

class ProfileScreenPlaceholder extends StatelessWidget {
  const ProfileScreenPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: const Center(child: Text('Profile Screen - To be implemented')),
      bottomNavigationBar: _buildBottomNavBar(context),
    );
  }
}

class CreateMatchScreenPlaceholder extends StatelessWidget {
  const CreateMatchScreenPlaceholder({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Match')),
      body: const Center(child: Text('Create Match Screen - To be implemented')),
    );
  }
}

class MatchDetailsScreenPlaceholder extends StatelessWidget {
  final int matchId;
  const MatchDetailsScreenPlaceholder({super.key, required this.matchId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Match Details')),
      body: Center(child: Text('Match Details - ID: $matchId')),
    );
  }
}

Widget _buildBottomNavBar(BuildContext context) {
  final currentRoute = GoRouterState.of(context).uri.path;

  return NavigationBar(
    selectedIndex: _getSelectedIndex(currentRoute),
    onDestinationSelected: (index) {
      switch (index) {
        case 0:
          context.go('/dashboard');
          break;
        case 1:
          context.go('/matchmaking');
          break;
        case 2:
          context.go('/teams');
          break;
        case 3:
          context.go('/community');
          break;
        case 4:
          context.go('/profile');
          break;
      }
    },
    destinations: const [
      NavigationDestination(
        icon: Icon(Icons.dashboard_outlined),
        selectedIcon: Icon(Icons.dashboard),
        label: 'Dashboard',
      ),
      NavigationDestination(
        icon: Icon(Icons.sports_soccer_outlined),
        selectedIcon: Icon(Icons.sports_soccer),
        label: 'Matches',
      ),
      NavigationDestination(
        icon: Icon(Icons.group_outlined),
        selectedIcon: Icon(Icons.group),
        label: 'Teams',
      ),
      NavigationDestination(
        icon: Icon(Icons.forum_outlined),
        selectedIcon: Icon(Icons.forum),
        label: 'Community',
      ),
      NavigationDestination(
        icon: Icon(Icons.person_outline),
        selectedIcon: Icon(Icons.person),
        label: 'Profile',
      ),
    ],
  );
}

int _getSelectedIndex(String route) {
  switch (route) {
    case '/dashboard':
      return 0;
    case '/matchmaking':
      return 1;
    case '/teams':
      return 2;
    case '/community':
      return 3;
    case '/profile':
      return 4;
    default:
      return 0;
  }
}
