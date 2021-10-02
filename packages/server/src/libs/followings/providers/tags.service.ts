import { MAX_TTL } from '@utils/constants';
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
import { LeanDocument, Model, Types } from 'mongoose';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { ConfigsService } from '@configs';

@Injectable()
export class TagsService {
  private prefixKey: string;
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly configsService: ConfigsService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  public findTag(
    currentUser: string,
    tagId: string,
  ): Observable<LeanDocument<TagDocument>> {
    return from(
      this.tagModel
        .findOne({
          _id: tagId,
          user: Types.ObjectId(currentUser),
        })
        .select(['_id'])
        .lean(),
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
    return from(
      this.cache.get<Partial<TagDocument>[]>(
        `${this.prefixKey}/tags/${currentUser}`,
      ),
    ).pipe(
      switchMap((tags) => {
        if (!tags) {
          const unSelect = ['-__v', '-createdAt', '-updatedAt'];
          return from(
            this.tagModel
              .find({
                user: Types.ObjectId(currentUser),
              })
              .select(unSelect)
              .lean(),
          ).pipe(
            switchMap((userTags) => {
              this.cache
                .set<Partial<TagDocument>[]>(
                  `${this.prefixKey}/tags/${currentUser}`,
                  userTags,
                  {
                    ttl: MAX_TTL,
                  },
                )
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
                `${this.prefixKey}/tags/${currentUser}`,
                [...tags, leanTag],
                { ttl: MAX_TTL },
              )
              .then((r) => console.log(r));
            return of(leanTag);
          }),
        );
      }),
    );
  }

  public removeTag(id: string, currentUser: string): Observable<string> {
    return forkJoin([
      this.tagModel.deleteOne({
        _id: id,
      }),
      this.cache.get<Partial<TagDocument>[]>(
        `${this.prefixKey}/tags/${currentUser}`,
      ),
    ]).pipe(
      switchMap(([deleteResult, tags]) => {
        if (deleteResult?.deletedCount === 1) {
          if (tags !== null) {
            const index = tags.findIndex((item) => item._id === id);
            if (index !== -1) {
              tags.splice(index, 1);
              this.cache
                .set<Partial<TagDocument>[]>(
                  `${this.prefixKey}/tags/${currentUser}`,
                  tags,
                  {
                    ttl: MAX_TTL,
                  },
                )
                .then((r) => console.log(r));
            }
          }
          return of('Remove tag success');
        }
        throw new BadRequestException();
      }),
    );
  }
  public editTag(
    id: string,
    tagName: string,
    currentUser: string,
  ): Observable<TagDocument> {
    return forkJoin([
      this.tagModel
        .findOneAndUpdate(
          {
            _id: id,
          },
          {
            name: tagName,
          },
          {
            new: true,
          },
        )
        .select(['-__v', '-createdAt', '-updatedAt']),
      this.cache.get<Partial<TagDocument>[]>(
        `${this.prefixKey}/tags/${currentUser}`,
      ),
    ]).pipe(
      switchMap(([updatedTag, tags]) => {
        if (updatedTag) {
          if (tags !== null) {
            const index = tags.findIndex((item) => item._id === id);
            if (index !== -1) {
              tags[index] = updatedTag;
              this.cache
                .set<Partial<TagDocument>[]>(
                  `${this.prefixKey}/tags/${currentUser}`,
                  tags,
                  {
                    ttl: MAX_TTL,
                  },
                )
                .then((r) => console.log(r));
            }
            return of(updatedTag);
          }
        }
        throw new BadRequestException();
      }),
    );
  }

  public async pushToCache() {
    const tags: Array<{
      user: string;
      tags: Array<{ _id: string; color: string; name: string }>;
    }> = await this.tagModel.aggregate([
      {
        $group: {
          _id: {
            user: '$user',
          },
          tags: {
            $push: {
              _id: '$_id',
              color: '$color',
              name: '$name',
              user: '$user',
            },
          },
        },
      },
      {
        $project: {
          user: '$_id.user',
          tags: '$tags',
          _id: 0,
        },
      },
    ]);
    await Promise.all(
      tags.map((element) => {
        const path = `${this.prefixKey}/tags/${element.user}`;
        return this.cache.set<Partial<TagDocument>[]>(path, element.tags, {
          ttl: MAX_TTL,
        });
      }),
    );
  }
}
