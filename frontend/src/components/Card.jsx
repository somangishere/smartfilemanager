export default function Card({ children, className = "" }) {
  return (
    <div className={`glass-soft p-6 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}