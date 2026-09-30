"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

const links = [
  ["Home Chanda", "/admin/chanda"],
  ["Insights", "/admin/chanda/insights"],
  ["Receipts", "/admin/chanda/receipts"],
  ["Manage POCs", "/admin/chanda/pocs"],
  ["Historical donations", "/admin/chanda/manual-donations"],
  ["Website home", "/"],
];

export default function ChandaAdminNavigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeMenu = () => setOpen(false);
  const signOut = async () => {
    await Promise.all([
      fetch("/api/admin/chanda/logout", { method: "POST" }),
      fetch("/api/admin/logout", { method: "POST" }),
    ]);
    window.location.href = "/admin";
  };

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);
  return (
    <>
      <button
        className="chanda-admin-menu-button"
        type="button"
        aria-label={open ? "Close Chanda administration navigation" : "Open Chanda administration navigation"}
        aria-expanded={open}
        aria-controls="chanda-admin-mobile-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        <i /><i /><i />
      </button>
      <nav
        className="chanda-admin-desktop-nav"
        aria-label="Chanda administration"
      >
        {links.map(([label, href]) => (
          <a key={href} href={href} className={pathname === href ? "active" : ""}>
            {label}
          </a>
        ))}
        <button className="chanda-admin-signout" type="button" onClick={signOut}>Sign out</button>
      </nav>
      {open && typeof document !== "undefined" && createPortal(
        <>
          <button
            className="chanda-admin-nav-backdrop"
            type="button"
            aria-label="Close Chanda administration navigation"
            onClick={closeMenu}
          />
          <nav
            className="chanda-admin-mobile-nav open"
            id="chanda-admin-mobile-navigation"
            aria-label="Chanda administration mobile navigation"
          >
            <div className="chanda-admin-mobile-heading">
              <div>
                <span>GARBARAAS · CONFIDENTIAL</span>
                <b>Chanda admin</b>
              </div>
              <button
                type="button"
                aria-label="Close Chanda administration navigation"
                onClick={closeMenu}
              >
                ×
              </button>
            </div>
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className={pathname === href ? "active" : ""}
                onClick={closeMenu}
              >
                {label}
              </a>
            ))}
            <button className="chanda-admin-signout" type="button" onClick={signOut}>Sign out</button>
            <p className="chanda-admin-mobile-footer">IIT GUWAHATI · 2026</p>
          </nav>
        </>,
        document.body,
      )}
    </>
  );
}
