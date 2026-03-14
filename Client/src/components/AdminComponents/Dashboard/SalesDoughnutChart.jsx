import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const SalesDoughnutChart = ({ statusCounts = {} }) => {
  // Extraction des valeurs avec des valeurs par défaut
  const { upcoming = 0, ongoing = 0, completed = 0 } = statusCounts;

  const data = {
    labels: ["Upcoming", "Ongoing", "Completed"],
    datasets: [
      {
        label: "Formations Status",
        data: [upcoming, ongoing, completed],
        backgroundColor: [
          "rgba(255, 255, 255, 0.3)", // Upcoming - plus clair
          "rgba(255, 255, 255, 0.6)",  // Ongoing - moyen
          "#ffffff",                    // Completed - plein
        ],
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "50%",
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div className="DoughnutSales-container">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "250px",
        }}
      >
        <div style={{ flex: "0 0 60%", height: "100%", paddingLeft: "30px" }}>
          <Doughnut data={data} options={options} />
        </div>

        <div
          style={{
            flex: "0 0 40%",
            paddingLeft: "50px",
            color: "#ffffff",
            fontSize: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#ffffff",
                borderRadius: "2px",
              }}
            ></div>
            Completed: {completed}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: "2px",
              }}
            ></div>
            Ongoing: {ongoing}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: "2px",
              }}
            ></div>
            Upcoming: {upcoming}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDoughnutChart;