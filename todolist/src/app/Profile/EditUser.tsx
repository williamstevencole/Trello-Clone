import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import PrimaryButton from "../../components/PrimaryButton";
import InputBox from "../../components/InputBox";
import Header from "../Header";
import { useUserStore } from "../../store/useUserStore";

const EditUser = () => {
  const navigate = useNavigate();
  const { user, getUser } = useUserStore();

  const [authUser, setAuthUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setAuthUser(data.user);
        setFormData((prev) => ({
          ...prev,
          email: data.user.email || "",
        }));
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
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePhoto = async () => {
    try {
      if (!user) throw new Error("Usuario no autenticado");
      if (!selectedFile) throw new Error("No hay imagen seleccionada");

      const ext = selectedFile.name.split(".").pop();
      const filePath = `${user.authid}/foto_perfil.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("fotosdeperfil")
        .upload(filePath, selectedFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("fotosdeperfil")
        .getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("Usuarios")
        .update({ foto_perfil: publicUrl })
        .eq("authid", user.authid);
      if (updateError) throw updateError;

      setSuccess("Foto de perfil actualizada ✅");
      await getUser();
    } catch (err: any) {
      setError(err.message || "Error al actualizar la foto de perfil");
    }
  };

  const handleUpdateBasicInfo = async () => {
    try {
      if (!user || !authUser) throw new Error("Usuario no autenticado");

      const { error: updateError } = await supabase
        .from("Usuarios")
        .update({ nombre: formData.nombre })
        .eq("authid", user.authid);
      if (updateError) throw updateError;

      if (formData.email !== authUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (emailError) throw emailError;
      }

      setSuccess("Nombre y correo actualizados ✅");
      await getUser();
    } catch (err: any) {
      setError(err.message || "Error al actualizar los datos básicos");
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!authUser) throw new Error("Usuario no autenticado");

      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password: formData.currentPassword,
      });
      if (error) throw new Error("Contraseña actual incorrecta");

      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });
      if (passwordError) throw passwordError;

      setSuccess("Contraseña actualizada ✅");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err: any) {
      setError(err.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center">
      <Header />
      <h1 className="text-white text-4xl font-bold my-12">Editar Perfil</h1>
      <div className="w-[600px] border-2 border-white rounded-lg flex flex-col place-items-center p-6 mb-12">
        {/* FOTO DE PERFIL */}
        <label className="text-white text-xl font-bold mb-4">
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
          className="px-4 py-2 mb-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Seleccionar imagen
        </button>
        <PrimaryButton
          title="Actualizar foto de perfil"
          onClick={handleUpdatePhoto}
        />

        {/* DATOS BÁSICOS */}
        <div className="flex flex-col gap-4 mt-8 w-full">
          <div className="mt-8 w-full border-t border-gray-700 pt-6"></div>
          <h2 className="text-white text-xl font-bold ">Datos básicos</h2>
          <InputBox
            title="Nombre"
            placeholder="Nombre"
            type="text"
            icon="user"
            value={formData.nombre}
            height="small"
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
          />
          <InputBox
            title="Correo electrónico"
            placeholder="Correo"
            type="email"
            icon="email"
            height="small"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <PrimaryButton
          title="Guardar nombre y correo"
          onClick={handleUpdateBasicInfo}
        />

        {/* CONTRASEÑA */}
        <div className="mt-8 w-full border-t border-gray-700 pt-6">
          <h2 className="text-white text-xl font-bold mb-4">
            Cambiar contraseña
          </h2>
          <div className="flex flex-col gap-4">
            <InputBox
              title="Contraseña actual"
              placeholder="Contraseña actual"
              type="password"
              value={formData.currentPassword}
              icon="password"
              height="small"
              onChange={(e) =>
                setFormData({ ...formData, currentPassword: e.target.value })
              }
            />
            <InputBox
              title="Nueva contraseña"
              placeholder="Nueva contraseña"
              type="password"
              value={formData.newPassword}
              icon="password"
              height="small"
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
            />
            <InputBox
              title="Confirmar nueva contraseña"
              placeholder="Confirmar nueva contraseña"
              type="password"
              value={formData.confirmPassword}
              icon="password"
              height="small"
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>
          <div className="flex justify-center">
            <PrimaryButton
              title="Cambiar contraseña"
              onClick={handleChangePassword}
            />
          </div>
        </div>

        {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
        {success && (
          <div className="mt-4 text-green-500 text-center">{success}</div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-8 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditUser;
