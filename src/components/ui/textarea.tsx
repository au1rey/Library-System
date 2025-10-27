import * as React from "react";
import "../styles/textarea.css"; 

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={`ui-textarea ${className}`}
      {...props}
    />
  );
}
