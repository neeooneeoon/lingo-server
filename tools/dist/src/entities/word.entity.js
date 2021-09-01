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
exports.WordSchema = exports.Word = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Word = class Word {
};
__decorate([
    mongoose_1.Prop({ type: String }),
    __metadata("design:type", String)
], Word.prototype, "_id", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], Word.prototype, "bookNId", void 0);
__decorate([
    mongoose_1.Prop({ type: Number, required: true }),
    __metadata("design:type", Number)
], Word.prototype, "unitNId", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Word.prototype, "content", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: true }),
    __metadata("design:type", String)
], Word.prototype, "meaning", void 0);
__decorate([
    mongoose_1.Prop({ type: [String], required: true }),
    __metadata("design:type", Array)
], Word.prototype, "meanings", void 0);
__decorate([
    mongoose_1.Prop({ type: [String], required: false, default: [] }),
    __metadata("design:type", Array)
], Word.prototype, "pronunciations", void 0);
__decorate([
    mongoose_1.Prop({ type: [String], required: true, default: [] }),
    __metadata("design:type", Array)
], Word.prototype, "types", void 0);
__decorate([
    mongoose_1.Prop({ type: String, required: false, default: '' }),
    __metadata("design:type", String)
], Word.prototype, "imageRoot", void 0);
__decorate([
    mongoose_1.Prop({ type: Boolean, required: true, default: true }),
    __metadata("design:type", Boolean)
], Word.prototype, "isUseToMakeQuestion", void 0);
Word = __decorate([
    mongoose_1.Schema({ timestamps: false })
], Word);
exports.Word = Word;
exports.WordSchema = mongoose_1.SchemaFactory.createForClass(Word);
//# sourceMappingURL=word.entity.js.map