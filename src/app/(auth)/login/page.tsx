"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/api/auth/auth";
import { useUserContext } from "@/context/userContext"; // Import UserContext

const Page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refetchUser } = useUserContext(); // Use refetchUser from UserContext

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      // Call the login function to authenticate
      await loginUser({ email, password });
      
      // Refetch the user data to update the UserContext
      refetchUser();

      router.push("/"); // Redirect after successful login
    } catch (err) {
      const errorMessage = (err as Error).message || "Login failed";
      setError(errorMessage);
      setIsLoading(false);
    } finally {
      setIsLoading(true);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="card w-96 bg-base-100 shadow-xl mt-20 mb-20">
        <div className="card-body">
          <h2 className="card-title">Login Warehouse System</h2>
          <form onSubmit={handleLogin}>
            <div className="items-center mt-2">
              <label
                htmlFor="email"
                className="input input-bordered flex items-center gap-2 mb-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  id="email"
                  type="text"
                  className="grow"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label
                htmlFor="password"
                className="input input-bordered flex items-center gap-2 mb-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="grow"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2 p-1">{error}</p>
            )}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Remember me</span>
                <input type="checkbox" className="checkbox" />
              </label>
            </div>
            <div className="card-actions justify-end">
              <button
                type="submit"
                className={`btn text-white bg-gray-800 hover:bg-gray-900 w-full`}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
              <a className="label-text underline cursor-pointer">
                Forgot Your Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
