"use client";

import React, { useState } from "react";
import { Upload, Menu, X, Layers, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

interface NavbarProps {
  onUploadClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onUploadClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-white border-b border-zinc-100 font-sans text-zinc-900">
      <div className="px-6">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer no-underline text-zinc-900">
            <Layers className="w-5 h-5 text-zinc-900" strokeWidth={1.8} />
            <span className="text-xs font-bold tracking-widest uppercase">
              Docsy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 border border-zinc-200/50 rounded-full text-xs text-zinc-600 font-medium">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-zinc-200 text-zinc-700 rounded-md transition-all duration-150 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-md transition-opacity duration-150 hover:opacity-85 no-underline"
              >
                Sign In
              </Link>
            )}
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-6 py-4 space-y-3">
          {user ? (
            <>
              <div className="text-xs text-zinc-500 py-1 font-semibold">
                Logged in as: {user.email}
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border border-zinc-200 text-zinc-700 rounded-md hover:bg-zinc-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-md no-underline"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
