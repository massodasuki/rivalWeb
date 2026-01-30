// Models for Authentication
// Matches backend: backend/src/modules/auth/auth.service.ts and auth.controller.ts

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:json_annotation/json_annotation.dart';

part 'auth_models.freezed.dart';
part 'auth_models.g.dart';

@freezed
class LoginData with _$LoginData {
  const factory LoginData({
    required String email,
    required String password,
  }) = _LoginData;

  factory LoginData.fromJson(Map<String, dynamic> json) =>
      _$LoginDataFromJson(json);
}

@freezed
class RegisterData with _$RegisterData {
  const factory RegisterData({
    required String name,
    required String email,
    required String password,
    @Default(1) int skillLevel,
    @Default([]) List<String> sportPreferences,
  }) = _RegisterData;

  factory RegisterData.fromJson(Map<String, dynamic> json) =>
      _$RegisterDataFromJson(json);
}

@freezed
class AuthResponse with _$AuthResponse {
  const factory AuthResponse({
    required String accessToken,
    required User user,
  }) = _AuthResponse;

  factory AuthResponse.fromJson(Map<String, dynamic> json) =>
      _$AuthResponseFromJson(json);
}

@freezed
class User with _$User {
  const factory User({
    required int id,
    required String name,
    required String email,
    @JsonKey(name: 'skill_level') int? skillLevel,
    @JsonKey(name: 'sport_preferences') List<String>? sportPreferences,
    String? avatar,
    String? phone,
    @JsonKey(name: 'primary_sport') String? primarySport,
    @JsonKey(name: 'created_at') String? createdAt,
    @JsonKey(name: 'updated_at') String? updatedAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

// Extended user for UI
@freezed
class UserWithStats with _$UserWithStats {
  const factory UserWithStats({
    required User user,
    required UserStats stats,
  }) = _UserWithStats;

  factory UserWithStats.fromJson(Map<String, dynamic> json) =>
      _$UserWithStatsFromJson(json);
}

@freezed
class UserStats with _$UserStats {
  const factory UserStats({
    required int matches,
    required int wins,
    required int losses,
    required int goals,
    required int assists,
    required double rating,
  }) = _UserStats;

  factory UserStats.fromJson(Map<String, dynamic> json) =>
      _$UserStatsFromJson(json);
}
