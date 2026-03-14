const Profile = require("./../models/profileModel");
const Article = require("./../models/articlesModel");
const { getUserId } = require("./../utils/tokenAuth.js");

const getSearchPaths = async (req, res) => {
  const userId = await getUserId(req);
  const query = req.query.q?.toLowerCase() || "";

  try {
    // Requête profils
    const profileResults = await Profile.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$lastName", " ", "$name"] },
              regex: query,
              options: "i",
            },
          },
        },
      ],
    }).limit(10);
    const formattedProfiles = profileResults
      .filter((profile) => String(profile.userId) !== String(userId))
      .map((profile) => ({
        label: `${profile.lastName} ${profile.name}`,
        name: profile.name,
        lastName: profile.lastName,
        sex: profile.sex,
        profilePicture: profile.profilePicture,
        specialty: profile.specialty,
        followers: profile.followers?.length || 0,
        following: profile.following?.length || 0,
        uploads: profile.uploads?.length || 0,
        path: `/SkillShareHub/Profile/${profile._id}`,
        _id: profile._id,
        userId: profile.userId,
        type: "user",
      }));

    // Requête articles
    const articleResults = await Article.find({
      $or: [{ title: { $regex: query, $options: "i" } }],
    }).limit(10);

    const formattedArticles = articleResults.map((article) => ({
      label: article.title || "Article sans titre",
      title: article.title,
      image: article.image,
      video: article.video,
      poll: article.poll,
      link: article.link,
      postedAt: article.postedAt,
      path: `/SkillShareHub/Article/${article._id}`,
      _id: article._id,
      type: "article",
    }));

    // Fusionner les deux résultats
    const combinedResults = [...formattedProfiles, ...formattedArticles];

    res.json(combinedResults);
  } catch (err) {
    console.error("❌ Erreur lors de la recherche:", err);
    res.status(500).json({ message: "Erreur lors de la recherche." });
  }
};

const getManySearchPaths = getSearchPaths;

module.exports = { getSearchPaths, getManySearchPaths };
