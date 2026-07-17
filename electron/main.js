const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  // 🔥 LOAD FRONTEND
  win.loadFile(
    path.join(__dirname, "../frontend/dist/index.html")
  );

  // 🔥 WAJIB: DEBUG REACT ERROR
  win.webContents.openDevTools();

  // 🔥 OPTIONAL: LOG LOAD ERROR
  win.webContents.on("did-fail-load", (e, code, desc) => {
    console.error("❌ Failed to load frontend:", code, desc);
  });
}

app.whenReady().then(() => {
  const pythonPath = path.join(
    __dirname,
    "../backend/venv/bin/python"
  );

  const backendPath = path.join(__dirname, "../backend");

  console.log("🚀 Starting backend...");

  backendProcess = spawn(
    pythonPath,
    [
      "-m",
      "uvicorn",
      "app.main:app",
      "--host",
      "127.0.0.1",
      "--port",
      "8000"
    ],
    {
      cwd: backendPath,
      env: {
        ...process.env,
      },
    }
  );

  backendProcess.stdout.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.on("close", (code) => {
    console.log(`Backend exited with code ${code}`);
  });

  // 🔥 WAIT BACKEND READY
  const http = require("http");

  const waitForBackend = () => {
    http.get("http://127.0.0.1:8000/docs", (res) => {
      console.log("✅ Backend ready, opening app...");
      createWindow();
    }).on("error", () => {
      console.log("⏳ Waiting backend...");
      setTimeout(waitForBackend, 1000);
    });
  };

  waitForBackend();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});