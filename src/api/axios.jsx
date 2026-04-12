import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://cloud-app-server-ae7x.onrender.com/api", // Aapka live backend URL
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, // success - as it is return karo
  (error) => {
    if (error.response?.status === 401) {
      // Token expire ya invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user_details");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
