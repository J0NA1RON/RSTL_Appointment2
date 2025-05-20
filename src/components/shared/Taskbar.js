import React from 'react';
import Link from 'next/link';

export default function Taskbar({ actions = [], children }) {
  return (
    <div className="w-full bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 shadow-sm mb-6">
      {actions.length > 0 ? (
        actions.map((action, idx) => (
          action.href ? (
            <Link key={idx} href={action.href} className="text-sm font-medium text-blue-700 hover:underline px-3 py-1 rounded hover:bg-blue-50 transition-colors">
              {action.label}
            </Link>
          ) : (
            <button key={idx} onClick={action.onClick} className="text-sm font-medium text-blue-700 px-3 py-1 rounded hover:bg-blue-50 transition-colors">
              {action.label}
            </button>
          )
        ))
      ) : (
        children
      )}
    </div>
  );
} 