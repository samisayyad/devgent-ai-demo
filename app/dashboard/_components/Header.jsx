"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, Mic, Sparkles } from "lucide-react";

const Header = ({ logo }) => {
  const [isUserButtonLoaded, setUserButtonLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const SkeletonLoader = () => (
    <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
  );

  useEffect(() => {
    const timer = setTimeout(() => setUserButtonLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const path = usePathname();

  return (
    <div className="bg-secondary shadow-sm">
      <div className="w-[80%] m-auto flex gap-4 items-center justify-between py-3">
        <Link className="hidden md:block" href="/dashboard">
          <Image src={logo} width={80} height={80} alt="logo" />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-6 items-center">
          <Link href="/dashboard">
            <li
              className={`hover:text-black hover:font-bold transition-all cursor-pointer ${
                path === "/dashboard" ? "text-black font-bold" : ""
              }`}
            >
              Dashboard
            </li>
          </Link>
          
          <Link href="/dashboard/question">
            <li
              className={`hover:text-black hover:font-bold transition-all cursor-pointer ${
                path === "/dashboard/question" ? "text-black font-bold" : ""
              }`}
            >
              Questions
            </li>
          </Link>
          
          <Link href="/interview-prep">
            <li
              className={`hover:text-black hover:font-bold transition-all cursor-pointer ${
                path === "/interview-prep" ? "text-black font-bold" : ""
              }`}
            >
              Interview Prep
            </li>
          </Link>

          {/* AI Interview Button - UPDATED ROUTE */}
          <li>
            <Link href="/dashboard/ai-interview">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Video className="w-4 h-4 mr-1.5" />
                <Mic className="w-4 h-4 mr-1.5" />
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span className="hidden lg:inline">AI Interview</span>
                <span className="lg:hidden">AI</span>
              </Button>
            </Link>
          </li>

          <Link href="/dashboard/howit">
            <li
              className={`hover:text-black hover:font-bold transition-all cursor-pointer ${
                path === "/dashboard/howit" ? "text-black font-bold" : ""
              }`}
            >
              How it works?
            </li>
          </Link>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {/* User Controls */}
        <div className="flex gap-4 items-center">
          <ModeToggle />
          {isUserButtonLoaded ? <UserButton /> : <SkeletonLoader />}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden border-t">
          <div className="px-5 py-3">
            <ul className="space-y-3">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <li
                  className={`hover:text-black hover:font-bold transition-all cursor-pointer py-2 ${
                    path === "/dashboard" ? "text-black font-bold" : ""
                  }`}
                >
                  Dashboard
                </li>
              </Link>
              
              <Link href="/dashboard/question" onClick={() => setIsOpen(false)}>
                <li
                  className={`hover:text-black hover:font-bold transition-all cursor-pointer py-2 ${
                    path === "/dashboard/question" ? "text-black font-bold" : ""
                  }`}
                >
                  Questions
                </li>
              </Link>
              
              <Link href="/interview-prep" onClick={() => setIsOpen(false)}>
                <li
                  className={`hover:text-black hover:font-bold transition-all cursor-pointer py-2 ${
                    path === "/interview-prep" ? "text-black font-bold" : ""
                  }`}
                >
                  Interview Prep
                </li>
              </Link>

              {/* AI Interview Button for Mobile - UPDATED ROUTE */}
              <Link href="/dashboard/ai-interview" onClick={() => setIsOpen(false)}>
                <li className="py-2">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                    <Video className="w-4 h-4 mr-2" />
                    <Mic className="w-4 h-4 mr-2" />
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start AI Interview
                  </Button>
                </li>
              </Link>

              <Link href="/dashboard/howit" onClick={() => setIsOpen(false)}>
                <li
                  className={`hover:text-black hover:font-bold transition-all cursor-pointer py-2 ${
                    path === "/dashboard/howit" ? "text-black font-bold" : ""
                  }`}
                >
                  How it works?
                </li>
              </Link>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
