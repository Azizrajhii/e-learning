const Formation = require("./../models/formationModel");
const Users = require("./../models/userModel");

// Get home page statistics
const getHomeStats = async (req, res) => {
  try {
    const [courses, students, instructors] = await Promise.all([
      Formation.countDocuments({ accepted: true }),
      Users.countDocuments(),
      Users.countDocuments()
    ]);

    res.json({
      courses,
      students,
      instructors
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getHomeStats };
