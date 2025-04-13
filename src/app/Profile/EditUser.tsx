import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import PrimaryButton from "../../components/PrimaryButton";
import InputBox from "../../components/InputBox";
import { useUserStore } from "../../store/useUserStore";
import { InputBoxProps } from "../../utils/InputBoxType";
import Header from "../Header";

const EditUser = () => {
  const navigate = useNavigate();
  const { user, getUser } = useUserStore();

  const [authUser, setAuthUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    email: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) throw error;

        setAuthUser(data.user);
        setFormData((prev) => ({
          ...prev,
          email: data.user.email || "",
        }));
      } catch (err) {
        console.error("Error fetching auth user:", err);
      }
    };

    fetchAuthUser();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nombre: user.nombre || "",
      }));
      setPreviewUrl(user.foto_perfil);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!user || !authUser) {
        throw new Error("No hay usuario autenticado");
      }

      // Subir imagen si hay nueva
      let publicUrl = user.foto_perfil;
      if (selectedFile) {
        const ext = selectedFile.name.split(".").pop();
        const fileName = `foto_perfil.${ext}`;
        const filePath = `${user.authid}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("fotosdeperfil")
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("fotosdeperfil")
          .getPublicUrl(filePath);

        publicUrl = data.publicUrl;
      }

      // Actualizar en tabla Usuarios
      const { error: updateError } = await supabase
        .from("Usuarios")
        .update({
          nombre: formData.nombre,
          foto_perfil: publicUrl,
        })
        .eq("authid", user.authid);

      if (updateError) throw updateError;

      // Si se cambió el correo
      if (formData.email !== authUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (emailError) throw emailError;
      }

      // Si se cambió la contraseña
      if (formData.newPassword && formData.currentPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: authUser.email,
          password: formData.currentPassword,
        });
        if (error) throw "Contraseña actual incorrecta";

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });
        if (passwordError) throw passwordError;
      }

      setSuccess("Perfil actualizado con éxito ✅");
      await getUser(); // Recargar datos del usuario
    } catch (err: any) {
      setError(err.message || "Error al actualizar el perfil");
    }
  };

  const inputBoxes: InputBoxProps[] = [
    {
      title: "Nombre",
      placeholder: "Nombre",
      type: "text",
      value: formData.nombre,
      icon: "user",
      height: "small",
      onChange: (e) => setFormData({ ...formData, nombre: e.target.value }),
    },
    {
      title: "Correo electrónico",
      placeholder: "Correo electrónico",
      type: "email",
      value: formData.email,
      icon: "email",
      height: "small",
      onChange: (e) => setFormData({ ...formData, email: e.target.value }),
    },
    {
      title: "Contraseña actual",
      placeholder: "Contraseña actual",
      type: "password",
      value: formData.currentPassword,
      icon: "password",
      height: "small",
      onChange: (e) =>
        setFormData({ ...formData, currentPassword: e.target.value }),
    },
    {
      title: "Nueva contraseña",
      placeholder: "Nueva contraseña",
      type: "password",
      value: formData.newPassword,
      icon: "password",
      height: "small",
      onChange: (e) =>
        setFormData({ ...formData, newPassword: e.target.value }),
    },
    {
      title: "Confirmar nueva contraseña",
      placeholder: "Confirmar nueva contraseña",
      type: "password",
      value: formData.confirmPassword,
      icon: "password",
      height: "small",
      onChange: (e) =>
        setFormData({ ...formData, confirmPassword: e.target.value }),
    },
  ];

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center">
      <Header />
      <h1 className="text-white text-4xl font-bold my-12">Editar Perfil</h1>
      <div className="w-[600px] border-2 border-white rounded-lg flex flex-col place-items-center p-6 mb-12">
        <div className="w-full flex flex-col items-center">
          <label
            htmlFor="foto_perfil"
            className="text-white text-xl font-bold mb-4"
          >
            Foto de perfil
          </label>
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-white mb-4">
            {previewUrl ? (
              <img
                src={previewUrl}
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
            onChange={handleFileChange}
          />
          <button
            onClick={() => document.getElementById("foto_perfil")?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Seleccionar imagen
          </button>

          <div className="flex flex-col gap-4 mt-8 w-full">
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

          {error && (
            <div className="mt-4 text-red-500 text-center">{error}</div>
          )}
          {success && (
            <div className="mt-4 text-green-500 text-center">{success}</div>
          )}

          <div className="mt-8 w-full flex justify-center gap-4">
            <PrimaryButton
              title="Guardar cambios"
              onClick={handleUpdateProfile}
            />
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
