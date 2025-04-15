import { useEffect, useState } from "react";
import Header from "./Header";
import DeckCard from "../components/DeckCard";
import supabase from "../utils/supabase";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [ownedDecks, setOwnedDecks] = useState<any[]>([]);
  const [sharedDecks, setSharedDecks] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserAndDecks = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      setUserId(Number(user.id));

      const { data: decks, error } = await supabase
        .from("Deck")
        .select(`*, Usuarios:owner (nombre)`)
        .order("created_at", { ascending: false });

      if (!error && decks) {
        const owned = decks.filter((deck) => deck.owner === user.id);
        const shared = decks.filter((deck) => deck.owner !== user.id);
        setOwnedDecks(owned);
        setSharedDecks(shared);
      } else {
        console.error("Error fetching decks:", error?.message);
      }
    };

    fetchUserAndDecks();
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <Header />

      <h1 className="text-white text-4xl font-bold mt-12 ml-16">
        Tus tableros
      </h1>
      <motion.main
        layout
        className="flex flex-wrap gap-8 my-6 mx-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {ownedDecks.map((deck) => (
          <motion.div
            key={deck.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DeckCard deck={deck} />
          </motion.div>
        ))}

        {/* Create board */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
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
        </motion.div>
      </motion.main>

      <h1 className="text-white text-4xl font-bold mt-8 ml-16">
        Tableros compartidos contigo
      </h1>
      <motion.main
        layout
        className="flex flex-wrap gap-8 my-6 mx-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {sharedDecks.map((deck) => (
          <motion.div
            key={deck.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DeckCard deck={deck} />
          </motion.div>
        ))}
      </motion.main>
    </div>
  );
};

export default Dashboard;
