import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export function createApiClient(token) {
  const instance = axios.create({
    baseURL: API_BASE_URL
  });

  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  return instance;
}
