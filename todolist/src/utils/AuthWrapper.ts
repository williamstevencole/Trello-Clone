import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "./supabase";
import { useUserStore } from "../store/useUserStore";

const AuthWatcher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        const { data: user, error } = await supabase
          .from("Usuarios")
          .select("*")
          .eq("authid", data.session.user.id)
          .single();

        if (!user && !location.pathname.startsWith("/deck/")) {
          navigate("/");
        }
        if (user && location.pathname.startsWith("/deck/")) {
          navigate("/deck/" + location.pathname.split("/")[2]);
        } else {
          navigate("/dashboard");
        }
      }
    };

    checkSession();
  }, []);

  return null; // No UI
};

export default AuthWatcher;
