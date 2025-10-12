/***********************
 * Input Component
 * Plain CSS replacement for shadcn/ui Input
 ***********************/

import React from "react";
import "../styles/input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return <input className={`input ${className}`} {...props} />;
};
