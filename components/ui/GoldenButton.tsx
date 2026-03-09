"use client";

interface GoldenButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GoldenButton({
  children,
  onClick,
  disabled = false,
  className = "",
  size = "md",
}: GoldenButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} rounded-xl font-semibold tracking-wide
        transition-all duration-200 select-none
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"}
        ${className}
      `}
      style={{
        background: disabled
          ? "linear-gradient(135deg, #666 0%, #444 100%)"
          : "linear-gradient(135deg, #f5c842 0%, #d4a527 50%, #b8860b 100%)",
        color: disabled ? "#999" : "#0a0a0a",
        boxShadow: disabled
          ? "none"
          : "0 0 10px rgba(245, 200, 66, 0.2)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.target as HTMLElement).style.boxShadow =
            "0 0 25px rgba(245, 200, 66, 0.4), 0 0 50px rgba(245, 200, 66, 0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.target as HTMLElement).style.boxShadow =
            "0 0 10px rgba(245, 200, 66, 0.2)";
        }
      }}
    >
      {children}
    </button>
  );
}
