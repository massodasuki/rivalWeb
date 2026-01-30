// Team Service
// Mirrors frontend/src/services/teamService.ts functionality

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rival_mobile/models/team_models.dart';
import 'package:rival_mobile/services/api_client.dart';

/// Service for Team-related API calls
class TeamService {
  final ApiClient _apiClient;

  TeamService(this._apiClient);

  Future<List<Team>> getTeams() async {
    return await _apiClient.get<List<Team>>('/teams');
  }

  Future<Team> getTeam(int id) async {
    return await _apiClient.get<Team>('/teams/$id');
  }

  Future<Team> createTeam({
    required String name,
    required String sport,
    int? captainId,
  }) async {
    return await _apiClient.post<Team>(
      '/teams',
      data: CreateTeamData(
        name: name,
        sport: sport,
        captainId: captainId,
      ).toJson(),
    );
  }

  Future<void> addMember({
    required int teamId,
    required int userId,
    String? role,
  }) async {
    await _apiClient.post(
      '/teams/$teamId/members',
      data: {
        'user_id': userId,
        'role': role,
      },
    );
  }

  Future<void> removeMember({
    required int teamId,
    required int userId,
  }) async {
    await _apiClient.delete('/teams/$teamId/members/$userId');
  }

  Future<Team> updateTeam({
    required int teamId,
    String? name,
    String? sport,
    int? captainId,
  }) async {
    return await _apiClient.patch<Team>(
      '/teams/$teamId',
      data: UpdateTeamData(
        name: name,
        sport: sport,
        captainId: captainId,
      ).toJson(),
    );
  }

  Future<void> deleteTeam(int id) async {
    await _apiClient.delete('/teams/$id');
  }
}

// Provider for TeamService
final teamServiceProvider = Provider<TeamService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return TeamService(apiClient);
});

// Team State Notifier using Riverpod
class TeamState {
  final List<Team> teams;
  final bool isLoading;
  final String? error;

  const TeamState({
    this.teams = const [],
    this.isLoading = false,
    this.error,
  });

  const TeamState.initial()
      : teams = const [],
        isLoading = false,
        error = null;

  TeamState copyWith({
    List<Team>? teams,
    bool? isLoading,
    String? error,
  }) {
    return TeamState(
      teams: teams ?? this.teams,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class TeamNotifier extends StateNotifier<TeamState> {
  final TeamService _teamService;

  TeamNotifier(this._teamService) : super(const TeamState.initial());

  Future<void> fetchTeams() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final teams = await _teamService.getTeams();
      state = state.copyWith(
        teams: teams,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<Team> createTeam({
    required String name,
    required String sport,
    int? captainId,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final team = await _teamService.createTeam(
        name: name,
        sport: sport,
        captainId: captainId,
      );
      state = state.copyWith(
        teams: [...state.teams, team],
        isLoading: false,
      );
      return team;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }
}

// Provider for TeamNotifier
final teamNotifierProvider = StateNotifierProvider<TeamNotifier, TeamState>((ref) {
  final teamService = ref.watch(teamServiceProvider);
  return TeamNotifier(teamService);
});
