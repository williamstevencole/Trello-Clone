import { Routes, Route, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import Login from "./app/Login";
import AdminDashboard from "./app/Admin/AdminDashboard";
import CreateUser from "./app/Profile/CreateUser";
import Dashboard from "./app/Dashboard";
import WallpapersSection from "./app/Admin/WallpapersSection";
import EditUser from "./app/Profile/EditUser";
import CreateDeck from "./app/Decks/CreateDeck";
import DeckDashboard from "./app/Decks/DeckDashboard";

import supabase from "./utils/supabase";

import "./App.css";
import CreateUsers from "./app/Admin/CreateUsers";

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/");
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/createuser" element={<CreateUser />} />
      <Route path="/edituser" element={<EditUser />} />
      <Route path="/wallpapers" element={<WallpapersSection />} />
      <Route path="/createusers" element={<CreateUsers />} />
      <Route path="/createdeck" element={<CreateDeck />} />
      <Route path="/deck/:id" element={<DeckDashboard />} />
    </Routes>
  );
}

export default App;
