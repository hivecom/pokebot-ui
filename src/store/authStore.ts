import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
  }),
  actions: {
    setAuthToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem("__auth", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        localStorage.removeItem("__auth");
        axios.defaults.headers.common["Authorization"] = null;
      }
    },
  },
});
