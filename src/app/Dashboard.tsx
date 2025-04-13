// Dashboard.tsx
import { useEffect, useState } from "react";
import Header from "./Header";
import DeckCard from "../components/DeckCard";
import { DeckType } from "../utils/databaseType";
import supabase from "../utils/supabase";

const Dashboard = () => {
  const [decks, setDecks] = useState<any[]>([]);

  useEffect(() => {
    const fetchDecks = async () => {
      const { data, error } = await supabase
        .from("Deck")
        .select(`*, Usuarios:owner (nombre)`) // Join con Usuarios
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDecks(data);
      } else {
        console.error("Error fetching decks:", error?.message);
      }
    };

    fetchDecks();
  }, []);

  return (
    <div className="h-screen bg-[#111111] flex flex-col">
      <Header />

      {/* Main Content */}
      <h1 className="text-white text-4xl font-bold mt-12 ml-16">Boards</h1>

      <main className="flex-1 flex flex-wrap gap-8 my-12 mx-16">
        {decks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} />
        ))}

        {/* Create board card */}
        <DeckCard
          deck={{
            id: 1000,
            wallpaper: 0,
            owner: 0,
            pfp: "",
            banner: "",
            title: "Create Deck",
            description: "",
            created_at: "",
          }}
        />
      </main>
    </div>
  );
};

export default Dashboard;
