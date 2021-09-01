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
exports.SentenceSchema = exports.Sentence = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Sentence = class Sentence {
};
__decorate([
    mongoose_1.Prop({ type: String }),
    __metadata("design:type", String)
], Sentence.prototype, "_id", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: true, default: '' }),
    __metadata("design:type", String)
], Sentence.prototype, "baseId", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], Sentence.prototype, "bookNId", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], Sentence.prototype, "unitNId", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: false, default: '' }),
    __metadata("design:type", String)
], Sentence.prototype, "audio", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: true, default: '' }),
    __metadata("design:type", String)
], Sentence.prototype, "content", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: false, default: '' }),
    __metadata("design:type", String)
], Sentence.prototype, "phrase", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: true, default: '' }),
    __metadata("design:type", String)
], Sentence.prototype, "translate", void 0);
__decorate([
    mongoose_1.Prop({ type: [String], required: true, default: [] }),
    __metadata("design:type", Array)
], Sentence.prototype, "translates", void 0);
__decorate([
    mongoose_1.Prop({ type: Boolean, required: true, default: false }),
    __metadata("design:type", Boolean)
], Sentence.prototype, "isConversation", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: true, default: -1 }),
    __metadata("design:type", Number)
], Sentence.prototype, "wordBaseIndex", void 0);
__decorate([
    mongoose_1.Prop({
        type: [
            {
                _id: String,
                wordId: String,
                text: String,
                isFocus: Boolean,
            },
        ],
    }),
    __metadata("design:type", Array)
], Sentence.prototype, "translateSplit", void 0);
__decorate([
    mongoose_1.Prop({
        type: [
            {
                _id: String,
                wordId: String,
                text: String,
                types: [String],
            },
        ],
    }),
    __metadata("design:type", Array)
], Sentence.prototype, "contentSplit", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: false, default: '' }),
    __metadata("design:type", String)
], Sentence.prototype, "questionSection", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: false, default: '' }),
    __metadata("design:type", String)
], Sentence.prototype, "contextSection", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: true, default: 0 }),
    __metadata("design:type", Number)
], Sentence.prototype, "lowerBound", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: true, default: 0 }),
    __metadata("design:type", Number)
], Sentence.prototype, "upperBound", void 0);
Sentence = __decorate([
    mongoose_1.Schema()
], Sentence);
exports.Sentence = Sentence;
exports.SentenceSchema = mongoose_1.SchemaFactory.createForClass(Sentence);
//# sourceMappingURL=sentence.entity.js.map