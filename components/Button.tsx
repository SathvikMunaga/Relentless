import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyle = "font-mono font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-zinc-100 text-zinc-900 hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] focus:ring-zinc-100",
    danger: "bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 focus:ring-red-500",
    ghost: "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 focus:ring-zinc-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs uppercase tracking-wider",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};