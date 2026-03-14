import React, { useEffect, useState } from "react";
import "./Dashboard.scss";
import "./histogramContainer.scss";
import { IoStatsChart } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { FaBookBookmark } from "react-icons/fa6";
import { GrCertificate } from "react-icons/gr";
import HistogramChart from "./HistogramChart";
import { MdOutlineWatchLater } from "react-icons/md";
import DailySalesChart from "./DailySalesChart";
import SalesDoughnutChart from "./SalesDoughnutChart";
import DashboardFormation from "./DashboardFormation";

const DashboardGraph = ({ Graph, title, subtitle, lastUpdate }) => (
  <div className="Dashboard-stat-Graphe-container">
    <div className="Dashboard-stat-Graphe">
      <Graph />
    </div>
    <div className="Dashboard-stat-Graphe-infos">
      <div className="Dashboard-stat-Graphe-identity">
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      <div className="Dashboard-stat-Graphe-line"></div>
      <div className="Dashboard-stat-Graphe-update">
        <span>
          <MdOutlineWatchLater /> {lastUpdate}
        </span>
      </div>
    </div>
  </div>
);

const DashboardCard = ({ icon: Icon, title, nbr, color }) => (
  <div className="Dashboard-card">
    <div
      className="Dashboard-card-icon-container"
      style={{ backgroundColor: color }}
    >
      <Icon size={35} />
    </div>
    <div className="Dashboard-card-content-container">
      <div className="Dashboard-card-content-container-header">
        <span>{title}</span>
        <h3>{nbr}</h3>
      </div>
      
    </div>
  </div>
);

function Dashboard() {
  const [visitHistory, setVisitHistory] = useState({});
  const [todaysUsers, setTodaysUsers] = useState(0);
  const [formationCounts, setFormationCounts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    upcoming: 0,
    ongoing: 0,
    completed: 0
  });

  const getTotalVisits = (obj) =>
    Object.values(obj).reduce((sum, v) => sum + v, 0);

  useEffect(() => {
    /* Visites */
    fetch("http://localhost:5000/api/visit-count")
      .then((r) => r.json())
      .then(setVisitHistory)
      .catch((e) => {
        console.error("Failed to fetch visit count:", e);
        setVisitHistory({});
      });

    /* Utilisateurs créés aujourd'hui */
    fetch("http://localhost:5000/api/user/user-count-by-date")
      .then((r) => r.json())
      .then(({ success, data }) => {
        if (!success) return;
        const today = new Date().toISOString().slice(0, 10);
        const todayEntry = data.find((d) => d._id === today);
        setTodaysUsers(todayEntry ? todayEntry.count : 0);
      })
      .catch((e) => {
        console.error("Failed to fetch user count:", e);
        setTodaysUsers(0);
      });

    /* Total formations */
    fetch("http://localhost:5000/api/formations/formation-count-by-date")
      .then((r) => r.json())
      .then(({ success, data }) => {
        if (!success) return;
        setFormationCounts(data);
        console.log(data);
      })
      .catch((e) => {
        console.error("Failed to fetch formation counts:", e);
        setFormationCounts([]);
      });

    /* Status counts formations */
    fetch("http://localhost:5000/api/formations/status-counts")
      .then((r) => r.json())
      .then(({ success, data }) => {
        if (success) {
          setStatusCounts(data);
          console.log(data);
        }
      })
      .catch((e) => {
        console.error("Failed to fetch formation status counts:", e);
        setStatusCounts({
          upcoming: 0,
          ongoing: 0,
          completed: 0
        });
      });
  }, []);

  // Somme totale des formations
  const totalFormations = formationCounts.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div className="Dashboard-container">
      <div className="Dashboard-header">
        <DashboardCard
          icon={IoStatsChart}
          title="Website Views"
          nbr={getTotalVisits(visitHistory)}
          color="#e02a6a"
        />
        <DashboardCard
          icon={FaUsers}
          title="Today's Users"
          nbr={todaysUsers}
          color="#3690ed"
        />
        <DashboardCard
          icon={FaBookBookmark}
          title="Total's Formations"
          nbr={totalFormations}
          color="#59b15d"
        />
        <DashboardCard
          icon={GrCertificate}
          title="Certificates Issued"
          nbr={150}
          color="rgb(251, 140, 0)"
        />
      </div>

      <div className="Dashboard-stats">
        <DashboardGraph
          Graph={() => <HistogramChart data={visitHistory} />}
          title="Website Views per Day"
          subtitle="Daily visits overview"
        />
        <DashboardGraph
          Graph={() => <DailySalesChart data={formationCounts} />}
          title="Users Created per Day"
          subtitle="Daily new user registrations"
        />
        <DashboardGraph
          Graph={() => <SalesDoughnutChart statusCounts={statusCounts} />}
          title="Formation Status"
          subtitle="Upcoming, Ongoing, and Completed"
        />
      </div>

      <DashboardFormation />
    </div>
  );
}

export default Dashboard;
