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
const Client_1 = __importDefault(require("./Client"));
const Message_1 = __importDefault(require("./Message"));
const Autosender_1 = __importDefault(require("./Autosender"));
const Batch_1 = __importDefault(require("./Batch"));
let Instance = class Instance {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Instance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Instance.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Instance.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Instance.prototype, "insert_timestamp", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.default, client => client.instance),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", Client_1.default)
], Instance.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Message_1.default, message => message.instance, {
        cascade: ['insert', 'update']
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'id',
    }),
    __metadata("design:type", Array)
], Instance.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Autosender_1.default, autosender => autosender.instance, {
        cascade: ['insert', 'update'],
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'id',
    }),
    __metadata("design:type", Autosender_1.default)
], Instance.prototype, "autosender", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Batch_1.default, batch => batch.instance, {
        cascade: ['insert', 'update'],
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'id',
    }),
    __metadata("design:type", Array)
], Instance.prototype, "batches", void 0);
Instance = __decorate([
    (0, typeorm_1.Entity)('instances')
], Instance);
exports.default = Instance;
