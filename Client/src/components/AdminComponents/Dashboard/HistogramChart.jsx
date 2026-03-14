// HistogramChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const HistogramChart = ({ data }) => {
  // data = { "2025-05-25": 12, "2025-05-26": 20, ... }

  // Trier les dates par ordre croissant
  const labels = Object.keys(data || {}).sort();

  // Extraire les valeurs correspondant aux dates triées
  const counts = labels.map((date) => data[date]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Website Views",
        data: counts,
        backgroundColor: "#3b82f6", // bleu sympa, pas de gradient CSS ici
        barThickness: 12,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#64748b", // gris clair
          font: { size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#cbd5e1",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          stepSize: 10,
          font: { size: 12 },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutCubic",
    },
    plugins: {
      legend: { display: false },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="Histogram-container" style={{ height: "250px", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default HistogramChart;
