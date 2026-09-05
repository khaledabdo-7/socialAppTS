"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const error_response_1 = require("../common/response/error.response");
const validationMiddleware = (schema) => {
    return async (req, res, next) => {
        const valResult = schema.safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
        });
        if (!valResult.success) {
            const err = valResult.error;
            const issuesGrouped = {
                body: [],
                query: [],
                params: [],
                headers: [],
            };
            for (const issue of err.issues) {
                const key = issue.path[0];
                const subPath = issue.path.slice(1);
                if (issuesGrouped[key]) {
                    issuesGrouped[key].push({
                        path: subPath.length > 0 ? subPath : issue.path,
                        message: issue.message,
                    });
                }
            }
            const issuesList = Object.keys(issuesGrouped)
                .filter((k) => issuesGrouped[k].length > 0)
                .map((k) => ({
                key: k,
                issues: issuesGrouped[k],
            }));
            throw new error_response_1.BadRequestError("Validation failed", issuesList);
        }
        next();
    };
};
exports.validationMiddleware = validationMiddleware;
