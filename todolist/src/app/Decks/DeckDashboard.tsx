import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../utils/supabase";
import Header from "../Header";
import DeckBoard from "./DeckBoard";
interface Column {
  id: number;
  nombre: string;
  posicion: number;
}

const DeckDashboard = () => {
  const { id } = useParams();
  const [columns, setColumns] = useState<Column[]>([]);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);

  const fetchDeck = async () => {
    try {
      const { data: columnsData, error: columnsError } = await supabase
        .from("DeckColumns")
        .select("nombre, posicion, id")
        .eq("deckid", id);

      if (columnsError) {
        console.error("Error fetching deck columns:", columnsError);
        return;
      }

      if (!columnsData) {
        setColumns([]);
        return;
      }

      const sortedColumns = columnsData.sort((a, b) => a.posicion - b.posicion);
      setColumns(sortedColumns);
    } catch (e) {
      console.error("Unexpected error:", e);
      setColumns([]);
    }
  };

  const fetchWallpaper = async () => {
    try {
      const { data: deckData, error: deckError } = await supabase
        .from("Deck")
        .select("wallpaper")
        .eq("id", Number(id))
        .single();

      if (deckError || !deckData) return;

      const { data: wallpaperData, error: wallpaperError } = await supabase
        .from("Wallpaper")
        .select("wallpaperurl")
        .eq("id", deckData.wallpaper)
        .single();

      if (wallpaperError || !wallpaperData) return;

      console.log("Setting wallpaper URL:", wallpaperData.wallpaperurl);
      setWallpaperUrl(wallpaperData.wallpaperurl);
    } catch (error) {
      console.error("Error fetching wallpaper:", error);
    }
  };

  useEffect(() => {
    fetchDeck();
    fetchWallpaper();
  }, []);

  useEffect(() => {
    console.log("Wallpaper URL updated:", wallpaperUrl);
  }, [wallpaperUrl]);

  return (
    <div
      className="relative"
      style={{
        backgroundImage: wallpaperUrl ? `url('${wallpaperUrl}')` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
      }}
    >
      <div className="relative z-10">
        <Header />
        {id && <DeckBoard deckId={id} />}
        <div className="flex items-start justify-start p-6 overflow-x-auto bg-opacity-70 min-h-screen">
          <div className="flex flex-row gap-6">
            {columns.map((column) => (
              <div
                key={column.id}
                className="w-[300px] min-h-[600px] bg-[#1a1a1a] border border-white rounded-lg p-4 flex flex-col gap-4"
              >
                <h2 className="text-white text-xl font-bold text-center">
                  {column.nombre}
                </h2>
                {/* Aquí irán las tarjetas/tasks dentro de la columna */}
                <div className="flex-1"></div>
                <button className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mt-auto">
                  + Add card
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckDashboard;
