import axios from "axios";
import type { AuthResponse, Order, Product, User } from "./types";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data),
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>("/auth/register", { name, email, password }).then((r) => r.data),
};

export const productsApi = {
  getAll: (params?: { category?: string; search?: string }) =>
    api.get<Product[]>("/products", { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get<Product>(`/products/${id}`).then((r) => r.data),
};

export const profileApi = {
  update: (data: { name?: string; phone?: string }) =>
    api.patch<User>("/auth/profile", data).then((r) => r.data),
};

export const ordersApi = {
  create: () =>
    api.post<Order>("/orders").then((r) => r.data),
  getMine: () => api.get<Order[]>("/orders").then((r) => r.data),
};

export default api;
