import React from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <link rel="preload" href="/call`.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/bg.svg" as="image" type="image/svg+xml" />
      </Helmet>

      <div className="LandingContainer">
        <nav>
          <div className="NavLeftLanding">
            <h2 onClick={() => navigate("/")}>
              <span className="initials">F</span>ACE
              <span className="initials"> T</span>IME
            </h2>
          </div>
        </nav>
        <main>
          <div className="LandingText">
            <Card sx={{ maxWidth: 500 }}>
              <CardMedia
                component="img"
                alt="green iguana"
                height="300"
                image="notfound.svg"
                style={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography
                  gutterBottom
                  variant="h4"
                  component="p"
                  style={{ textAlign: "center" }}
                >
                  Page Not Found
                </Typography>
              </CardContent>
              <CardActions style={{display:"flex",justifyContent:"center"}}>
                
                  
                  <Link
                    to={"/"}
                    style={{
                      textDecoration: "none",
                      textAlign:"center",
                      color: "white",
                      borderRadius:"15px",
                      paddingInline: "0.5rem",
                      backgroundColor:"rgb(255,4,4,0.9)",
                      outline:"none"
                    }}
                  >
                    Go Back
                  </Link>
                
              </CardActions>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default NotFound;
