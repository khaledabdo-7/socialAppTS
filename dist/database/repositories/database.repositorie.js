"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        return await this.model.create(data);
    }
    async findAll({ filter, select, populate, lean, }) {
        let query = this.model.find();
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
    async findById({ id, select, populate, lean, }) {
        let query = this.model.findById(id);
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
    async findOne({ filter, select, populate, lean, }) {
        let query = this.model.findOne(filter);
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
    async updateOne(filter, data) {
        let query = this.model.updateOne(filter, data);
    }
    async deleteOne(filter) {
        let query = this.model.deleteOne(filter);
    }
}
exports.DatabaseRepository = DatabaseRepository;
