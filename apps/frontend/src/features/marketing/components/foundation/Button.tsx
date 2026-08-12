import React from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  to,
  href,
  onClick,
  className = "",
  style,
  type = "button",
  ariaLabel,
  disabled = false,
}) => {
  // Map variant class names from designSystem.css variables
  const getVariantClass = () => {
    switch (variant) {
      case "secondary":
        return "m-button-secondary";
      case "ghost":
        return "text-[#8b95a5] hover:text-[#E8EDF5] bg-transparent hover:bg-white/5 transition-all duration-150";
      case "danger":
        return "bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-900/30 transition-all duration-150";
      case "primary":
      default:
        return "m-button-primary";
    }
  };

  const baseClasses = `h-9.5 px-4 rounded-lg flex items-center justify-center text-xs font-bold tracking-wide transition-all select-none focus:outline-none focus:ring-2 focus:ring-[#6675FF]/40 ${getVariantClass()} ${className}`;

  if (to) {
    return (
      <Link
        to={disabled ? "#" : to}
        onClick={onClick as any}
        style={style}
        className={baseClasses}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        onClick={onClick as any}
        style={style}
        className={baseClasses}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      style={style}
      className={baseClasses}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default Button;
