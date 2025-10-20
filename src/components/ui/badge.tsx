/***********************
 * Badge Component
 ***********************/
import React from "react";
import "../styles/badge.css";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className = "",
  children,
  ...props
}) => {
  const classes = `badge ${variant} ${className}`;

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};
