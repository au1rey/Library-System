/***********************
 * Card Components
 ***********************/

import React from "react";
import "../styles/card.css";

// Base Card container
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`card ${className}`} {...props} />;

// Header
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`card-header ${className}`} {...props} />;

// Title
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = "",
  ...props
}) => <h4 className={`card-title ${className}`} {...props} />;

// Description
export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className = "", ...props }) => (
  <p className={`card-description ${className}`} {...props} />
);

// Action (for buttons or icons aligned right)
export const CardAction: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`card-action ${className}`} {...props} />;

// Content
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`card-content ${className}`} {...props} />;

// Footer
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => <div className={`card-footer ${className}`} {...props} />;
