import { Routes, Route, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

import Login from "./app/Auth/Login";
import CreateUser from "./app/Profile/CreateUser";
import Dashboard from "./app/Dashboard";
import WallpapersSection from "./app/Admin/WallpapersSection";
import EditUser from "./app/Profile/EditUser";
import CreateDeck from "./app/Decks/CreateDeck";
import DeckDashboard from "./app/Decks/DeckDashboard";
import SignupPage from "./app/Auth/SignUp";
import AuthWatcher from "./utils/AuthWrapper";

import supabase from "./utils/supabase";

import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <AuthWatcher />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createuser" element={<CreateUser />} />
        <Route path="/edituser" element={<EditUser />} />
        <Route path="/wallpapers" element={<WallpapersSection />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/createdeck" element={<CreateDeck />} />
        <Route path="/deck/:id" element={<DeckDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
