// Models for Teams
// Matches backend: backend/src/modules/teams/entities/team.entity.ts

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:json_annotation/json_annotation.dart';

part 'team_models.freezed.dart';
part 'team_models.g.dart';

@freezed
class Team with _$Team {
  const factory Team({
    required int id,
    required String name,
    required String sport,
    @JsonKey(name: 'captain_id') int? captainId,
    @JsonKey(name: 'created_at') String? createdAt,
    @JsonKey(name: 'updated_at') String? updatedAt,
    // UI fields
    int? members,
    String? captain,
    int? wins,
    int? losses,
    double? rating,
  }) = _Team;

  factory Team.fromJson(Map<String, dynamic> json) => _$TeamFromJson(json);
}

@freezed
class CreateTeamData with _$CreateTeamData {
  const factory CreateTeamData({
    required String name,
    required String sport,
    @JsonKey(name: 'captain_id') int? captainId,
  }) = _CreateTeamData;

  factory CreateTeamData.fromJson(Map<String, dynamic> json) =>
      _$CreateTeamDataFromJson(json);
}

@freezed
class UpdateTeamData with _$UpdateTeamData {
  const factory UpdateTeamData({
    String? name,
    String? sport,
    @JsonKey(name: 'captain_id') int? captainId,
  }) = _UpdateTeamData;

  factory UpdateTeamData.fromJson(Map<String, dynamic> json) =>
      _$UpdateTeamDataFromJson(json);
}

@freezed
class TeamMember with _$TeamMember {
  const factory TeamMember({
    int? id,
    @JsonKey(name: 'user_id') required int userId,
    String? role,
  }) = _TeamMember;

  factory TeamMember.fromJson(Map<String, dynamic> json) =>
      _$TeamMemberFromJson(json);
}

@freezed
class TeamMemberInfo with _$TeamMemberInfo {
  const factory TeamMemberInfo({
    required int id,
    required String name,
    String? avatar,
    String? role,
  }) = _TeamMemberInfo;

  factory TeamMemberInfo.fromJson(Map<String, dynamic> json) =>
      _$TeamMemberInfoFromJson(json);
}
