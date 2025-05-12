import "./App.css";
import Landing from "./pages/Landing.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Authentication from "./pages/Authentication.jsx";
import VideoMeet from "./pages/VideoMeet.jsx";
import Home from "./pages/Home.jsx";
import History from "./pages/History.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/home" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/meet/:id" element={<VideoMeet />} />
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
