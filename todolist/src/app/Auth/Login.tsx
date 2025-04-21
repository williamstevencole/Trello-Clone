import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputBox from "../../components/InputBox";
import PrimaryButton from "../../components/PrimaryButton";
import OAuthButton from "../../components/OAuthButton";
import supabase from "../../utils/supabase";
import { useUserStore } from "../../store/useUserStore";

type InputBoxType = {
  title: string;
  placeholder: string;
  type: string;
  value: string;
  icon: "email" | "password" | "key";
};

const Login = () => {
  const navigate = useNavigate();
  const [InputBoxes, setInputBoxes] = useState<InputBoxType[]>([
    {
      title: "Type your email",
      placeholder: "Email",
      type: "text",
      value: "",
      icon: "email",
    },
    {
      title: "Type your password",
      placeholder: "Password",
      type: "password",
      value: "",
      icon: "password",
    },
  ]);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) console.error("OAuth login error:", error.message);
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: InputBoxes[0].value,
        password: InputBoxes[1].value,
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data) {
        const { data: user, error: userError } = await supabase
          .from("Usuarios")
          .select("id, authid, nombre, rol, foto_perfil, created_at")
          .eq("authid", data.user.id)
          .single();

        if (!user?.nombre || userError) {
          alert("Usuario no encontrado");
          navigate("/createuser");
        } else {
          useUserStore.setState({ user });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("An error occurred during login");
    }
  };

  return (
    <div className="h-screen bg-[#111111] flex justify-center items-center ">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-white text-4xl font-bold mb-4"> LOGIN </h1>

        <div className="w-[600px] h-[600px] border-2 border-white rounded-lg flex flex-col place-items-center ">
          <div className="w-full h-full flex flex-col justify-center items-center">
            {InputBoxes.map((inputBox, index) => (
              <div key={index} className="mb-6">
                <InputBox
                  title={inputBox.title}
                  placeholder={inputBox.placeholder}
                  type={inputBox.type}
                  value={inputBox.value}
                  icon={inputBox.icon}
                  height="small"
                  onChange={(e) => {
                    const newInputBoxes = [...InputBoxes];
                    newInputBoxes[index].value = e.target.value;
                    setInputBoxes(newInputBoxes);
                  }}
                />
              </div>
            ))}

            <PrimaryButton title="Login" onClick={handleLogin} />

            <div className="mt-6 flex flex-col gap-3 w-full px-10">
              <OAuthButton
                provider="google"
                onClick={() => handleOAuthLogin("google")}
              />
            </div>

            <p className="text-white mt-4">
              ¿No tienes una cuenta?{" "}
              <span
                onClick={() => navigate("/signup")}
                className="text-blue-400 underline cursor-pointer hover:text-blue-600"
              >
                Regístrate aquí
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
