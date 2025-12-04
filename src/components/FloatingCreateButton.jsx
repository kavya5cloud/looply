export default function FloatingCreateButton({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="fixed bottom-20 right-6 bg-[#0F1629] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-3xl cursor-pointer"
    >
      +
    </div>
  );
}
