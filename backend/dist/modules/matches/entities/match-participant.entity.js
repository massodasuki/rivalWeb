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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchParticipant = void 0;
const typeorm_1 = require("typeorm");
const match_entity_1 = require("./match.entity");
const user_entity_1 = require("../../auth/entities/user.entity");
let MatchParticipant = class MatchParticipant {
};
exports.MatchParticipant = MatchParticipant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MatchParticipant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'match_id' }),
    __metadata("design:type", Number)
], MatchParticipant.prototype, "match_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], MatchParticipant.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'player' }),
    __metadata("design:type", String)
], MatchParticipant.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'joined_at' }),
    __metadata("design:type", Date)
], MatchParticipant.prototype, "joined_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => match_entity_1.Match, match => match.participants),
    (0, typeorm_1.JoinColumn)({ name: 'match_id' }),
    __metadata("design:type", match_entity_1.Match)
], MatchParticipant.prototype, "match", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], MatchParticipant.prototype, "user", void 0);
exports.MatchParticipant = MatchParticipant = __decorate([
    (0, typeorm_1.Entity)('match_participants'),
    (0, typeorm_1.Unique)(['match_id', 'user_id'])
], MatchParticipant);
//# sourceMappingURL=match-participant.entity.js.map