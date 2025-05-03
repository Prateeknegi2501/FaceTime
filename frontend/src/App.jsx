import "./App.css";
import Landing from "./pages/Landing.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Authentication from "./pages/Authentication.jsx";
import { AuthProvider } from "./contexts/authContext.jsx";
import VideoMeet from "./pages/VideoMeet.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/:id" element={<VideoMeet />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
