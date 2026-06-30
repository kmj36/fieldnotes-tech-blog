// shared/components/index.ts
export { api }     from "./api";
export { req, buildQS, setBase, setToken }   from "./client";
export type {
  ApiResponse,
  LoginResult,
  QSParams
} from "./types";