import { useState, useEffect } from "react";
import axios from "axios";

export default function useFetchTrainer(trainerID) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrainerData = async (trainerID) => {
    try {
      const response = await axios.get("http://localhost:5000/api/getTrainerByID", {
        params: { trainerID },
      });

      if (response.status !== 200) {
        throw new Error("Failed to fetch Trainer data");
      }

      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Trainer data:", error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trainerID) {
      fetchTrainerData(trainerID);
    } else {
      setLoading(false);
    }
  }, [trainerID]);

  return { data, loading, error };
}
