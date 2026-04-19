import React from 'react'
import { Link } from 'wouter';

const Footer = () => {
  return (
      <footer className="bg-gray-950 py-10">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <span className="text-2xl">🐾</span> PawAdopt
          </div>
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} PawAdopt. Helping pets find their
            forever homes.
          </p>
          <div className="flex gap-5 text-sm text-gray-400">
            <Link href="/pets">
              <span className="hover:text-amber-400 transition-colors cursor-pointer">
                Browse Pets
              </span>
            </Link>
            <Link href="/login">
              <span className="hover:text-amber-400 transition-colors cursor-pointer">
                Login
              </span>
            </Link>
            <Link href="/register">
              <span className="hover:text-amber-400 transition-colors cursor-pointer">
                Register
              </span>
            </Link>
          </div>
        </div>
      </footer>
  );
}

export default Footer