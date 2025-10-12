/***********************
 * Button Component
 ***********************/

import React from "react";
import "../styles/button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}) => {
  const classes = `button ${variant} ${size} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
