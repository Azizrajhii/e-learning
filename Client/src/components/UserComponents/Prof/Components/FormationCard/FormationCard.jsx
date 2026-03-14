import styles from "./FormationCard.module.scss";
import { MdOutlineEdit } from "react-icons/md";
import UserIcon from "./../../../images/UserIcon.png";
import { Link } from "react-router-dom";

const FormationCard = ({ formation }) => {
  console.log(formation);

  const getSituationColor = (status) => {
    switch (status) {
      case "upcoming":
        return "blue";
      case "ongoing":
        return "green";
      case "completed":
        return "red";
      case "cancelled":
        return "purple";
      default:
        return "black";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const HeaderColor =
    formation.title === "php"
      ? "red"
      : formation.title === "Python"
      ? "rgb(195, 0, 255)"
      : formation.title === "Html"
      ? "rgb(158, 117, 41)"
      : formation.title === "Java"
      ? "orange"
      : "black";

  return (
    <>
      <div className="Formation-card-container">
        <div
          className="Formation-card-header"
          style={{ background: HeaderColor }}
        >
          <img src={formation.coverImage} alt={formation.title} />
        </div>
        <div className="Formation-card-content">
          <div className="Formation-card-Title">
            <p>{formation.title}</p>
            <div className="Formation-card-Places">
              <img src={UserIcon} alt="User Icon" />
              <span>
                {formation.enrolledSeats.length} / {formation.maxSeats}
              </span>
            </div>
          </div>
          <div className="Formation-card-category">
            <span style={{ color: "#4361ee" }}>{formation.category}</span>
          </div>
          <div className="Formation-card-Sub-Title">
            <span>{formation.description}</span>
            <p>Published {formatDate(formation.createdAt)}</p>
          </div>
          <div className="Formation-card-Footer">
            <Link
              to={`/SkillShareHub/ProfSpace/MyFormations/Details/${formation._id}`}
            >
              <button className={styles.editButton}>
                <MdOutlineEdit />
                Edit
              </button>
            </Link>
            <div
              className="Formation-card-Tag"
              style={{ background: getSituationColor(formation.status) }}
            >
              {formation.status}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormationCard;
