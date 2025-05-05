import React, { useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";
import axios from "axios";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const router = useNavigate();

  const [userdata, setUserData] = useState({});

  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name,
        username,
        password,
      });
      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (e) {
      console.log("Error => " + e);
      throw e;
    }
  };
  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username,
        password,
      });
      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        console.log(request.data);

        localStorage.setItem("user", JSON.stringify(request.data.user));
        setUserData(request.data.user);
        // router("/home")
        return request.data.message;
      }
    } catch (e) {
      console.log("Error  " + e);
      throw e;
    }
  };

  const data = {
    userdata,
    setUserData,
    handleRegister,
    handleLogin,
  };
  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
