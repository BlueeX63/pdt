"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint, LayoutDashboard, FileText, Moon, Sun, LogOut, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      // eslint-disable-next-line
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "New Registration", href: "/dashboard/register", icon: FileText },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`${styles.layout} ${!isSidebarOpen ? styles.layoutClosed : ""}`}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <PawPrint size={16} strokeWidth={2.5} />
          </div>
          <span className={styles.sidebarText}>PDT School</span>
          <button 
            className={styles.mobileCloseBtn} 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <button 
          className={styles.toggleBtn} 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              >
                <Icon size={18} />
                <span className={styles.sidebarText}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <span className={styles.date}>{currentDate}</span>
          </div>

          <div className={styles.topbarRight}>
            {mounted && (
              <button
                className={styles.iconButton}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <div className={styles.profile}>
              <button
                onClick={handleLogout}
                className={styles.iconButton}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}
