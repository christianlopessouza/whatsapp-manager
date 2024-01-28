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
const Message_1 = __importDefault(require("./Message"));
const Batch_1 = __importDefault(require("./Batch"));
let BatchHistory = class BatchHistory {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], BatchHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Batch_1.default, batch => batch.batchHistory),
    (0, typeorm_1.JoinColumn)({ name: 'batch_id' }),
    __metadata("design:type", Batch_1.default)
], BatchHistory.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Message_1.default, message => message.batchHistory),
    (0, typeorm_1.JoinColumn)({ name: 'message_id' }),
    __metadata("design:type", Message_1.default)
], BatchHistory.prototype, "message", void 0);
BatchHistory = __decorate([
    (0, typeorm_1.Entity)('batches_history')
], BatchHistory);
exports.default = BatchHistory;
