import { DeckType } from "../utils/databaseType";
import { useNavigate } from "react-router-dom";

const DeckCard = ({
  deck,
}: {
  deck: DeckType & { Usuarios?: { nombre: string } };
}) => {
  const { pfp, banner, title, description, created_at } = deck;
  const navigate = useNavigate();

  return title === "Create Deck" ? (
    <div
      onClick={() => navigate("/createdeck")}
      className="w-[350px] h-[230px] bg-[#1a1a1a] rounded-lg overflow-hidden border border-white hover:border-blue-500 transition-colors cursor-pointer flex flex-col items-center justify-center gap-4"
    >
      <span className="text-white text-6xl">+</span>
      <h3 className="text-white font-bold text-lg">Create your deck</h3>
    </div>
  ) : (
    <div
      onClick={() => navigate(`/deck/${deck.id}`)}
      className="w-[350px] h-[230px] bg-[#1a1a1a] rounded-lg overflow-hidden border border-white hover:border-blue-500 transition-colors cursor-pointer"
    >
      {/* Banner with overlapping profile picture */}
      <div className="w-full h-24 relative">
        <img
          src={banner}
          alt="Board banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute -bottom-6 left-4">
          <img
            src={pfp}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-8 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <span className="text-gray-400 text-xs">
            {new Date(created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{description}</p>
      </div>

      {/* Owner */}
      <div className="px-4 pb-3">
        <p className="text-gray-400 text-xs">
          Created by{" "}
          <span className="text-blue-400 font-medium">
            {deck.Usuarios?.nombre || "Unknown"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default DeckCard;
