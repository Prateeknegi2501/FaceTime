import React, { useContext, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/authContext";
import { Snackbar } from "@mui/material";

export default function Authentication() {
  const [username, setUserName] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [message, setMessage] = useState("");

  const [formState, setFromState] = useState(0);
  const [open, setOpen] = useState(false);
  const { handleRegister, handleLogin } = useContext(AuthContext);

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleRegister(name, username, password);
        console.log(result);
        setMessage(result);
        setOpen(true);
        setFromState(1);
        setPassword("");
        setUserName("");
        setName("");
        setError("");

      }
      if (formState === 1) {
        let result = await handleLogin(username, password);
        console.log(result);
        setMessage(result);
        setOpen(true);
        setPassword("");
        setUserName("");
        setName("");
        setError("");
      }
    } catch (error) {
      let message = error?.response?.data?.message;
      setError(message);
      setPassword("");
      setUserName("");
      setName("");
    }
  };

  const defaultTheme = createTheme({
    palette: {
      primary: {
        main: "rgb(228, 10, 10)",
      },
    },
  });
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          backgroundImage:
            'url("https://images.pexels.com/photos/6414714/pexels-photo-6414714.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CssBaseline />
        <Paper
          elevation={6}
          sx={{
            p: 4,
            maxWidth: 400,
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.26)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, backgroundColor: "rgb(228, 10, 10)" }}>
              <LockOutlinedIcon />
            </Avatar>

            <div>
              <Button
                variant={formState === 0 ? "contained" : ""}
                onClick={() => {
                  setFromState(0);
                }}
              >
                Sign Up
              </Button>
              <Button
                variant={formState === 1 ? "contained" : ""}
                onClick={() => {
                  setFromState(1);
                }}
              >
                Login
              </Button>
            </div>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 0 ? (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <></>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <p style={{ color: "red", fontSize: "0.8rem" }}>{error}</p>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Sign Up" : " Login "}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </ThemeProvider>
  );
}
