// Models for Community Posts
// Matches backend: backend/src/modules/community/entities/community-post.entity.ts

import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:json_annotation/json_annotation.dart';

part 'community_models.freezed.dart';
part 'community_models.g.dart';

@freezed
class CommunityPost with _$CommunityPost {
  const factory CommunityPost({
    required int id,
    @JsonKey(name: 'user_id') required int userId,
    String? title,
    required String content,
    String? type,
    @JsonKey(name: 'created_at') String? createdAt,
    @JsonKey(name: 'updated_at') String? updatedAt,
    // Relations
    AuthorInfo? author,
    // UI fields
    int? replies,
    String? time,
    int? likes,
    int? comments,
  }) = _CommunityPost;

  factory CommunityPost.fromJson(Map<String, dynamic> json) =>
      _$CommunityPostFromJson(json);
}

@freezed
class AuthorInfo with _$AuthorInfo {
  const factory AuthorInfo({
    required int id,
    required String name,
    String? avatar,
  }) = _AuthorInfo;

  factory AuthorInfo.fromJson(Map<String, dynamic> json) =>
      _$AuthorInfoFromJson(json);
}

@freezed
class CreatePostData with _$CreatePostData {
  const factory CreatePostData({
    @JsonKey(name: 'user_id') required int userId,
    String? title,
    required String content,
    String? type,
  }) = _CreatePostData;

  factory CreatePostData.fromJson(Map<String, dynamic> json) =>
      _$CreatePostDataFromJson(json);
}

@freezed
class UpdatePostData with _$UpdatePostData {
  const factory UpdatePostData({
    String? title,
    String? content,
    String? type,
  }) = _UpdatePostData;

  factory UpdatePostData.fromJson(Map<String, dynamic> json) =>
      _$UpdatePostDataFromJson(json);
}

// UI display model
@freezed
class CommunityPostDisplay with _$CommunityPostDisplay {
  const factory CommunityPostDisplay({
    required int id,
    required String author,
    String? avatar,
    required String content,
    required String time,
    int? likes,
    int? comments,
  }) = _CommunityPostDisplay;

  factory CommunityPostDisplay.fromPost(CommunityPost post) =>
      CommunityPostDisplay(
        id: post.id,
        author: post.author?.name ?? 'Unknown',
        avatar: post.author?.avatar,
        content: post.content,
        time: post.time ?? _formatTime(post.createdAt),
        likes: post.likes ?? 0,
        comments: post.comments ?? 0,
      );

  static String _formatTime(String? isoString) {
    if (isoString == null) return 'Recently';
    final dateTime = DateTime.parse(isoString);
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes} min ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }
}
