import { IBaseService } from "./i.base.service";
import { Model, Document, Types } from "mongoose";
import { InternalServerErrorException } from "@nestjs/common";
export class BaseService<T extends Document, R extends Model<T>> implements IBaseService<T> {

    protected readonly model: R;
    constructor(model: R) {
        this.model = model;
    }

    async index(): Promise<T[]> {
        try {
            return this.model.find();
        }
        catch(e) {
            throw new InternalServerErrorException(e.message || "An error occurred while processing request")
        }
    }
    async findById(id: string | number | Types.ObjectId): Promise<T> {
        try {
            const res = await this.model.findById(id);
            return res;
        }
        catch(e) {
            throw new InternalServerErrorException(e.message || "An error occurred while processing request")
        }
    }
    async findByIds(ids: (string | number | Types.ObjectId)[]): Promise<T[]> {
        return this.model.find().where("_id").in(ids);
    }
    async store(data: any): Promise<T> {
        try {
            const newInstance = new this.model(data);
            return newInstance.save(); 
        }
        catch(e) {
            throw new InternalServerErrorException(e.message || "An error occurred while processing request")
        }
    }
    async update(id: string | number | Types.ObjectId, data: any): Promise<T> {
        try {
            const instance = await this.findById(id);
            return instance.update(data);
        }
        catch(e) {
            throw new InternalServerErrorException(e.message || "An error occurred while processing request")
        }
    }
    async delete(id: string | number | Types.ObjectId): Promise<T> {
        try {
            const instance = await this.findById(id);
            return instance.deleteOne();
        }
        catch(e) {
            throw new InternalServerErrorException(e.message || "An error occurred while processing request")
        }
    }

}