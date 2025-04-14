import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import Header from "../Header";
import InputBox from "../../components/InputBox";
import PrimaryButton from "../../components/PrimaryButton";
import { DeckType } from "../../utils/databaseType";

const CreateDeck = () => {
  const navigate = useNavigate();

  const [deckState, setDeckState] = useState<DeckType>({
    id: 0,
    title: "",
    description: "",
    wallpaper: 0,
    owner: 0,
    pfp: "",
    banner: "",
    created_at: "",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [wallpapers, setWallpapers] = useState<
    { id: number; wallpaperurl: string }[]
  >([]);
  const [selectedWallpaperId, setSelectedWallpaperId] = useState<number | null>(
    null
  );
  const [wallpaperExpanded, setWallpaperExpanded] = useState(false);

  const setProp = (prop: keyof DeckType, value: any) => {
    setDeckState({ ...deckState, [prop]: value });
  };

  useEffect(() => {
    const fetchWallpapers = async () => {
      const { data } = await supabase
        .from("Wallpaper")
        .select("id, wallpaperurl")
        .order("created_at", { ascending: false });

      if (data) setWallpapers(data);
    };

    fetchWallpapers();
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "banner" | "pfp"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "banner") {
        setBannerFile(file);
        setProp("banner", reader.result as string);
      } else {
        setPfpFile(file);
        setProp("pfp", reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return alert("Sesión no iniciada");

    const userId = session.user.id;

    const wallpaperId =
      selectedWallpaperId ??
      wallpapers[Math.floor(Math.random() * wallpapers.length)]?.id ??
      1;

    let bannerUrl = "";
    let pfpUrl = "";

    if (bannerFile) {
      const ext = bannerFile.name.split(".").pop();
      const { data } = await supabase.storage
        .from("deckbanner")
        .upload(`${userId}/${Date.now()}_banner.${ext}`, bannerFile, {
          upsert: true,
        });
      if (data) {
        bannerUrl = supabase.storage.from("deckbanner").getPublicUrl(data.path)
          .data.publicUrl;
      }
    }

    if (pfpFile) {
      const ext = pfpFile.name.split(".").pop();
      const { data } = await supabase.storage
        .from("deckpfp")
        .upload(`${userId}/${Date.now()}_pfp.${ext}`, pfpFile, {
          upsert: true,
        });
      if (data) {
        pfpUrl = supabase.storage.from("deckpfp").getPublicUrl(data.path)
          .data.publicUrl;
      }
    }

    const { error } = await supabase.from("Deck").insert({
      title: deckState.title,
      description: deckState.description,
      wallpaper: wallpaperId,
      owner: userId,
      pfp: pfpUrl,
      banner: bannerUrl,
    });

    if (error) {
      console.error(error);
      alert("Error al crear el deck");
      return;
    }

    alert("Deck creado con éxito ✅");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center">
      <Header />
      <h1 className="text-white text-4xl font-bold my-12">Create your deck</h1>
      <div className="w-[700px] border-2 border-white rounded-lg p-8 mb-20">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Banner */}
          <div className="w-full">
            <label className="text-white text-xl font-bold mb-2 block">
              Banner Image
            </label>
            <div className="w-full h-32 relative border-2 border-white rounded-lg overflow-hidden">
              {deckState.banner ? (
                <img
                  src={deckState.banner}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                  <span className="text-white text-4xl">+</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "banner")}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Profile */}
          <div className="w-full flex flex-col items-center">
            <label className="text-white text-xl font-bold mb-2 block">
              Profile Picture
            </label>
            <div className="w-32 h-32 relative">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                {deckState.pfp ? (
                  <img
                    src={deckState.pfp}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                    <span className="text-white text-4xl">+</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "pfp")}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Title / Description */}
          <InputBox
            title="Title"
            placeholder="Title"
            type="text"
            value={deckState.title}
            onChange={(e) => setProp("title", e.target.value)}
            icon="title"
            height="small"
          />
          <InputBox
            title="Description"
            placeholder="Description"
            type="text"
            value={deckState.description}
            onChange={(e) => setProp("description", e.target.value)}
            icon="description"
            height="small"
          />

          {/* Wallpaper Selector */}
          <div className="w-full">
            <button
              type="button"
              className="w-full text-left text-white text-xl font-bold mb-2"
              onClick={() => setWallpaperExpanded(!wallpaperExpanded)}
            >
              {wallpaperExpanded
                ? "Selecciona un wallpaper ▲"
                : "Selecciona un wallpaper ▼"}
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                wallpaperExpanded ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {wallpapers.map((wp) => (
                  <div
                    key={wp.id}
                    onClick={() => setSelectedWallpaperId(wp.id)}
                    className={`cursor-pointer border-2 rounded overflow-hidden ${
                      selectedWallpaperId === wp.id
                        ? "border-blue-500"
                        : "border-white hover:border-gray-400 transition-colors"
                    }`}
                  >
                    <img
                      src={wp.wallpaperurl}
                      alt={`Wallpaper ${wp.id}`}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full flex justify-center mt-4">
            <PrimaryButton title="Create" onClick={() => {}} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDeck;
