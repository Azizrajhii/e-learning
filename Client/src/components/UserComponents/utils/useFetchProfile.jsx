import { useState, useEffect } from "react";
import axios from "axios";

export default function useFetchProfileData({Id}) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileData = async (Id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/profile/${Id}`);

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
    if (Id) {
      fetchProfileData(Id);
    } else {
      setLoading(false);
    }
  }, [Id]);

  return { data, loading, error };
}