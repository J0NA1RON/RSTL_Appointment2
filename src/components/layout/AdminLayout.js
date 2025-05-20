"use client";

import React from 'react';

export default function AdminLayout({ children }) {
  return (
    <>
      <style jsx global>{`
        /* Hide only the main navbar */
        .main-navbar {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
} 