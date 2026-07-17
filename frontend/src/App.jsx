import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";
import Search from "./pages/Search";

function App() {

  const [chatSessions,setChatSessions]=useState([]);
  const [activeChat,setActiveChat]=useState(null);

  useEffect(()=>{
    const saved = localStorage.getItem("chat_sessions");

    if(saved){
      const parsed = JSON.parse(saved);
      setChatSessions(parsed);

      if(parsed.length){
        setActiveChat(parsed[0].id);
      }
    }
  },[]);

  useEffect(()=>{
    localStorage.setItem(
      "chat_sessions",
      JSON.stringify(chatSessions)
    )
  },[chatSessions]);

  return (
    <Routes>

      <Route
        path="/"
        element={
          <Layout
            chatSessions={chatSessions}
            setChatSessions={setChatSessions}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
          />
        }
      >

        <Route index element={<Dashboard />} />

        <Route path="upload" element={<Upload />} />

        <Route path="documents" element={<Documents />} />

        <Route
          path="search"
          element={
            <Search
              chatSessions={chatSessions}
              setChatSessions={setChatSessions}
              activeChat={activeChat}
            />
          }
        />

      </Route>

    </Routes>
  );
}

export default App;