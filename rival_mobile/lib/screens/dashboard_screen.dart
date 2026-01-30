// Dashboard Screen
// Mirrors frontend/src/pages/Dashboard.tsx functionality

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rival_mobile/models/match_models.dart';
import 'package:rival_mobile/models/team_models.dart';
import 'package:rival_mobile/models/community_models.dart';
import 'package:rival_mobile/services/match_service.dart';
import 'package:rival_mobile/services/team_service.dart';
import 'package:rival_mobile/services/auth_service.dart';
import 'package:intl/intl.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);
    final matchState = ref.watch(matchNotifierProvider);
    final teamState = ref.watch(teamNotifierProvider);

    // Fetch data on first load
    ref.listen(matchNotifierProvider, (_, next) {
      if (next.isLoading == false && next.error == null) {
        // Data loaded successfully
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.go('/notifications'),
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.go('/settings'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.read(matchNotifierProvider.notifier).fetchMatches();
          ref.read(teamNotifierProvider.notifier).fetchTeams();
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Section
              _buildWelcomeSection(context, authState.user),
              const SizedBox(height: 16),
              // Quick Actions
              _buildQuickActions(context),
              const SizedBox(height: 24),
              // Stats Cards
              _buildStatsSection(),
              const SizedBox(height: 24),
              // Matches Section
              _buildMatchesSection(matchState),
              const SizedBox(height: 24),
              // Teams Section
              _buildTeamsSection(teamState),
              const SizedBox(height: 24),
              // Community Section
              _buildCommunitySection(),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNavBar(context),
    );
  }

  Widget _buildWelcomeSection(BuildContext context, user) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue.shade400, Colors.blue.shade700],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.white,
            child: Text(
              (user?.name ?? 'U').substring(0, 2).toUpperCase(),
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome back, ${user?.name ?? 'User'}!',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                user?.primarySport != null
                    ? 'Ready for some ${user.primarySport}?'
                    : 'Ready to play?',
                style: const TextStyle(color: Colors.white70),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: _buildQuickActionButton(
            context,
            icon: Icons.add_circle_outline,
            label: 'Create Match',
            color: Colors.blue,
            onTap: () => context.go('/matches/create'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildQuickActionButton(
            context,
            icon: Icons.search,
            label: 'Find Match',
            color: Colors.green,
            onTap: () => context.go('/matchmaking'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildQuickActionButton(
            context,
            icon: Icons.group_add,
            label: 'Join Team',
            color: Colors.orange,
            onTap: () => context.go('/teams'),
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActionButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    // Mock stats - would come from API
    final stats = [
      {'label': 'Wins', 'value': '18', 'icon': Icons.emoji_events, 'color': Colors.amber},
      {'label': 'Losses', 'value': '4', 'icon': Icons.close, 'color': Colors.red},
      {'label': 'Goals', 'value': '68', 'icon': Icons.sports_soccer, 'color': Colors.blue},
      {'label': 'Win Rate', 'value': '75%', 'icon': Icons.trending_up, 'color': Colors.green},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Stats',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 1.5,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: stats.length,
          itemBuilder: (context, index) {
            final stat = stats[index];
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      stat['icon'] as IconData,
                      color: stat['color'] as Color,
                      size: 24,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      stat['value'] as String,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      stat['label'] as String,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildMatchesSection(MatchState matchState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Suggested Matches',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton(
              onPressed: () => context.go('/matchmaking'),
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (matchState.isLoading)
          const Center(child: CircularProgressIndicator())
        else if (matchState.matches.isEmpty)
          _buildEmptyState('No matches available')
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: matchState.matches.take(3).length,
            itemBuilder: (context, index) {
              final match = matchState.matches[index];
              return _buildMatchCard(context, match);
            },
          ),
      ],
    );
  }

  Widget _buildMatchCard(BuildContext context, Match match) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    match.homeTeam?.name ?? 'TBD',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
                const Text(
                  'vs',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.grey,
                  ),
                ),
                Expanded(
                  child: Text(
                    match.awayTeam?.name ?? 'TBD',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade100,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    match.sport,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.blue.shade700,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  DateFormat('MMM d, h:mm a').format(
                    DateTime.parse(match.scheduledAt),
                  ),
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => context.go('/matches/${match.id}'),
                child: const Text('Join Match'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTeamsSection(TeamState teamState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Your Teams',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton(
              onPressed: () => context.go('/teams'),
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (teamState.isLoading)
          const Center(child: CircularProgressIndicator())
        else if (teamState.teams.isEmpty)
          _buildEmptyState('No teams yet')
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: teamState.teams.take(3).length,
            itemBuilder: (context, index) {
              final team = teamState.teams[index];
              return _buildTeamCard(context, team);
            },
          ),
      ],
    );
  }

  Widget _buildTeamCard(BuildContext context, Team team) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.blue.shade100,
          child: Text(
            team.name.substring(0, 2).toUpperCase(),
            style: TextStyle(color: Colors.blue.shade700),
          ),
        ),
        title: Text(team.name),
        subtitle: Text('${team.sport} • ${team.members ?? 0} members'),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () => context.go('/teams/${team.id}'),
      ),
    );
  }

  Widget _buildCommunitySection() {
    // Mock community posts - would come from API
    final posts = [
      {'author': 'Mike Chen', 'content': 'Looking for a futsal match this weekend!', 'time': '2 hours ago'},
      {'author': 'Sarah Williams', 'content': 'Just won our championship match 5-2!', 'time': '5 hours ago'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Community',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton(
              onPressed: () => context.go('/community'),
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...posts.map((post) => Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: Colors.blue.shade100,
                      child: Text(
                        post['author']!.substring(0, 2).toUpperCase(),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue.shade700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          post['author'] as String,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          post['time'] as String,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(post['content'] as String),
                const SizedBox(height: 12),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.favorite_outline, size: 20),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: const Icon(Icons.chat_bubble_outline, size: 20),
                      onPressed: () {},
                    ),
                  ],
                ),
              ],
            ),
          ),
        )),
      ],
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Text(
          message,
          style: TextStyle(color: Colors.grey.shade600),
        ),
      ),
    );
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
}
