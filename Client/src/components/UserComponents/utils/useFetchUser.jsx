import { useState, useEffect } from "react";
import axios from "axios";

export default function useFetchUser() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch user data");
      }

      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  return { data, loading, error };
}