import axios from "axios";

const api = axios.create({
  baseURL: "https://your-fastapi-backend.com"
});

export default api;
