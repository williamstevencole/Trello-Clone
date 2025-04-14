import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";

interface DeckBoardProps {
  deckId: string;
}

interface Member {
  authid: string;
  nombre: string;
  foto_perfil: string;
}

const DeckBoard = ({ deckId }: DeckBoardProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [deckTitle, setDeckTitle] = useState<string>("");
  const [allUsers, setAllUsers] = useState<Member[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeckInfo = async () => {
      const { data: deck, error: deckError } = await supabase
        .from("Deck")
        .select("title")
        .eq("id", deckId)
        .single();

      if (!deckError && deck) setDeckTitle(deck.title);

      const { data: deckMembers, error: memberError } = await supabase
        .from("DeckMembers")
        .select("Usuarios(id, nombre, foto_perfil)")
        .eq("deckid", deckId);

      if (!memberError && deckMembers) {
        setMembers(
          deckMembers.map((entry: any) => entry.Usuarios).filter(Boolean)
        );
      }

      const { data: users, error: usersError } = await supabase
        .from("Usuarios")
        .select("authid, nombre, foto_perfil");
      if (!usersError && users) {
        setAllUsers(
          users.map((user) => ({
            authid: user.authid,
            id: user.authid,
            nombre: user.nombre,
            foto_perfil: user.foto_perfil,
          }))
        );
      }
    };

    fetchDeckInfo();
  }, [deckId]);

  const handleAddMember = async (userId: string) => {
    const { error } = await supabase.from("DeckMembers").insert({
      deckid: deckId,
      memberid: userId,
    });

    if (!error) {
      const newMember = allUsers.find((u) => u.authid === userId);
      if (newMember) setMembers((prev) => [...prev, newMember]);
    }
  };

  return (
    <div className="w-full px-6 py-2  bg-opacity-10 backdrop-blur-3xl flex items-center justify-between">
      <h1 className="ml-20 text-xl font-bold text-black">{deckTitle}</h1>

      <div className="flex items-center gap-2 relative">
        {members.map((member) => (
          <div className="relative group" key={member.authid}>
            <img
              src={member.foto_perfil || "https://via.placeholder.com/32"}
              alt={member.nombre}
              className="w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer"
            />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {member.nombre}
            </div>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          onClick={() => setShowAddMember(!showAddMember)}
        >
          Share
        </button>
        {showAddMember && (
          <div className="absolute top-10 right-0 bg-white border border-gray-300 rounded shadow-md z-20 w-64 p-4">
            <h2 className="text-lg font-bold mb-2 text-black">Add Members</h2>
            <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
              {allUsers
                .filter((u) => !members.find((m) => m.authid === u.authid)) // compare to authid here too
                .map((user) => (
                  <div
                    key={user.authid}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 rounded"
                    onClick={() => handleAddMember(user.authid)}
                  >
                    <img
                      src={user.foto_perfil || "https://via.placeholder.com/24"}
                      className="w-6 h-6 rounded-full"
                      alt={user.nombre}
                    />
                    <span className="text-sm text-black">{user.nombre}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckBoard;
