// CONTRACT: req.apiKey injected by requireApiKey
import "express";

declare global {
  namespace Express {
    interface Request {
      apiKey?: string;
    }
  }
}

export {};
