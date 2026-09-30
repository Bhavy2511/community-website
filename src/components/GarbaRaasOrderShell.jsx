"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function GarbaRaasOrderShell({ children, product }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => setClientReady(true), []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/community/news/garbaraas-2026-order-background.webp"
        fetchPriority="high"
      />
      <div className={`garbaraas-order-route ${product}-order-route`}>
        <header className="garbaraas-order-header">
          <a
            className="garbaraas-order-brand"
            href="/garbaraas/2026"
            aria-label="GarbaRaas 2026 home"
          >
            <span className="garbaraas-order-logo-crop">
              <Image
                src="/community/garba-raas-2025/garba-raas-logo.png"
                alt="GarbaRaas"
                width={1611}
                height={449}
                priority
              />
            </span>
            <span>
              GarbaRaas <small>2026</small>
            </span>
          </a>
          {product === "chanda" && (
            <div className="garbaraas-order-context" id="chanda-header-context" aria-label="Current workspace">
              <span>GarbaRaas 2026</span>
              <strong>Chanda collection</strong>
            </div>
          )}
          <button
            className="garbaraas-order-menu-button"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="garbaraas-order-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <i />
            <i />
            <i />
          </button>
          <nav className="garbaraas-order-nav garbaraas-order-desktop-nav" aria-label="GarbaRaas order navigation">
            <a href="/" onClick={() => setMenuOpen(false)}>
              Community home <span aria-hidden="true">→</span>
            </a>
            <a href="/garbaraas/2026" onClick={() => setMenuOpen(false)}>
              GarbaRaas 2026 <span aria-hidden="true">→</span>
            </a>
          </nav>
          {product === "chanda" && (
            <div
              className="garbaraas-order-session"
              id="chanda-header-session"
            />
          )}
        </header>
        {clientReady && createPortal(
          <>
            {menuOpen && <button
              className="garbaraas-order-nav-backdrop"
              type="button"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            />}
            <nav className={`garbaraas-order-mobile-nav${menuOpen ? " open" : ""}`} id="garbaraas-order-navigation" aria-label="GarbaRaas order navigation">
              <div className="garbaraas-order-mobile-nav-heading">
                <span>Navigation</span>
                <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>×</button>
              </div>
              <a href="/" onClick={() => setMenuOpen(false)}>
                Community home <span aria-hidden="true">→</span>
              </a>
              <a href="/garbaraas/2026" onClick={() => setMenuOpen(false)}>
                GarbaRaas 2026 <span aria-hidden="true">→</span>
              </a>
            {product === "chanda" && (
              <span className="garbaraas-order-current-page" aria-current="page">
                Chanda collection
              </span>
            )}
            {product === "chanda" && (
              <div
                className="garbaraas-order-mobile-session"
                id="chanda-mobile-nav-session"
              />
            )}
            </nav>
          </>,
          document.body,
        )}
        {children}
        <footer className="garbaraas-order-footer">
          <a
            className="garbaraas-order-brand"
            href="/garbaraas/2026"
            aria-label="GarbaRaas 2026 home"
          >
            <span className="garbaraas-order-logo-crop">
              <Image
                src="/community/garba-raas-2025/garba-raas-logo.png"
                alt="GarbaRaas"
                width={1611}
                height={449}
                loading="eager"
              />
            </span>
            <span>
              GarbaRaas <small>2026</small>
            </span>
          </a>
          <nav aria-label="GarbaRaas order navigation">
            <a href="/">Community home</a>
            <a href="/garbaraas/2026">GarbaRaas 2026</a>
          </nav>
          <span>© 2026</span>
        </footer>
      </div>
    </>
  );
}
