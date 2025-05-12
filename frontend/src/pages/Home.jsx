import React, { useContext, useState } from "react";
import withAuth from "../utils/WithAuth";
import "../App.css";
import { useNavigate } from "react-router-dom";
import RestoreIcon from "@mui/icons-material/Restore";
import IconButton from "@mui/material/IconButton";
import { TextField } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

function Home() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const {addHistory}=useContext(AuthContext)

  const JoinVideoCall = async () => {
    await addHistory(meetingCode);
    navigate(`/meet/${meetingCode}`);
  };

  return (
    <>
      <div className="navbar">
        <div className="NavLeftLanding">
          <h2>
            <span className="initials">F</span>ACE
            <span className="initials"> T</span>IME
          </h2>
        </div>
        <div
          className="NavRightLanding"
          style={{ display: "flex", alignItems: "center" }}
        >
          <div onClick={()=>(navigate("/history"))}
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "1.2rem",
            }}
          >
            <IconButton className="icon">
              <RestoreIcon />
            </IconButton>
            <p>History</p>
          </div>
          <button
            className="LogoutBtn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            style={{
              cursor:"pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2 style={{marginBottom:"2rem"}}>Connect with real people using real website</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField onChange={(e) => setMeetingCode(e.target.value)} id="outline" />
            <button onClick={JoinVideoCall} variant="contained"   > Join VideoCall</button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
            <img src="/videocall.svg" alt="videocall" />
        </div>
      </div>
    </>
  );
}

export default withAuth(Home);
