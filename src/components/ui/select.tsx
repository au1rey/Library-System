/***********************
 * Simple Select Component
 * Simplified version without Radix UI
 ***********************/
import React from "react";
import { ChevronDown } from "lucide-react";
import "../styles/select.css";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className="select-wrapper">
      <select className={`select ${className}`} {...props}>
        {children}
      </select>
      <ChevronDown className="select-arrow" />
    </div>
  );
};

interface SelectItemProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  children,
  ...props
}) => {
  return <option {...props}>{children}</option>;
};
