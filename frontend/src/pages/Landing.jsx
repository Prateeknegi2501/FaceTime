import React from "react";
import "../App.css";
import { Link, Links } from "react-router-dom";
import { Helmet } from "react-helmet";

export default function Landing() {
  return (
    <>
      <Helmet>
        <link rel="preload" href="/call`.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/bg.svg" as="image" type="image/svg+xml" />
      </Helmet>

      <div className="LandingContainer">
        <nav>
          <div className="NavLeftLanding">
            <h2>
              <span className="initials">F</span>ACE
              <span className="initials"> T</span>IME
            </h2>
          </div>
          <div className="NavRightLanding">
            <h3>Join As Guest</h3>
            <h3>Register</h3>
            <div role="button" className="loginBtn">
              Log In
            </div>
          </div>
        </nav>
        <main>
          <div className="LandingText">
            <div className="one">
              <h2>
                <span className="sWord">Connect</span> Face-to-Face, Instantly.
              </h2>
              <p>
                Enjoy with <span className="sWords">Friend </span>,
                <span className="sWords"> Family </span> and with your
                <span className="sWords"> Loved Once</span>
              </p>
            </div>
            <div role="button">
              <Link to={"/auth"}>Get Started</Link>
            </div>
          </div>
          <div>
            <img className="LandingImg" src="/call.svg" alt="videocall Image" />
          </div>
        </main>
      </div>
    </>
  );
}
