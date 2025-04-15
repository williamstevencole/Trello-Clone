import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";

type Props = {
  id: number;
  title: string;
};

const CardDraggable = ({ id, title }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `card-${id}` });

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`text-white bg-gray-800 p-2 rounded shadow cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
    >
      {title}
    </motion.div>
  );
};

export default CardDraggable;
