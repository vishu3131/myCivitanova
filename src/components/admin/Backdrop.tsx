import React from "react";
import { useSidebar } from "./SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 lg:hidden ${
        isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={toggleMobileSidebar}
    ></div>
  );
};

export default Backdrop;
