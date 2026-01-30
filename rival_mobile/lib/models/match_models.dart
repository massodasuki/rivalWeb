// Models for Matches
// Matches backend: backend/src/modules/matches/entities/match.entity.ts

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:json_annotation/json_annotation.dart';

part 'match_models.freezed.dart';
part 'match_models.g.dart';

@freezed
class Match with _$Match {
  const factory Match({
    required int id,
    @JsonKey(name: 'home_team_id') int? homeTeamId,
    @JsonKey(name: 'away_team_id') int? awayTeamId,
    required String sport,
    String? location,
    @JsonKey(name: 'scheduled_at') required String scheduledAt,
    String? status,
    @JsonKey(name: 'created_at') String? createdAt,
    @JsonKey(name: 'updated_at') String? updatedAt,
    @JsonKey(name: 'home_team') TeamInfo? homeTeam,
    @JsonKey(name: 'away_team') TeamInfo? awayTeam,
  }) = _Match;

  factory Match.fromJson(Map<String, dynamic> json) => _$MatchFromJson(json);
}

@freezed
class TeamInfo with _$TeamInfo {
  const factory TeamInfo({
    required int id,
    required String name,
  }) = _TeamInfo;

  factory TeamInfo.fromJson(Map<String, dynamic> json) =>
      _$TeamInfoFromJson(json);
}

@freezed
class CreateMatchData with _$CreateMatchData {
  const factory CreateMatchData({
    @JsonKey(name: 'home_team_id') int? homeTeamId,
    @JsonKey(name: 'away_team_id') int? awayTeamId,
    required String sport,
    @JsonKey(name: 'scheduled_at') required String scheduledAt,
    String? location,
  }) = _CreateMatchData;

  factory CreateMatchData.fromJson(Map<String, dynamic> json) =>
      _$CreateMatchDataFromJson(json);
}

@freezed
class UpdateMatchStatusData with _$UpdateMatchStatusData {
  const factory UpdateMatchStatusData({
    required String status,
  }) = _UpdateMatchStatusData;

  factory UpdateMatchStatusData.fromJson(Map<String, dynamic> json) =>
      _$UpdateMatchStatusDataFromJson(json);
}

@freezed
class MatchParticipant with _$MatchParticipant {
  const factory MatchParticipant({
    int? id,
    @JsonKey(name: 'match_id') required int matchId,
    @JsonKey(name: 'user_id') required int userId,
    String? role,
    int? goals,
    int? assists,
    double? rating,
  }) = _MatchParticipant;

  factory MatchParticipant.fromJson(Map<String, dynamic> json) =>
      _$MatchParticipantFromJson(json);
}

@freezed
class MatchStat with _$MatchStat {
  const factory MatchStat({
    int? id,
    @JsonKey(name: 'match_id') required int matchId,
    @JsonKey(name: 'user_id') required int userId,
    int? goals,
    int? assists,
    double? rating,
  }) = _MatchStat;

  factory MatchStat.fromJson(Map<String, dynamic> json) =>
      _$MatchStatFromJson(json);
}

// UI display models
@freezed
class MatchDisplay with _$MatchDisplay {
  const factory MatchDisplay({
    required int id,
    required String homeTeam,
    required String awayTeam,
    required String sport,
    required String time,
    String? location,
    String? players,
    String? status,
  }) = _MatchDisplay;

  factory MatchDisplay.fromMatch(Match match) => MatchDisplay(
        id: match.id,
        homeTeam: match.homeTeam?.name ?? 'TBD',
        awayTeam: match.awayTeam?.name ?? 'TBD',
        sport: match.sport,
        time: _formatDateTime(match.scheduledAt),
        location: match.location,
        players: 'Open',
        status: match.status ?? 'upcoming',
      );

  static String _formatDateTime(String isoString) {
    final dateTime = DateTime.parse(isoString);
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
