import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import AdminDashboard from "./Admin/AdminDashboard.tsx";
import "./App.css";
import LandingPage from "./LandingPage/main";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  return (
    <div className="App">
      {currentPath === "/admin" ? (
        <AdminDashboard />
      ) : (
        <LandingPage onAdminClick={() => navigateTo("/admin")} />
      )}
    </div>
  );
}

export default App;
