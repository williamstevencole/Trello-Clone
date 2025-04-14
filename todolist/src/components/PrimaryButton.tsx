interface PrimaryButtonProps {
  title: string;
  onClick: () => void;
}

const PrimaryButton = ({ title, onClick }: PrimaryButtonProps) => {
  return (
    <button
      className="relative overflow-hidden bg-blue-500 w-1/2 text-white p-2 rounded-md group"
      onClick={onClick}
    >
      <span className="relative z-10">{title}</span>
      <div className="absolute left-1/2 top-0 w-0 h-full bg-white opacity-10 transition-all duration-500 ease-out group-hover:w-full group-hover:left-0"></div>
    </button>
  );
};

export default PrimaryButton;
