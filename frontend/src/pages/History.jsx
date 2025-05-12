import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Snackbar } from "@mui/material";
import Card from "@mui/material/Card";

import HomeIcon from "@mui/icons-material/Home";

import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { AuthContext } from "../contexts/authContext";

function History() {
  const { getHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistory();
        console.log(history);
        setMeetings(Array.isArray(history.meetings) ? history.meetings : []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div>

        
      <IconButton onClick={() => navigate("/home")}>
        <HomeIcon style={{fontSize:"3rem", color:"red"}}/>
      </IconButton>
      <div className="HistoryContainer">
        {meetings.length === 0 ? (
          <Typography>No meetings found.</Typography>
        ) : (
          meetings.map((meet) => (
            <Card variant="outlined" key={meet._id}>
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  Meeting ID: {meet._id}
                </Typography>
                <Typography variant="h5" component="div">
                  {meet.meetingCode || "Untitled Meeting"}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Date:{" "}
                  {meet.date ? new Date(meet.date).toLocaleString() : "No date"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/${meet._id}`)}
                >
                  Rejoin
                </Button>
              </CardActions>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default History;
