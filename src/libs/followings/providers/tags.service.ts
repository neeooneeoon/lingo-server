import { CreateTagDto } from "@dto/following";
import { Tag, TagDocument } from "@entities/tag.entity";
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { from, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class TagsService {
    constructor(
        @InjectModel(Tag.name) private tagModel: Model<TagDocument>
    ) { }

    public findTag(currentUser: string, tagId: string): Observable<TagDocument> {
        return from(
            this.tagModel
                .findOne({
                    _id: tagId,
                    user: Types.ObjectId(currentUser),
                })
        ).pipe(
            map(tag => {
                if (!tag) {
                    throw new BadRequestException(`Can't find user tag`);
                }
                return tag;
            })
        )
    }



    public async viewTags(userId: string): Promise<TagDocument[]> {
        try {
            return this.tagModel.find({
                user: Types.ObjectId(userId)
            });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public getUserTags(currentUser: string): Observable<TagDocument[]> {
        const unSelect = ['-__v', '-createdAt', '-updatedAt']
        const tags$ = from(
            this.tagModel
                .find({
                    user: Types.ObjectId(currentUser)
                })
                .select(unSelect)
        );
        return tags$;
    }

    public createTag(currentUser: string, input: CreateTagDto): Observable<TagDocument> {
        return this.getUserTags(currentUser)
            .pipe(
                map(tags => {
                    if (tags.length >= 15) {
                        throw new BadRequestException(`Tạo tối đa 15 thẻ`);
                    }
                    return tags;
                }),
                switchMap(() => {
                    return this.tagModel
                        .create({
                            user: Types.ObjectId(currentUser),
                            name: input.name,
                            color: input.color,
                            _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                        })
                })
            );
    }
    public removeTag(id: string): Observable<string> {
        return from(
            this.tagModel
                .deleteOne({
                    _id: id
                })
        ).pipe(
            map(deleteResult => {
                if (deleteResult.deletedCount === 1) {
                    return 'Remove tag success';
                }
                else {
                    throw new BadRequestException('Remove tag failed')
                }
            })
        );
    }
    public editTag(id: string, tagName: string): Observable<TagDocument> {
        return from(
            this.tagModel
                .findOneAndUpdate(
                    {
                        _id: id
                    },
                    {
                        name: tagName
                    },
                    {
                        new: true
                    }
                )
        ).pipe(
            map((updatedTag: TagDocument) => {
                if (!updatedTag) {
                    throw new BadRequestException('Update tag failed');
                }
                return updatedTag;
            })
        )
    }

}