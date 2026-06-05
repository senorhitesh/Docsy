"use client";
import React, { useState } from "react";
import { Upload, Menu, X, Layers } from "lucide-react";

interface NavbarProps {
  onUploadClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onUploadClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-b border-zinc-100 font-sans text-zinc-900">
      <div className="px-6">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <Layers className="w-5 h-5 text-zinc-900" strokeWidth={1.8} />
            <span className="text-xs font-bold tracking-widest uppercase">
              Docsy
            </span>
          </div>

          {/* Desktop button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onUploadClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium tracking-wide bg-zinc-900 text-white rounded-md transition-opacity duration-150 hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Document
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-zinc-400 hover:text-zinc-900 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
