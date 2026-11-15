import { ReactNode } from "react";
import { motion } from "framer-motion";

interface RetroButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function RetroButton({
  children,
  onClick,
  className = "",
  type = "button",
}: RetroButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 py-2 bg-retroPrimary text-retroBg font-display rounded shadow-md hover:shadow-lg transition ${className}`}
    >
      {children}
    </motion.button>
  );
}

