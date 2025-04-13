import { create } from "zustand";
import { UsuarioType } from "../utils/databaseType";
import supabase from "../utils/supabase";

interface UserStore {
  user: UsuarioType | null;
  setUser: (user: UsuarioType | null) => void;
  getUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  getUser: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("Usuarios")
        .select("*")
        .eq("authid", session.user.id)
        .single();
      set({ user: data });
    }
  },
}));
