import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import PrimaryButton from "../../components/PrimaryButton";
import InputBox from "../../components/InputBox";
import WallpapersSection from "./WallpapersSection";
import Header from "../Header";
import CreateUsers from "./CreateUsers";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [wallpapers, setWallpapers] = useState<string[]>([]);

  const handleLogOff = () => {
    supabase.auth.signOut();
    navigate("/");
  };

  // 📥 Upload de wallpaper
  const handleUploadWallpaper = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { error } = await supabase.storage
      .from("fondosdepantalla")
      .upload(file.name, file, { upsert: false });

    if (error) {
      alert("Error subiendo el wallpaper: " + error.message);
      return;
    }

    alert("Wallpaper subido con éxito");
    fetchWallpapers(); // actualizar lista
  };

  // 🔁 Obtener wallpapers
  const fetchWallpapers = async () => {
    const { data, error } = await supabase.storage
      .from("fondosdepantalla")
      .list("", { limit: 100 });

    if (error) {
      console.error("Error al obtener wallpapers:", error.message);
      return;
    }

    const urls = data.map(
      (file) =>
        supabase.storage.from("fondosdepantalla").getPublicUrl(file.name).data
          .publicUrl
    );
    setWallpapers(urls);
  };

  useEffect(() => {
    fetchWallpapers();
  }, []);

  return (
    <div className="h-fit bg-[#111111] flex justify-center items-center overflow-y-hidden">
      <div className="flex flex-col justify-center items-center w-full">
        <Header />
        <div></div>
        <h1 className="text-white text-4xl font-bold mb-4 mt-20">
          ADMIN DASHBOARD
        </h1>

        {/* WALLPAPER SECCIÓN */}
        <WallpapersSection />

        {/* USUARIOS */}

        <CreateUsers />

        <button
          onClick={handleLogOff}
          className="mb-20 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
