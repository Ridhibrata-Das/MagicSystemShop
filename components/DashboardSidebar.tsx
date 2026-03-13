"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
       router.push("/login");
    }
  };

  const items: SidebarItem[] = [
    { 
      name: "RECOM", 
      href: "/dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) 
    },
    { 
      name: "VISION", 
      href: "/dashboard/aesthetic-search", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) 
    },
    { 
      name: "SEARCH", 
      href: "/search", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ) 
    },
    { 
      name: "LOGS", 
      href: "/history", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    },
    { 
      name: "STATUS", 
      href: "/profile", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ) 
    },
    { 
      name: "CONFIG", 
      href: "/settings", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) 
    },
  ];

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-system-bg border border-system-accent text-system-accent rounded-sm shadow-system-glow focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-system-bg border-r border-system-border/50 z-40 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full py-8 relative">
          {/* Collapse Toggle */}
          <button 
            onClick={onToggle}
            className="absolute -right-3 top-20 bg-system-bg border border-system-border rounded-full p-1 text-system-accent hover:text-white hover:border-system-accent transition-all z-50 hidden lg:block"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className={`px-6 mb-8 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
             <div className="text-xl font-orbitron font-black text-system-text uppercase tracking-widest text-nowrap">
                SYSTEM<span className="text-system-accent">_CMD</span>
             </div>
             <div className="h-0.5 w-12 bg-system-accent mt-1 shadow-system-glow"></div>
          </div>
          
          {isCollapsed && (
            <div className="flex justify-center mb-8">
               <div className="text-xl font-orbitron font-black text-system-accent animate-pulse">S</div>
            </div>
          )}

          <nav className="flex-grow space-y-2 px-3">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3 rounded-sm font-orbitron text-xs font-bold transition-all group ${
                    isActive 
                    ? 'bg-system-accent/20 border border-system-accent text-system-accent shadow-system-glow' 
                    : 'text-system-muted hover:text-system-accent hover:bg-white/5'
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="tracking-widest uppercase">{item.name}</span>}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-1 h-1 bg-system-accent rounded-full animate-pulse shadow-system-glow"></div>
                  )}
                </NextLink>
              );
            })}
          </nav>

          <div className={`px-6 py-4 border-t border-system-border/30 space-y-4 ${isCollapsed ? 'flex flex-col items-center px-0' : ''}`}>
             {!isCollapsed && (
               <div className="text-[10px] font-mono text-system-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-system-success rounded-full animate-ping"></div>
                  Link Stable
               </div>
             )}
             
             <button
               onClick={handleLogout}
               title={isCollapsed ? "Disconnect Entity" : ""}
               className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-2 rounded-sm border border-system-error/30 bg-system-error/5 text-system-error font-orbitron text-[10px] font-bold tracking-widest uppercase hover:bg-system-error hover:text-white transition-all group`}
             >
                <svg className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {!isCollapsed && <span>Disconnect Entity</span>}
             </button>
          </div>
        </div>
      </aside>
    </>
  );
}
