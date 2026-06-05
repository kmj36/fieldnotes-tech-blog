import { req, buildQS } from "./client";
import type {
  TagDetail,
  CategoryDetail,
  AccountDetail,
  CategoryListResult,
  TagListResult,
  AccountListResult,
  LoginResult,
  CategoryQueryParams,
  TagQueryParams,
  AccountQueryParams,
  CategoryBody,
  TagBody,
  AccountRegisterBody,
  AccountUpdateBody,
  QSParams
} from "./types";
import type { PostDetail, PostQueryParams, PostListResult, PostBody, PostPublic } from "@/feature/post/types";

export const api = {
  /* Posts – Public */
  getPosts: (p?: PostQueryParams) => req<PostListResult>(`/api/v1/post?${buildQS(p as QSParams)}`),
  getPost: (slug: string) => req<PostDetail>(`/api/v1/post/${slug}`),
  /* Posts – Admin */
  getPostsAdmin: (p?: PostQueryParams) => req<PostListResult>(`/api/v1/post/admin?${buildQS(p as QSParams)}`),
  getPostAdmin: (slug: string) => req<PostDetail>(`/api/v1/post/admin/${slug}`),
  createPost: (b: PostBody) => req<PostPublic>("/api/v1/post", { method: "POST", body: b }),
  updatePost: (id: number, b: Partial<PostBody>) => req<PostDetail>(`/api/v1/post/${id}`, { method: "PATCH", body: b }),
  deletePost: (id: number) => req(`/api/v1/post/${id}`, { method: "DELETE" }),
  /* Categories */
  getCategories: (p?: CategoryQueryParams) => req<CategoryListResult>(`/api/v1/category?${buildQS(p as QSParams)}`),
  createCategory: (b: CategoryBody) => req<CategoryDetail>("/api/v1/category", { method: "POST", body: b }),
  updateCategory: (id: number, b: Partial<CategoryBody>) => req<CategoryDetail>(`/api/v1/category/${id}`, { method: "PATCH", body: b }),
  deleteCategory: (id: number) => req(`/api/v1/category/${id}`, { method: "DELETE" }),
  /* Tags */
  getTags: (p?: TagQueryParams) => req<TagListResult>(`/api/v1/tag?${buildQS(p as QSParams)}`),
  createTag: (b: TagBody) => req<TagDetail>("/api/v1/tag", { method: "POST", body: b }),
  updateTag: (id: number, b: Partial<TagBody>) => req<TagDetail>(`/api/v1/tag/${id}`, { method: "PATCH", body: b }),
  deleteTag: (id: number) => req(`/api/v1/tag/${id}`, { method: "DELETE" }),
  /* Auth */
  login: (b: { accountId: string; password: string }) => req<LoginResult>("/api/v1/auth/login", { method: "POST", body: b }),
  register: (b: AccountRegisterBody) => req<AccountDetail>("/api/v1/auth/register", { method: "POST", body: b }),
  getAccount: (aid: string) => req<AccountDetail>(`/api/v1/auth/${aid}`),
  listAccounts: (p?: AccountQueryParams) => req<AccountListResult>(`/api/v1/auth/list?${buildQS(p as QSParams)}`),
  updateAccount: (aid: string, b: AccountUpdateBody) => req<AccountDetail>(`/api/v1/auth/update/${aid}`, { method: "PATCH", body: b }),
  deleteAccount: (aid: string) => req(`/api/v1/auth/delete/${aid}`, { method: "DELETE" }),
};