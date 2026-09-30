"use client";

export default function PaginationControls({ page, totalPages, total, pageSize, onPageChange, label }) {
  if (total <= pageSize) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return <nav className="pagination" aria-label={`${label} pages`}>
    <p>{first}-{last} of {total}</p>
    <div>
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>Next</button>
    </div>
  </nav>;
}
