import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animate?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  animate = true,
  ...props
}) => {
  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;

  if (!animate) {
    return (
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", className)}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};
