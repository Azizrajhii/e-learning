// DailySalesChart.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const DailySalesChart = ({ data }) => {
  // Transformer les données
  const labels = data.map((item) => item._id); // les dates
  const counts = data.map((item) => item.count); // les valeurs

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Formations",
        data: counts,
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#ffffff",
        pointRadius: 5,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
          drawBorder: false,
        },
        ticks: {
          color: "#ffffff",
          stepSize: 1,
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutCubic",
    },
  };

  return (
    <div className="DailySales-container">
      <div style={{ height: "250px", width: "100%" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};


export default DailySalesChart;
