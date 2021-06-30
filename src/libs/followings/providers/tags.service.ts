import { CreateTagDto } from "@dto/following";
import { Tag, TagDocument } from "@entities/tag.entity";
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

@Injectable()
export class TagsService {
    constructor(
        @InjectModel(Tag.name) private tagModel: Model<TagDocument>
    ) { }

    public async findTag(currentUser: string, tagId: string): Promise<TagDocument | undefined> {
        try {
            const tag = await this.tagModel.findOne({
                user: Types.ObjectId(currentUser),
                _id: tagId
            });
            if (!tag) {
                throw new NotFoundException(`Can't find user-tag${tagId}`);
            }
            return tag;
        } catch (error) {
            throw new BadRequestException()
        }
    }

    public async viewTags(userId: string): Promise<TagDocument[]> {
        try {
            let listTags = await this.tagModel.find({
                user: Types.ObjectId(userId)
            });
            return listTags;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async createTag(userId: string, input: CreateTagDto): Promise<void> {
        try {
            const newTag = await this.tagModel.create({
                user: Types.ObjectId(userId),
                name: input.name,
                color: input.color,
                _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            });
            if (!newTag) {
                throw new InternalServerErrorException(`Can't creat new tag for ${userId}`);
            }
            return;

        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
    public async removeTag(id: string): Promise<void> {
        try {
            id = id.trim();
            if(!id){
                throw new BadRequestException("Can not find")
            }
            await this.tagModel.deleteOne({ _id: id });  
            return; 
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
    public async editTag(id: string, tagName: string): Promise<TagDocument> {
        try {
            id = id.trim();
            tagName = tagName.trim();
            if(!id) {
                throw new BadRequestException("Can not find");
            }
            if(!tagName) {
                throw new BadRequestException("Name field not entered");
            }
            const tag = await this.tagModel.findOneAndUpdate({_id:id}, {name:tagName}, {new: true});
            if(!tag) {
                throw new BadRequestException("Can not find");
            }
            return tag;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }


}