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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Instance_1 = __importDefault(require("./Instance"));
let Autosender = class Autosender {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Autosender.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Autosender.prototype, "shooting_min", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Autosender.prototype, "shooting_max", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Autosender.prototype, "timer_start", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Autosender.prototype, "timer_end", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Autosender.prototype, "days", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Autosender.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Autosender.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Instance_1.default, instance => instance.autosender),
    (0, typeorm_1.JoinColumn)({ name: 'instance_id' }),
    __metadata("design:type", Instance_1.default)
], Autosender.prototype, "instance", void 0);
Autosender = __decorate([
    (0, typeorm_1.Entity)('autosender')
], Autosender);
exports.default = Autosender;
