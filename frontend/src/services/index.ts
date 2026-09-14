import type { ExpenseSplitterAPI } from "./api";
import { HttpAPI } from "./http";

const api: ExpenseSplitterAPI = new HttpAPI();

export default api;
