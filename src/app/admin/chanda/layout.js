import ChandaAdminNavigation from "../../../components/ChandaAdminNavigation";

export default function ChandaAdminLayout({ children }) {
  return (
    <div className="chanda-admin-layout">
      <header className="chanda-admin-global-header">
        <a className="chanda-admin-global-brand" href="/admin/chanda">
          GarbaRaas <span>Chanda admin</span>
        </a>
        <ChandaAdminNavigation />
      </header>
      {children}
      <footer className="chanda-admin-global-footer">
        <div>
          <strong>GarbaRaas Chanda</strong>
          <span>Confidential administration</span>
        </div>
        <nav aria-label="Chanda administration footer">
          <a href="/admin/chanda">Home Chanda</a>
          <a href="/admin/chanda/insights">Insights</a>
          <a href="/admin/chanda/receipts">Receipts</a>
          <a href="/admin/chanda/pocs">Manage POCs</a>
          <a href="/admin/chanda/manual-donations">Historical donations</a>
          <a href="/">Website home</a>
        </nav>
      </footer>
    </div>
  );
}
