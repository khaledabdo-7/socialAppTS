import { User } from "../../database/model/user.model";
import { IUser } from "../../common/interface/user.interface";
import { Model } from "mongoose";

export class DatabaseRepository<TRawDoc> {
  constructor(private model: Model<TRawDoc>) {}

  async create(data: TRawDoc) {
    return await this.model.create(data);
  }

  async findAll({
    filter,
    select,
    populate,
    lean,
  }: {
    filter?: any;
    select?: string | string[];
    populate?: string | string[];
    lean?: boolean;
  }) {
    let query: any = this.model.find();

    if (filter) {
      query = query.find(filter);
    }
    if (select) {
      query = query.select(select);
    }
    if (populate) {
      query = query.populate(populate);
    }
    if (lean) {
      query = query.lean();
    }
    return query;
  }

  async findById({
    id,
    select,
    populate,
    lean,
  }: {
    id: string;
    select?: string | string[];
    populate?: string | string[];
    lean?: boolean;
  }) {
    let query: any = this.model.findById(id);

    if (!query) {
      throw new Error("No user found with this id");
    }

    if (select) {
      query = query.select(select);
    }
    if (populate) {
      query = query.populate(populate);
    }
    if (lean) {
      query = query.lean();
    }
    return query;
  }

  async findOne({
    filter,
    select,
    populate,
    lean,
  }: {
    filter: any;
    select?: string | string[];
    populate?: string | string[];
    lean?: boolean;
  }) {
    let query: any = this.model.findOne(filter);

    if (!query) {
      throw new Error("No user found with this filter");
    }
    if (select) {
      query = query.select(select);
    }
    if (populate) {
      query = query.populate(populate);
    }
    if (lean) {
      query = query.lean();
    }
    return query;
  }

  async updateOne(filter: any, data: any) {
    let query: any = this.model.updateOne(filter, data);
  }

  async deleteOne(filter: any) {
    let query: any = this.model.deleteOne(filter);
  }
}
