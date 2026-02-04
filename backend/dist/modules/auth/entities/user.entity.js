"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const friendship_entity_1 = require("../../friendships/entities/friendship.entity");
const team_entity_1 = require("../../teams/entities/team.entity");
const team_member_entity_1 = require("../../teams/entities/team-member.entity");
const match_participant_entity_1 = require("../../matches/entities/match-participant.entity");
const match_stat_entity_1 = require("../../matches/entities/match-stat.entity");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const chat_message_entity_1 = require("../../chat/entities/chat-message.entity");
const community_post_entity_1 = require("../../community/entities/community-post.entity");
const achievement_entity_1 = require("../../achievements/entities/achievement.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], User.prototype, "password_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "skill_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true, name: 'location' }),
    __metadata("design:type", String)
], User.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "sport_preferences", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, friendship => friendship.user),
    __metadata("design:type", Array)
], User.prototype, "friendships", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, friendship => friendship.friend),
    __metadata("design:type", Array)
], User.prototype, "friendRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_entity_1.Team, team => team.captain),
    __metadata("design:type", Array)
], User.prototype, "captainedTeams", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => team_member_entity_1.TeamMember, teamMember => teamMember.user),
    __metadata("design:type", Array)
], User.prototype, "teamMemberships", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_participant_entity_1.MatchParticipant, participant => participant.user),
    __metadata("design:type", Array)
], User.prototype, "matchParticipations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => match_stat_entity_1.MatchStat, stat => stat.user),
    __metadata("design:type", Array)
], User.prototype, "matchStats", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, notification => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chat_message_entity_1.ChatMessage, message => message.sender),
    __metadata("design:type", Array)
], User.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => community_post_entity_1.CommunityPost, post => post.user),
    __metadata("design:type", Array)
], User.prototype, "communityPosts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => achievement_entity_1.Achievement, achievement => achievement.user),
    __metadata("design:type", Array)
], User.prototype, "achievements", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map