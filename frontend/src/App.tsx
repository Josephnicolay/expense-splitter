import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import GroupsPage from "./pages/GroupsPage";
import GroupPage from "./pages/GroupPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<GroupsPage />} />
          <Route path="groups/:id" element={<GroupPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
