// shared/components/index.ts
export { api }     from "./api";
export { req, buildQS, setBase, setToken }   from "./client";
export type {
  ApiResponse,
  LoginResult,
  NavState,
  QSParams,
  PageKey
} from "./types";