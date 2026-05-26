import { defineStore } from "pinia";
import axios from "axios";
import { getLogin } from "@/api/login";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
  }),
  actions: {
    async setAuthToken(token: string | null) {
      if (token) {
        if (!(await getLogin({ token }))) {
          this.token = null;
          return false;
        }
        localStorage.setItem("__auth", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        localStorage.removeItem("__auth");
        axios.defaults.headers.common["Authorization"] = null;
      }
      this.token = token;

      return true;
    },
  },
});
