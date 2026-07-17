export default function Button({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`bg-accent-500 text-paper-200 px-4 py-2 rounded-full hover:bg-accent-600 active:scale-[0.98] transition ${className}`}
    >
      {children}
    </button>
  );
}