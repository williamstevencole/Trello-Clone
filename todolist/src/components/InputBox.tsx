import {
  FaEnvelope,
  FaLock,
  FaKey,
  FaUser,
  FaComment,
  FaImage,
} from "react-icons/fa";
import { InputBoxProps } from "../utils/InputBoxType";

const InputBox = ({
  title,
  placeholder,
  type,
  value,
  onChange,
  icon,
  height,
}: InputBoxProps) => {
  const getIcon = () => {
    switch (icon) {
      case "email":
        return <FaEnvelope className="text-white text-xl" />;
      case "password":
        return <FaLock className="text-white text-xl" />;
      case "key":
        return <FaKey className="text-white text-xl" />;
      case "user":
        return <FaUser className="text-white text-xl" />;
      case "title":
        return <FaComment className="text-white text-xl" />;
      case "description":
        return <FaComment className="text-white text-xl" />;
      case "image":
        return <FaImage className="text-white text-xl" />;
      default:
        return null;
    }
  };

  const heightClasses = {
    small: "h-12",
    medium: "h-20",
    large: "h-40",
  };

  return (
    <div className="relative mb-4">
      <h1 className="text-white text-2xl mb-4">{title}</h1>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          {getIcon()}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${heightClasses[height]} w-full pl-12 pr-4 rounded-lg bg-[#111111] text-white border-2 border-white`}
        />
      </div>
    </div>
  );
};

export default InputBox;
