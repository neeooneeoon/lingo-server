import { CreateTagDto } from "@dto/following";
import { Tag, TagDocument } from "@entities/tag.entity";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class TagsService {
    constructor(
        @InjectModel(Tag.name) private tagModel: Model<TagDocument>
    ) { }

    public async viewTags(userId: string): Promise<TagDocument[]> {
        try {
            let listTags = await this.tagModel.find({
                user: Types.ObjectId(userId)
            });
            return listTags;
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(error);
        }
    }

    public async createTag(userId: string, input: CreateTagDto): Promise<void> {
        try {
            const newTag = await this.tagModel.create({
                user: Types.ObjectId(userId),
                name: input.name,
                color: input.color
            });
            if (!newTag) {
                throw new InternalServerErrorException(`Can't creat new tag for ${userId}`);
            }
            return;

        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(error);
        }
    }

}