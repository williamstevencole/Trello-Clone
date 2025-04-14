import { useState } from "react";
import supabase from "../../utils/supabase";
import PrimaryButton from "../../components/PrimaryButton";
import InputBox from "../../components/InputBox";
import Header from "../Header";

const CreateUsers = () => {
  const [emailsText, setEmailsText] = useState("");
  const [password, setPassword] = useState("");
  const [results, setResults] = useState<string[]>([]);

  const handleProcessEmails = async () => {
    if (password.trim() === "") {
      alert("Debes ingresar una contraseña para los nuevos usuarios.");
      return;
    }

    const emails = emailsText
      .split(/[\n,]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    try {
      const res = await supabase.functions.invoke("create-users", {
        body: { emails, password },
      });

      if (res.error) {
        alert(res.error.message);
        return;
      }

      setResults(res.data.results);
    } catch (error) {
      console.error("Error al procesar correos:", error);
      alert("Error al procesar correos");
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center">
      <Header />

      <div className="w-[600px] h-fit py-20 flex flex-col justify-center items-center mt-20 border-2 border-white bg-opacity-10 backdrop-blur-md rounded-lg px-6 ">
        <h1 className="text-white text-2xl font-bold text-center mb-6">
          Create new users
        </h1>

        <div className="w-full flex flex-col gap-4">
          <InputBox
            title="Correos"
            placeholder="Pega correos separados por línea o coma"
            type="text"
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            icon="email"
            height="large"
          />

          <InputBox
            title="Contraseña para nuevos usuarios"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon="password"
            height="small"
          />

          <div className="flex justify-center">
            <PrimaryButton
              title="Procesar correos"
              onClick={handleProcessEmails}
            />
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-6 w-full max-h-36 overflow-auto text-white text-sm bg-black bg-opacity-30 p-4 rounded">
            <ul className="list-disc list-inside">
              {results.map((res, i) => (
                <li key={i}>{res}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateUsers;
