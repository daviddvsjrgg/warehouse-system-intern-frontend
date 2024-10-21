"use client"

import Navbar from '@/components/Navbar'
import React, { useEffect } from 'react'

const Page = () => {
  useEffect(() => {
    // Get the current URL path after the domain (window.location.pathname)
    const currentPath = window.location.pathname;

    // Store the current path in localStorage
    localStorage.setItem('onUrl', currentPath);
  }, []); // Empty dependency array to run this effect only once when the component mounts
  return (
    <div>
      <Navbar />
      <h1>Report</h1>
    </div>
  )
}

export default Page