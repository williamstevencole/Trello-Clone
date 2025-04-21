import { FaGoogle } from "react-icons/fa";

type OAuthButtonProps = {
  provider: "google";
  onClick: () => void;
};

const providerStyles = {
  google: {
    label: "Continuar con Google",
    icon: <FaGoogle className="mr-2" />,
    bg: "bg-white text-black hover:bg-gray-200",
  },
};

const OAuthButton = ({ provider, onClick }: OAuthButtonProps) => {
  const style = providerStyles[provider];

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded ${style.bg}`}
    >
      {style.icon}
      {style.label}
    </button>
  );
};

export default OAuthButton;
