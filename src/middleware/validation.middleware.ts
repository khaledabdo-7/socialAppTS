import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../common/response/error.response";
import { ZodType, ZodError } from "zod";

type KeyReq = "body" | "query" | "params" | "headers";

type issueType = {
  key: KeyReq;
  issues: {
    path: (string | number | symbol | undefined)[];
    message: string;
  }[];
};

export const validationMiddleware = (schema: ZodType<any, any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const valResult = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
    });

    if (!valResult.success) {
      const err = valResult.error as ZodError;

      const issuesGrouped: Record<
        KeyReq,
        { path: (string | number | symbol | undefined)[]; message: string }[]
      > = {
        body: [],
        query: [],
        params: [],
        headers: [],
      };

      for (const issue of err.issues) {
        const key = issue.path[0] as KeyReq;
        const subPath = issue.path.slice(1);

        if (issuesGrouped[key]) {
          issuesGrouped[key].push({
            path: subPath.length > 0 ? subPath : issue.path,
            message: issue.message,
          });
        }
      }

      const issuesList: issueType[] = (Object.keys(issuesGrouped) as KeyReq[])
        .filter((k) => issuesGrouped[k].length > 0)
        .map((k) => ({
          key: k,
          issues: issuesGrouped[k],
        }));

      throw new BadRequestError("Validation failed", issuesList);
    }

    next();
  };
};
