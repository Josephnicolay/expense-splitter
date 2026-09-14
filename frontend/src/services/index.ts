import type { ExpenseSplitterAPI } from "./api";
import { MockAPI } from "./mock";

// Swap this import to switch implementations
const api: ExpenseSplitterAPI = new MockAPI();

export default api;
