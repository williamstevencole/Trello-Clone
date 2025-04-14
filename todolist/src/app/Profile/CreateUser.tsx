import { useState } from "react";
import supabase from "../../utils/supabase";
import PrimaryButton from "../../components/PrimaryButton";
import InputBox from "../../components/InputBox";
import { useNavigate } from "react-router-dom";
import { UsuarioType } from "../../utils/databaseType";
import { InputBoxProps } from "../../utils/InputBoxType";
import Header from "../Header";
import { useUserStore } from "../../store/useUserStore";
const CreateUser = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<UsuarioType>({
    id: 0,
    nombre: "",
    authid: 0,
    rol: "limitado",
    foto_perfil: "",
    created_at: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const inputBoxes: InputBoxProps[] = [
    {
      title: "Nombre",
      placeholder: "Nombre",
      type: "text",
      value: user.nombre,
      icon: "user",
      height: "small",
      onChange: (e) => {
        setUser({ ...user, nombre: e.target.value });
      },
    },
  ];

  const handleCreateUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("No hay sesión activa.");
      return;
    }

    let publicUrl = "";

    if (selectedFile) {
      const ext = selectedFile.name.split(".").pop();
      const fileName = `foto_perfil.${ext}`;
      const filePath = `${session.user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("fotosdeperfil")
        .upload(filePath, selectedFile, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        alert("Error al subir la imagen");
        return;
      }

      const { data } = supabase.storage
        .from("fotosdeperfil")
        .getPublicUrl(filePath);

      publicUrl = data.publicUrl;
    }

    const { error } = await supabase.from("Usuarios").insert({
      nombre: user.nombre,
      foto_perfil: publicUrl,
      authid: session.user.id,
      rol: "limitado",
    });

    if (error) {
      console.error(error);
      alert("Error al crear usuario");
      return;
    }

    alert("Usuario creado con éxito ✅");
    useUserStore.setState({
      user: user,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-white text-4xl font-bold mb-8">Crear Usuario</h1>
        <div className="w-[600px] border-2 border-white rounded-lg flex flex-col place-items-center p-6 mb-12">
          <div className="w-full flex flex-col items-center">
            {/* Imagen */}
            <label
              htmlFor="foto_perfil"
              className="text-white text-xl font-bold mb-4"
            >
              Foto de perfil
            </label>
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-white mb-4">
              {user.foto_perfil ? (
                <img
                  src={user.foto_perfil}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-4xl">+</span>
                </div>
              )}
            </div>
            <input
              type="file"
              id="foto_perfil"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setUser({ ...user, foto_perfil: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <button
              onClick={() => document.getElementById("foto_perfil")?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-8"
            >
              Seleccionar imagen
            </button>

            {/* Nombre */}
            <div className="flex flex-col gap-4 w-full">
              {inputBoxes.map((inputBox) => (
                <InputBox
                  key={inputBox.title}
                  height="small"
                  icon={inputBox.icon}
                  placeholder={inputBox.placeholder}
                  title={inputBox.title}
                  type={inputBox.type}
                  value={inputBox.value}
                  onChange={inputBox.onChange}
                />
              ))}
            </div>

            {/* Botón */}
            <div className="mt-8 w-full flex justify-center">
              <PrimaryButton title="Crear usuario" onClick={handleCreateUser} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
