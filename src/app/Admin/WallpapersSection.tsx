import { useState, useEffect } from "react";
import supabase from "../../utils/supabase";
import PrimaryButton from "../../components/PrimaryButton";
import Header from "../Header";
import { FaTrash } from "react-icons/fa";

const WallpapersSection = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [wallpapers, setWallpapers] = useState<string[]>([]);

  const fetchWallpapers = async () => {
    const { data, error } = await supabase
      .from("Wallpaper")
      .select("wallpaperurl")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener wallpapers:", error.message);
      return;
    }

    setWallpapers(data?.map((d) => d.wallpaperurl) || []);
  };

  const handleUploadWallpaper = async () => {
    if (selectedFiles.length === 0) {
      alert("Selecciona al menos una imagen primero.");
      return;
    }

    for (const file of selectedFiles) {
      const ext = file.name.split(".").pop();
      const fileName = `wallpaper-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("fondosdepantalla")
        .upload(fileName, file);

      if (uploadError) {
        alert("Error al subir el archivo: " + uploadError.message);
        continue;
      }

      const { data } = supabase.storage
        .from("fondosdepantalla")
        .getPublicUrl(fileName);

      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        alert("No se pudo obtener la URL pública.");
        continue;
      }

      const { error: dbError } = await supabase
        .from("Wallpaper")
        .insert({ wallpaperurl: publicUrl });

      if (dbError) {
        alert("Error al guardar en la base de datos: " + dbError.message);
        continue;
      }
    }

    alert("Wallpapers subidos y guardados exitosamente ✅");
    setSelectedFiles([]);
    fetchWallpapers();
  };

  const handleDeleteWallpaper = async (url: string) => {
    const { error } = await supabase
      .from("Wallpaper")
      .delete()
      .eq("wallpaperurl", url);
    if (error) {
      alert("Error al eliminar el wallpaper: " + error.message);
    } else {
      fetchWallpapers();
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, []);

  return (
    <div className="bg-[#111111] w-full h-fit min-h-screen flex flex-col justify-center items-center">
      <Header />
      <div className="mt-10 w-[600px] border-2 border-white rounded-lg flex flex-col items-center p-6 mb-20">
        <h2 className="text-white text-2xl font-bold mb-4">Add Wallpapers</h2>

        {/* Vista previa con ícono clickeable */}
        <div className="w-full grid grid-cols-3 gap-2 mb-4">
          {selectedFiles.length > 0 ? (
            selectedFiles.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt={`preview-${i}`}
                className="h-24 w-full object-cover border border-white rounded"
              />
            ))
          ) : (
            <div
              onClick={() =>
                document.getElementById("wallpaper_upload")?.click()
              }
              className="col-span-3 w-full h-24 bg-gray-700 flex justify-center items-center border border-white rounded cursor-pointer hover:bg-gray-600 transition-colors"
            >
              <span className="text-white text-3xl">+</span>
            </div>
          )}
        </div>

        {/* Input oculto */}
        <input
          type="file"
          id="wallpaper_upload"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setSelectedFiles(files);
          }}
        />

        {/* Solo mostrar el botón de guardar si hay archivos seleccionados */}
        {selectedFiles.length > 0 && (
          <div className="w-full flex justify-center mb-6">
            <PrimaryButton
              title="Guardar wallpapers"
              onClick={handleUploadWallpaper}
            />
          </div>
        )}

        {/* Galería */}
        <div className="w-full flex justify-center">
          <h1 className="text-white text-2xl font-bold mt-8">Wallpapers</h1>
        </div>

        <div className="mt-6 w-full grid grid-cols-2 gap-4 overflow-y-auto">
          {wallpapers.map((url, index) => (
            <div
              key={index}
              className="w-full h-32 border border-white rounded overflow-hidden relative group"
            >
              <img
                src={url}
                alt={`Wallpaper ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDeleteWallpaper(url)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
              >
                <FaTrash size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WallpapersSection;
