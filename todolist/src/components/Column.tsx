import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import CardDraggable from "./CardDraggable";

type Props = {
  id: number;
  title: string;
  cards: { id: number; Title: string }[];
  newCardTitle: string;
  onInputChange: (val: string) => void;
  onAddCard: () => void;
  onDelete: () => void;
};

const Column = ({
  id,
  title,
  cards,
  newCardTitle,
  onInputChange,
  onAddCard,
  onDelete,
}: Props) => {
  const { setNodeRef: setDropRef } = useDroppable({ id: `column-${id}` });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `column-${id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      layout
      ref={(node) => {
        setSortableRef(node);
        setDropRef(node);
      }}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="w-[300px] min-h-[600px] bg-[#1a1a1a] border border-white rounded-lg p-4 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-white text-xl font-bold cursor-move"
          {...attributes}
          {...listeners}
        >
          {title}
        </h2>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 p-1 rounded"
        >
          🗑
        </button>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {cards.map((card) => (
          <CardDraggable key={card.id} id={card.id} title={card.Title} />
        ))}

        <motion.div
          layout
          className="text-white bg-gray-700 p-2 rounded shadow"
        >
          <input
            value={newCardTitle}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAddCard()}
            placeholder="+ Añadir nueva tarjeta..."
            className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Column;
