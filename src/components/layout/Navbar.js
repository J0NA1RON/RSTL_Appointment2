"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Define main pages where the navbar should be visible
  const mainPages = ["/metrology", "/microbiology", "/chemistry", "/shelf-life"];

  // Allow navbar on these metrology subpages
  const allowedMetrologySubpages = [
    '/metrology/appointment',
    '/metrology/manager-registration'
  ];

  // Check if the current path is a subpage (starts with but is not an exact match)
  const isSubpage =
    mainPages.some((page) => pathname.startsWith(page) && pathname !== page) &&
    !allowedMetrologySubpages.includes(pathname);

  // Hide navbar on subpages
  if (isSubpage) return null;

  // Function to check if link is active
  const isActive = (path) => (pathname === path ? "text-blue-600" : "text-gray-700");

  return (
    <nav className="main-navbar bg-white shadow-sm">
      <div className="max-w-6.7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Branding */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/dost-logo.png"
                alt="DOST Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div className="text-sm">
                <div>Department of Science and Technology V</div>
                <div className="text-gray-600">Regional Standard and Testing Laboratories</div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`${isActive("/")} hover:text-blue-500 px-3 py-2 text-sm font-medium`}>
              Home
            </Link>
            <Link href="/metrology" className={`${isActive("/metrology")} hover:text-blue-500 px-3 py-2 text-sm font-medium`}>
              Metrology
            </Link>
            <Link href="/microbiology" className={`${isActive("/microbiology")} hover:text-blue-500 px-3 py-2 text-sm font-medium`}>
              Microbiology
            </Link>
            <Link href="/chemistry" className={`${isActive("/chemistry")} hover:text-blue-500 px-3 py-2 text-sm font-medium`}>
              Chemical
            </Link>
            <Link
              href="/shelf-life"
              className={`${isActive('/shelf-life')} hover:text-blue-500 px-3 py-2 text-sm font-medium`}
            >
              Shelf Life
            </Link>
            <Link
              href="/research-consultation"
              className={`${isActive('/research-consultation')} hover:text-blue-500 px-3 py-2 text-sm font-medium`}
            >
              Research Consultancy
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 