import { useState } from "react";
import supabase from "../../utils/supabase";
import PrimaryButton from "../../components/PrimaryButton";
import InputBox from "../../components/InputBox";

const CreateUsers = () => {
  const [emailsText, setEmailsText] = useState("");
  const [password, setPassword] = useState("");
  const [results, setResults] = useState<string[]>([]);

  // 🧑‍💻 Crear usuarios
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
    <div className="w-[600px] h-[600px] border-2 border-white rounded-lg flex flex-col justify-center items-center px-6 mb-20">
      <h1 className="text-white text-2xl font-bold">Create new users</h1>
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

        <div className="flex justify-center items-center">
          <PrimaryButton
            title="Procesar correos"
            onClick={handleProcessEmails}
          />
        </div>
      </div>

      <div className="mt-4 w-full max-h-36 overflow-auto text-white text-sm">
        {results.length > 0 && (
          <ul className="list-disc list-inside">
            {results.map((res, i) => (
              <li key={i}>{res}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CreateUsers;
