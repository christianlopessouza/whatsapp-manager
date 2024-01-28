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
const BatchHistory_1 = __importDefault(require("./BatchHistory"));
const Instance_1 = __importDefault(require("./Instance"));
const MessageBatch_1 = __importDefault(require("./MessageBatch"));
let Batch = class Batch {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Batch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Batch.prototype, "sent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Batch.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Batch.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Instance_1.default, instance => instance.batches),
    (0, typeorm_1.JoinColumn)({ name: 'instance_id' }),
    __metadata("design:type", Instance_1.default)
], Batch.prototype, "instance", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => BatchHistory_1.default, batchHistory => batchHistory.batch, {
        cascade: ['insert', 'update'],
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'batch_id',
    }),
    __metadata("design:type", Array)
], Batch.prototype, "batchHistory", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MessageBatch_1.default, messageBatch => messageBatch.batch, {
        cascade: ['insert', 'update'],
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'batch_id',
    }),
    __metadata("design:type", Array)
], Batch.prototype, "messagesBatch", void 0);
Batch = __decorate([
    (0, typeorm_1.Entity)('batches')
], Batch);
exports.default = Batch;
