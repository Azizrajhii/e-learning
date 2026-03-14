import React from "react";
import "./DashboardFormation.scss";
import pdp from "./../images/pdp.jpg";

const projects = [
  {
    id: 1,
    company: "Material UI XD Version",
    logo: pdp,
    members: [
      { avatar: pdp, firstName: "John", lastName: "Doe" },
      { avatar: pdp, firstName: "Jane", lastName: "Smith" },
    ],
    Instructor: "Bel Hsan Mohammed",
    completion: 60,
  },
  {
    id: 2,
    company: "Add Progress Track",
    logo: pdp,
    members: [
      { avatar: pdp, firstName: "Alice", lastName: "Johnson" },
      { avatar: pdp, firstName: "Bob", lastName: "Brown" },
    ],
    Instructor: "Monji Slim",
    completion: 20,
  },
  {
    id: 3,
    company: "Fix Platform Errors",
    logo: pdp,
    members: [
      { avatar: pdp, firstName: "Charlie", lastName: "Davis" },
      { avatar: pdp, firstName: "Eve", lastName: "Miller" },
    ],
    Instructor: "Ben Said Oumaima",
    completion: 100,
  },
  {
    id: 4,
    company: "Launch our Mobile App",
    logo: pdp,
    members: [
      { avatar: pdp, firstName: "Charlie", lastName: "Davis" },
      { avatar: pdp, firstName: "Eve", lastName: "Miller" },
    ],
    Instructor: "Rajhi Aziz",
    completion: 100,
  },
  {
    id: 5,
    company: "Add the New Pricing Page",
    logo: pdp,
    members: [
      { avatar: pdp, firstName: "Charlie", lastName: "Davis" },
      { avatar: pdp, firstName: "Eve", lastName: "Miller" },
      { avatar: pdp, firstName: "Bob", lastName: "Brown" },
    ],
    Instructor: "Marzouk Houssem Eddine",
    completion: 30,
  },
  {
    id: 6,
    company: "Redesign New Online Shop",
    logo: pdp,
    members: [
      { avatar: pdp, firstName: "Charlie", lastName: "Davis" },
      { avatar: pdp, firstName: "Eve", lastName: "Miller" },
    ],
    Instructor: "Maryoum",
    completion: 40,
  },
];

const DashboardFormation = () => {
  return (
    <div className="DashboardFormation-projects">
      <div className="DashboardFormation-header">
        <h2>Formations</h2>
      </div>
      <div className="DashboardFormation-table">
        <div className="DashboardFormation-tableHeader">
          <span>Companies</span>
          <span>Members</span>
          <span>Instructor</span>
          <span>Completion</span>
        </div>
        {projects.map((project) => (
          <div key={project.id} className="DashboardFormation-row">
            <div className="DashboardFormation-company">
              <img src={project.logo} alt="" />
              <span>{project.company}</span>
            </div>
            <div className="DashboardFormation-members">
              {project.members.map((member, idx) => (
                <div key={idx} className="DashboardFormation-member">
                  <div className="DashboardFormation-avatarWrapper">
                    <img src={member.avatar} alt="member" />
                    <div className="DashboardFormation-tooltip">
                      {member.firstName} {member.lastName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="DashboardFormation-budget">
              {project.Instructor}
            </div>
            <div className="DashboardFormation-progress">
              <div className="DashboardFormation-progressBar">
                <div
                  className="DashboardFormation-progressFill"
                  style={{
                    width: `${project.completion}%`,
                    backgroundColor:
                      project.completion === 100 ? "#4caf50" : "#1e88e5",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardFormation;
