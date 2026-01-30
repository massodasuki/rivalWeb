// Match Service
// Mirrors frontend/src/services/matchService.ts functionality

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rival_mobile/models/match_models.dart';
import 'package:rival_mobile/services/api_client.dart';

/// Service for Match-related API calls
class MatchService {
  final ApiClient _apiClient;

  MatchService(this._apiClient);

  Future<List<Match>> getMatches() async {
    return await _apiClient.get<List<Match>>('/matches');
  }

  Future<Match> getMatch(int id) async {
    return await _apiClient.get<Match>('/matches/$id');
  }

  Future<Match> createMatch({
    int? homeTeamId,
    int? awayTeamId,
    required String sport,
    required String scheduledAt,
    String? location,
  }) async {
    return await _apiClient.post<Match>(
      '/matches',
      data: CreateMatchData(
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        sport: sport,
        scheduledAt: scheduledAt,
        location: location,
      ).toJson(),
    );
  }

  Future<void> addParticipant({
    required int matchId,
    required int userId,
    String? role,
  }) async {
    await _apiClient.post(
      '/matches/$matchId/participants',
      data: {
        'user_id': userId,
        'role': role,
      },
    );
  }

  Future<void> updateMatchStats({
    required int matchId,
    required int userId,
    int? goals,
    int? assists,
    double? rating,
  }) async {
    await _apiClient.post(
      '/matches/$matchId/stats',
      data: {
        'user_id': userId,
        'goals': goals,
        'assists': assists,
        'rating': rating,
      },
    );
  }

  Future<Match> updateMatchStatus({
    required int matchId,
    required String status,
  }) async {
    return await _apiClient.patch<Match>(
      '/matches/$matchId/status',
      data: UpdateMatchStatusData(status: status).toJson(),
    );
  }

  Future<void> deleteMatch(int id) async {
    await _apiClient.delete('/matches/$id');
  }
}

// Provider for MatchService
final matchServiceProvider = Provider<MatchService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return MatchService(apiClient);
});

// Match State Notifier using Riverpod
class MatchState {
  final List<Match> matches;
  final bool isLoading;
  final String? error;

  const MatchState({
    this.matches = const [],
    this.isLoading = false,
    this.error,
  });

  const MatchState.initial()
      : matches = const [],
        isLoading = false,
        error = null;

  MatchState copyWith({
    List<Match>? matches,
    bool? isLoading,
    String? error,
  }) {
    return MatchState(
      matches: matches ?? this.matches,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class MatchNotifier extends StateNotifier<MatchState> {
  final MatchService _matchService;

  MatchNotifier(this._matchService) : super(const MatchState.initial());

  Future<void> fetchMatches() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final matches = await _matchService.getMatches();
      state = state.copyWith(
        matches: matches,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<Match> createMatch(CreateMatchData data) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final match = await _matchService.createMatch(
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        sport: data.sport,
        scheduledAt: data.scheduledAt,
        location: data.location,
      );
      state = state.copyWith(
        matches: [...state.matches, match],
        isLoading: false,
      );
      return match;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
      rethrow;
    }
  }

  Future<void> joinMatch({
    required int matchId,
    required int userId,
  }) async {
    try {
      await _matchService.addParticipant(
        matchId: matchId,
        userId: userId,
      );
      // Refresh matches after joining
      await fetchMatches();
    } catch (e) {
      state = state.copyWith(error: e.toString());
      rethrow;
    }
  }
}

// Provider for MatchNotifier
final matchNotifierProvider = StateNotifierProvider<MatchNotifier, MatchState>((ref) {
  final matchService = ref.watch(matchServiceProvider);
  return MatchNotifier(matchService);
});
