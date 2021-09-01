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
exports.QuestionSchema = exports.Question = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const enums_1 = require("@utils/enums");
let Question = class Question {
};
__decorate([
    mongoose_1.Prop({ type: String }),
    __metadata("design:type", String)
], Question.prototype, "_id", void 0);
__decorate([
    mongoose_1.Prop({
        type: [
            {
                _id: String,
                active: Boolean,
            },
        ],
        required: true,
        default: [],
    }),
    __metadata("design:type", Array)
], Question.prototype, "choices", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Question.prototype, "focus", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: true, default: -1 }),
    __metadata("design:type", Number)
], Question.prototype, "hiddenIndex", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: false }),
    __metadata("design:type", Number)
], Question.prototype, "rank", void 0);
__decorate([
    mongoose_1.Prop({ type: String, enum: Object.values(enums_1.QuestionTypeCode), required: true }),
    __metadata("design:type", String)
], Question.prototype, "code", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: false }),
    __metadata("design:type", String)
], Question.prototype, "wordId", void 0);
Question = __decorate([
    mongoose_1.Schema()
], Question);
exports.Question = Question;
exports.QuestionSchema = mongoose_1.SchemaFactory.createForClass(Question);
//# sourceMappingURL=question.entity.js.map