// src/utils/TryCatch.ts
import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Now Generic: ReqT extends Request by default, so you can pass in
 * AuthenticatedRequest when you call TryCatch<MyReqType>(…).
 */
export default function TryCatch<ReqT extends Request = Request>(
  handler: (req: ReqT, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return async (req, res, next) => {
    try {
      // Cast through `unknown` to satisfy TS overlap checking
      await handler(req as unknown as ReqT, res, next);
    } catch (err: any) {
      console.error("[TryCatch Wrapper] Uncaught Error:", err);  
      res.status(500).json({ message: err.message });
    }
  };
}
