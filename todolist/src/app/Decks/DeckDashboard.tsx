import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../utils/supabase";
import Header from "../Header";
import DeckBoard from "./DeckBoard";
import { ColumnType, CardType } from "../../utils/databaseType";
import Column from "../../components/Column";
import { useColumnReorder } from "../hooks/useColumnReorder";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";

const DeckDashboard = () => {
  const { id } = useParams();
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<CardType[]>([]);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [newCardTitles, setNewCardTitles] = useState<{ [key: number]: string }>(
    {}
  );
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));
  const reorderColumns = useColumnReorder();

  const fetchDeck = async () => {
    const { data, error } = await supabase
      .from("DeckColumns")
      .select("*")
      .eq("deckid", id)
      .order("posicion", { ascending: true });

    if (!error && data) setColumns(data);
  };

  const fetchCards = async () => {
    if (columns.length === 0) return;

    const { data, error } = await supabase
      .from("DeckCards")
      .select("*")
      .in(
        "DeckColumn",
        columns.map((c) => c.id)
      );

    if (!error && data) setCards(data);
  };

  const fetchWallpaper = async () => {
    const { data: deck } = await supabase
      .from("Deck")
      .select("wallpaper")
      .eq("id", id)
      .single();

    if (!deck) return;

    const { data: wallpaper } = await supabase
      .from("Wallpaper")
      .select("wallpaperurl")
      .eq("id", deck.wallpaper)
      .single();

    if (wallpaper) setWallpaperUrl(wallpaper.wallpaperurl);
  };

  const handleAddCard = async (columnId: number) => {
    const title = newCardTitles[columnId]?.trim();
    if (!title) return;

    const { data, error } = await supabase
      .from("DeckCards")
      .insert({
        deck_id: Number(id),
        DeckColumn: columnId,
        Title: title,
      })
      .select()
      .single();

    if (!error && data) {
      setCards((prev) => [...prev, data]);
      setNewCardTitles((prev) => ({ ...prev, [columnId]: "" }));
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    const { data, error } = await supabase
      .from("DeckColumns")
      .insert({
        deckid: Number(id),
        nombre: newColumnTitle.trim(),
        posicion: columns.length,
      })
      .select()
      .single();

    if (!error && data) {
      setColumns((prev) => [...prev, data]);
      setNewColumnTitle("");
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm("¿Eliminar esta columna y todas sus tarjetas?")) return;

    const { error: cardsError } = await supabase
      .from("DeckCards")
      .delete()
      .eq("DeckColumn", columnId);

    if (cardsError) return console.error(cardsError);

    const { error: columnError } = await supabase
      .from("DeckColumns")
      .delete()
      .eq("id", columnId);

    if (!columnError) {
      setColumns((prev) => prev.filter((col) => col.id !== columnId));
      setCards((prev) => prev.filter((card) => card.DeckColumn !== columnId));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("card-") && overId.startsWith("column-")) {
      const cardId = Number(activeId.replace("card-", ""));
      const columnId = Number(overId.replace("column-", ""));
      const draggedCard = cards.find((c) => c.id === cardId);

      if (!draggedCard || draggedCard.DeckColumn === columnId) return;

      const updatedCard = { ...draggedCard, DeckColumn: columnId };
      setCards((prev) => prev.map((c) => (c.id === cardId ? updatedCard : c)));

      const { error } = await supabase
        .from("DeckCards")
        .update({ DeckColumn: columnId })
        .eq("id", cardId);

      if (error) console.error("Error actualizando tarjeta:", error.message);
      return;
    }

    if (activeId.startsWith("column-") && overId.startsWith("column-")) {
      const activeIndex = columns.findIndex(
        (col) => `column-${col.id}` === activeId
      );
      const overIndex = columns.findIndex(
        (col) => `column-${col.id}` === overId
      );

      if (activeIndex === -1 || overIndex === -1) return;

      const reordered = arrayMove([...columns], activeIndex, overIndex);

      try {
        await Promise.all(
          reordered.map((col, index) =>
            supabase
              .from("DeckColumns")
              .update({ posicion: -(index + 1) })
              .eq("id", col.id)
          )
        );

        await Promise.all(
          reordered.map((col, index) =>
            supabase
              .from("DeckColumns")
              .update({ posicion: index })
              .eq("id", col.id)
          )
        );

        setColumns(reordered);
      } catch (err) {
        console.error("❌ Error reordenando columnas:", err);
      }
    }
  };

  useEffect(() => {
    fetchDeck();
    fetchWallpaper();
  }, []);

  useEffect(() => {
    if (columns.length > 0) fetchCards();
  }, [columns]);

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
        inset: 0,
        zIndex: -1,
      }}
    >
      <div className="relative z-10">
        <Header />
        {id && <DeckBoard deckId={id} />}
        <div className="flex items-start justify-start p-6 overflow-x-auto min-h-screen">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columns.map((col) => `column-${col.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-row gap-6">
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    id={column.id}
                    title={column.nombre}
                    cards={cards.filter((c) => c.DeckColumn === column.id)}
                    newCardTitle={newCardTitles[column.id] || ""}
                    onInputChange={(val) =>
                      setNewCardTitles((prev) => ({
                        ...prev,
                        [column.id]: val,
                      }))
                    }
                    onAddCard={() => handleAddCard(column.id)}
                    onDelete={() => handleDeleteColumn(column.id)}
                  />
                ))}

                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="w-[300px] h-[600px] pt-4"
                >
                  <input
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddColumn();
                    }}
                    placeholder="+ Añadir nueva columna..."
                    className="w-full bg-gray-700 text-white px-4 py-2 translate-y-[-16px] rounded shadow placeholder-gray-400 border-none outline-none"
                  />
                </motion.div>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default DeckDashboard;
