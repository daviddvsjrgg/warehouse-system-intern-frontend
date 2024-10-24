"use client"

import Navbar from "@/components/Navbar";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    // Get the current URL path after the domain (window.location.pathname)
    const currentPath = window.location.pathname;

    // Store the current path in localStorage
    localStorage.setItem('onUrl', currentPath);
  }, []); // Empty dependency array to run this effect only once when the component mounts
  return (
    <div>
      <Navbar />
    </div>
  );
};

export default Home;
