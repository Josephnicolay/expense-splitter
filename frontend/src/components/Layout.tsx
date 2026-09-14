import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title">
          WeSplit
        </Link>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
