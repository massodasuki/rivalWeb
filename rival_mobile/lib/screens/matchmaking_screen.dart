// Matchmaking Screen
// Mirrors frontend/src/pages/Matchmaking.tsx functionality

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rival_mobile/models/match_models.dart';
import 'package:rival_mobile/services/match_service.dart';
import 'package:rival_mobile/services/auth_service.dart';
import 'package:intl/intl.dart';

class MatchmakingScreen extends ConsumerWidget {
  const MatchmakingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final matchState = ref.watch(matchNotifierProvider);
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Matches'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterBottomSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Search and Filter Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search matches...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                fillColor: Colors.grey.shade100,
                filled: true,
              ),
              onChanged: (value) {
                // Implement search filtering
              },
            ),
          ),
          // Sport Filter Chips
          _buildSportFilterChips(),
          // Match List
          Expanded(
            child: matchState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : matchState.matches.isEmpty
                    ? _buildEmptyState(context)
                    : _buildMatchList(context, matchState, authState.user?.id),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/matches/create'),
        icon: const Icon(Icons.add),
        label: const Text('Create Match'),
      ),
      bottomNavigationBar: _buildBottomNavBar(context),
    );
  }

  Widget _buildSportFilterChips() {
    final sports = ['All', 'Futsal', 'Basketball', 'Tennis', 'Volleyball', 'Badminton'];
    String selectedSport = 'All';

    return StatefulBuilder(
      builder: (context, setState) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: sports.map((sport) {
                final isSelected = sport == selectedSport;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    selected: isSelected,
                    label: Text(sport),
                    selectedColor: Colors.blue.shade100,
                    checkmarkColor: Colors.blue,
                    onSelected: (selected) {
                      setState(() {
                        selectedSport = selected ? sport : 'All';
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        );
      },
    );
  }

  Widget _buildMatchList(BuildContext context, MatchState matchState, int? currentUserId) {
    final matches = matchState.matches;

    return RefreshIndicator(
      onRefresh: () async {
        ref.read(matchNotifierProvider.notifier).fetchMatches();
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: matches.length,
        itemBuilder: (context, index) {
          final match = matches[index];
          return _buildMatchCard(context, match, currentUserId);
        },
      ),
    );
  }

  Widget _buildMatchCard(BuildContext context, Match match, int? currentUserId) {
    final isUpcoming = DateTime.parse(match.scheduledAt).isAfter(DateTime.now());
    final statusColor = match.status == 'confirmed' ? Colors.green : Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => context.go('/matches/${match.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Sport and Status Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      match.sport,
                      style: TextStyle(
                        color: Colors.blue.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColor.shade50,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      match.status ?? 'upcoming',
                      style: TextStyle(
                        color: statusColor.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Teams
              Row(
                children: [
                  Expanded(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: Colors.blue.shade100,
                          child: Text(
                            (match.homeTeam?.name ?? 'TBD').substring(0, 2).toUpperCase(),
                            style: TextStyle(
                              color: Colors.blue.shade700,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          match.homeTeam?.name ?? 'TBD',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  const Text(
                    'vs',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                  Expanded(
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: Colors.orange.shade100,
                          child: Text(
                            (match.awayTeam?.name ?? 'TBD').substring(0, 2).toUpperCase(),
                            style: TextStyle(
                              color: Colors.orange.shade700,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          match.awayTeam?.name ?? 'TBD',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Divider(color: Colors.grey.shade200),
              const SizedBox(height: 12),
              // Match Details
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    DateFormat('EEE, MMM d, yyyy • h:mm a')
                        .format(DateTime.parse(match.scheduledAt)),
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                ],
              ),
              if (match.location != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 16, color: Colors.grey),
                    const SizedBox(width: 8),
                    Text(
                      match.location!,
                      style: TextStyle(color: Colors.grey.shade700),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => context.go('/matches/${match.id}'),
                      icon: const Icon(Icons.info_outline, size: 18),
                      label: const Text('Details'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _handleJoinMatch(context, ref, match.id),
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Join'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleJoinMatch(BuildContext context, WidgetRef ref, int matchId) async {
    final authState = ref.read(authNotifierProvider);
    final userId = authState.user?.id;

    if (userId == null) {
      // Redirect to login
      context.go('/login');
      return;
    }

    try {
      await ref.read(matchNotifierProvider.notifier).joinMatch(
            matchId: matchId,
            userId: userId,
          );
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Successfully joined the match!')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to join match: $e')),
        );
      }
    }
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.sports_soccer,
            size: 80,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 16),
          Text(
            'No matches available',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Be the first to create a match!',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => context.go('/matches/create'),
            icon: const Icon(Icons.add),
            label: const Text('Create Match'),
          ),
        ],
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Filter Matches',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            const Text('Sport', style: TextStyle(fontWeight: FontWeight.w500)),
            Wrap(
              spacing: 8,
              children: [
                FilterChip(label: const Text('Futsal'), selected: false, onSelected: (_) {}),
                FilterChip(label: const Text('Basketball'), selected: false, onSelected: (_) {}),
                FilterChip(label: const Text('Tennis'), selected: false, onSelected: (_) {}),
              ],
            ),
            const SizedBox(height: 16),
            const Text('Distance', style: TextStyle(fontWeight: FontWeight.w500)),
            Slider(
              value: 10,
              min: 1,
              max: 50,
              divisions: 49,
              label: '10 km',
              onChanged: (_) {},
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Reset'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Apply'),
                  ),
                ),
              ],
            ),
          ],
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
        return 1;
    }
  }
}
