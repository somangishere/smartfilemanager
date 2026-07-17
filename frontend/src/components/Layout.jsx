import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout(props) {

  const location = useLocation();

  return (
    <div className="flex h-screen bg-paper gap-4 p-4">

      <Sidebar {...props} />

      <div className="flex-1 flex flex-col gap-4 min-w-0">

        <Topbar />

        <motion.main
          key={location.pathname}
          initial={{ opacity:0, y:10 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-10 }}
          transition={{ duration:0.25 }}
          className="glass rounded-3xl p-8 flex-1 overflow-y-auto"
        >

          <Outlet />

        </motion.main>

      </div>

    </div>
  );
}