import { CreateTagDto } from '@dto/following';
import { Tag, TagDocument } from '@entities/tag.entity';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { log } from 'util';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  public findTag(currentUser: string, tagId: string): Observable<TagDocument> {
    return from(
      this.tagModel.findOne({
        _id: tagId,
        user: Types.ObjectId(currentUser),
      }),
    ).pipe(
      map((tag) => {
        if (!tag) {
          throw new BadRequestException(`Can't find user tag`);
        }
        return tag;
      }),
    );
  }

  public async viewTags(userId: string): Promise<TagDocument[]> {
    try {
      return this.tagModel.find({
        user: Types.ObjectId(userId),
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public getUserTags(currentUser: string): Observable<Partial<TagDocument>[]> {
    const unSelect = ['-__v', '-createdAt', '-updatedAt'];
    return from(
      this.cache.get<Partial<TagDocument>[]>(`tags/${currentUser}`),
    ).pipe(
      switchMap((tags) => {
        if (!tags) {
          return from(
            this.tagModel
              .find({
                user: Types.ObjectId(currentUser),
              })
              .select(unSelect),
          ).pipe(
            switchMap((userTags) => {
              this.cache
                .set<Partial<TagDocument>[]>(`tags/${currentUser}`, userTags, {
                  ttl: 3600,
                })
                .then((r) => {
                  console.log(r);
                });
              return of(userTags);
            }),
          );
        } else return of(tags);
      }),
    );
  }

  public createTag(
    currentUser: string,
    input: CreateTagDto,
  ): Observable<Partial<TagDocument>> {
    return this.getUserTags(currentUser).pipe(
      map((tags) => {
        if (tags.length >= 15) {
          throw new BadRequestException(`Tạo tối đa 15 thẻ`);
        }
        return tags;
      }),
      switchMap((tags) => {
        return from(
          this.tagModel
            .create({
              user: Types.ObjectId(currentUser),
              name: input.name,
              color: input.color,
              _id:
                Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15),
            })
            .then((result) => {
              delete result?.__v;
              delete result?.createdAt;
              delete result?.updatedAt;
              return result;
            }),
        ).pipe(
          switchMap((tag) => {
            const leanTag: Partial<TagDocument> = {
              _id: tag._id,
              user: tag.user,
              name: tag.name,
              color: tag.color,
            };
            this.cache
              .set<Partial<TagDocument>[]>(
                `tags/${currentUser}`,
                [...tags, leanTag],
                { ttl: 3600 },
              )
              .then((r) => console.log(r));
            return of(leanTag);
          }),
        );
      }),
    );
  }

  public removeTag(id: string): Observable<string> {
    return from(
      this.tagModel.deleteOne({
        _id: id,
      }),
    ).pipe(
      map((deleteResult) => {
        if (deleteResult.deletedCount === 1) {
          return 'Remove tag success';
        } else {
          throw new BadRequestException('Remove tag failed');
        }
      }),
    );
  }
  public editTag(id: string, tagName: string): Observable<TagDocument> {
    return from(
      this.tagModel.findOneAndUpdate(
        {
          _id: id,
        },
        {
          name: tagName,
        },
        {
          new: true,
        },
      ),
    ).pipe(
      map((updatedTag: TagDocument) => {
        if (!updatedTag) {
          throw new BadRequestException('Update tag failed');
        }
        return updatedTag;
      }),
    );
  }
}
