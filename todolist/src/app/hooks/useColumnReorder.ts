import supabase from "../../utils/supabase";
import { ColumnType } from "../../utils/databaseType";

export const useColumnReorder = () => {
  const reorderColumns = async (newOrder: ColumnType[]) => {
    try {
      await Promise.all(
        newOrder.map((col) =>
          supabase.from("DeckColumns").update({ posicion: -1 }).eq("id", col.id)
        )
      );

      await Promise.all(
        newOrder.map((col, index) =>
          supabase
            .from("DeckColumns")
            .update({ posicion: index })
            .eq("id", col.id)
        )
      );
    } catch (error) {
      console.error("Error reordenando columnas:", error);
    }
  };

  return reorderColumns;
};
