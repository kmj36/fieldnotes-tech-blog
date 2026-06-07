// shared/components/index.ts
export { api }     from "./api";
export { req, buildQS, setBase, setToken }   from "./client";
export type {
  TagPublic,
  TagDetail,
  ApiResponse,
  TagListResult,
  AccountRole,
  AccountStatus,
  AccountPublic,
  AccountDetail,
  AccountListResult,
  LoginResult,
  NavState,
  AuthState,
  TagQueryParams,
  AccountQueryParams,
  TagBody,
  AccountRegisterBody,
  AccountUpdateBody,
  QSParams,
  PageKey
} from "./types";