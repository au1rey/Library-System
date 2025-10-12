/***********************
 * Label Component
 ***********************/

import React from "react";
import "../styles/label.css";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label: React.FC<LabelProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <label className={`label ${className}`} {...props}>
      {children}
    </label>
  );
};
