"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import PaginationControls from "./PaginationControls";

const pageSize = 12;

export default function ArchiveGallery({ items }) {
  const [page, setPage] = useState(1);
  const [activeItem, setActiveItem] = useState(null);
  const totalPages = Math.ceil(items.length / pageSize);
  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page]);

  return <>
    <div className="archive-grid">
      {pageItems.map((item) => (
        <button className="archive-tile" key={item.id} type="button" onClick={() => setActiveItem(item)} aria-label={`View ${item.event} ${item.year} photograph full screen`}>
          <figure>
            <Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 100vw, 33vw" />
            <figcaption><span>{item.event}</span><b>{item.year}</b></figcaption>
          </figure>
        </button>
      ))}
    </div>
    <PaginationControls page={page} totalPages={totalPages} total={items.length} pageSize={pageSize} onPageChange={setPage} label="Memory archive" />
    {activeItem && createPortal(
      <div className="archive-lightbox" role="dialog" aria-modal="true" aria-label={`${activeItem.event} ${activeItem.year} photograph`}>
        <button className="archive-lightbox-backdrop" type="button" onClick={() => setActiveItem(null)} aria-label="Close photograph viewer" />
        <figure>
          <Image src={activeItem.image} alt={activeItem.alt} fill sizes="100vw" />
          <figcaption><span>{activeItem.event}</span><b>{activeItem.year}</b></figcaption>
        </figure>
        <button className="archive-lightbox-close" type="button" onClick={() => setActiveItem(null)} aria-label="Close photograph viewer">×</button>
      </div>
    , document.body)}
  </>;
}
