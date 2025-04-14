import { useState, useEffect } from "react";
import { FaUserEdit, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import supabase from "../utils/supabase";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, getUser } = useUserStore();

  useEffect(() => {
    getUser();
  }, []);

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    useUserStore.setState({
      user: null,
    });
    navigate("/");
  };

  return (
    <div className="w-full h-20 bg-[#111111] z-50">
      {/* Header */}
      <header className="w-full h-20  border-b border-white flex items-center justify-between px-6">
        {/* Deck Options */}
        <div className="ml-10">
          <div className="flex gap-20">
            <button
              className="text-white hover:text-blue-400 transition-colors"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </button>
            {user?.rol === "admin" && (
              <div className="flex gap-20">
                <button
                  className="text-white hover:text-blue-400 transition-colors"
                  onClick={() => navigate("/wallpapers")}
                >
                  Wallpapers
                </button>
                <button
                  className="text-white hover:text-blue-400 transition-colors"
                  onClick={() => navigate("/createusers")}
                >
                  Create Users
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 text-white text-2xl font-bold">
          Trello look alike
        </div>

        {/* Profile Section */}
        <div className="relative border border-white rounded-full">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2"
          >
            <img
              src={user?.foto_perfil || "https://via.placeholder.com/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-white rounded-lg shadow-lg py-2 z-50">
              <h1 className="w-full text-left text-2xl px-4 py-2 text-white border-b border-white flex items-center gap-2">
                {user?.nombre}
              </h1>
              <button
                onClick={() => navigate("/edituser")}
                className="w-full text-left px-4 py-2 text-white hover:bg-blue-500 transition-colors border-b border-white flex items-center gap-2"
              >
                <FaUserEdit className="text-lg" />
                Edit my user
              </button>

              <button
                onClick={handleLogOut}
                className="w-full text-left px-4 py-2 text-white hover:bg-blue-500 transition-colors flex items-center gap-2"
              >
                <FaSignOutAlt className="text-lg" />
                Log off
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
