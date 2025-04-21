import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputBox from "../../components/InputBox";
import PrimaryButton from "../../components/PrimaryButton";
import OAuthButton from "../../components/OAuthButton";
import supabase from "../../utils/supabase";
import { InputBoxProps } from "../../utils/InputBoxType";

const SignupPage = () => {
  const navigate = useNavigate();
  const [InputBoxes, setInputBoxes] = useState<InputBoxProps[]>([
    {
      title: "Type your email",
      placeholder: "Email",
      type: "email",
      value: "",
      icon: "email",
      onChange: () => {},
      height: "small",
    },
    {
      title: "Create a password",
      placeholder: "Contraseña",
      type: "password",
      value: "",
      icon: "password",
      onChange: () => {},
      height: "small",
    },
  ]);

  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) console.error("OAuth login error:", error.message);
  };

  const handleSignup = async () => {
    const email = InputBoxes[0].value;
    const password = InputBoxes[1].value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Cuenta creada. Revisa tu correo para confirmar.");
      navigate("/");
    }
  };

  return (
    <div className="h-screen bg-[#111111] flex justify-center items-center ">
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-white text-4xl font-bold mb-10"> REGISTRO </h1>

        <div className="w-[600px] h-fit border-2 border-white rounded-lg flex flex-col place-items-center py-10 ">
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
                    const updated = [...InputBoxes];
                    updated[index].value = e.target.value;
                    setInputBoxes(updated);
                  }}
                />
              </div>
            ))}

            <PrimaryButton title="Registrarse" onClick={handleSignup} />

            <div className="mt-6 flex flex-col gap-3 w-full px-10">
              <OAuthButton
                provider="google"
                onClick={() => handleOAuthLogin("google")}
              />
            </div>

            <p className="text-white mt-4">
              ¿Ya tienes una cuenta?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-blue-400 underline cursor-pointer hover:text-blue-600"
              >
                Inicia sesión aquí
              </span>
            </p>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
