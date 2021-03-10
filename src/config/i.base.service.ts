import { Types } from "mongoose";

export interface IBaseService<T> {
    index(): Promise<T[]>;

    findById(id: Types.ObjectId | string | number): Promise<T>;

    findByIds(ids: Array<Types.ObjectId | string | number>): Promise<T[]>;

    store(data: any): Promise<T>;

    update(id: Types.ObjectId | string | number, data: any): Promise<T>;

    delete(id: Types.ObjectId | string | number): Promise<T>;
}