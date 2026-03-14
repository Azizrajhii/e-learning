const Formation = require("./../models/formationModel");
const Profile = require("./../models/profileModel");
const User = require("./../models/userModel");
const { getUserId } = require("./../utils/tokenAuth.js");
const uploadToCloudinary = require("./../utils/cloudinaryUploader.js");
const mongoose = require('mongoose');

async function getAllFormations(req, res) {
  try {
    const userId = await getUserId(req);

    const formations = await Formation.find({ 
      accepted: true,
      status: { $ne: "draft" },
      InstructorId: { $ne: userId }
    });

    if (!formations) {
      return res.status(404).json({ message: "Aucune formation trouvée" });
    }

    return res.status(200).json(formations);
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    if (error.status === 401 || error.statusCode === 401) {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: "Erreur du serveur", error });
  }
}

async function getFormationByID(req, res) {
  try {
    const { idFormation } = req.params;

    const formation = await Formation.findById(idFormation);

    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée" });
    }

    return res.status(200).json(formation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error);
    return res.status(500).json({ message: "Erreur du serveur", error });
  }
}

async function createFormation(req, res) {
  try {
    console.log("Received body:", req.body);

    const userId = await getUserId(req);
    const { title, category, description, Seats, date , status } = req.body;

    // Get the uploaded image file from the request
    const imageFile = req.file;
    // Check if the file exists
    if (!imageFile) {
      return res.status(400).json({ message: "Please upload an image." });
    }

    // Upload image to Cloudinary
    let imageUrl;
    try {
      imageUrl = await uploadToCloudinary(
        imageFile.path,
        "FormationCoverimage"
      );
    } catch (uploadError) {
      console.error("Error uploading image to Cloudinary:", uploadError);
      return res.status(500).json({ message: "Error uploading image" });
    }

    // Create and save the new formation document
    const newFormation = new Formation({
      InstructorId: userId,
      title,
      category,
      description,
      coverImage: imageUrl,
      maxSeats: parseInt(Seats),
      startAt: date ? new Date(date) : null,
      status : status,
      accepted: false,
      enrolledSeats : []
    });

    const savedFormformation = await newFormation.save();
    return res.status(201).json(savedFormformation);
  } catch (error) {
    console.error("Erreur lors de la création de la formation:", error);
    return res
      .status(500)
      .json({ message: "Erreur du serveur", error: error.message });
  }
}

async function getMyFormations(req, res) {
  try {
    const userId = await getUserId(req);

    const formation = await Formation.find({ InstructorId: userId }).sort({
      createdAt: -1,
    });

    if (!formation) {
      return res.status(404).json({ message: "Aucune formation trouvée" });
    }

    return res.status(200).json(formation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error);
    return res.status(500).json({ message: "Erreur du serveur", error });
  }
}

async function updateFormation(req, res) {
  try {
    console.log("Received body:", req.body);

    const userId = await getUserId(req);
    const { idFormation } = req.params;
    const { title, category, description, Seats, date , status} = req.body;
    const imageFile = req.file;

    // Vérifier si la formation existe et appartient à l'utilisateur
    const existingFormation = await Formation.findOne({
      _id: idFormation,
      InstructorId: userId,
    });

    if (!existingFormation) {
      return res.status(404).json({
        message:
          "Formation non trouvée ou vous n'êtes pas autorisé à la modifier",
      });
    }

    // Mettre à jour l'image si une nouvelle est fournie
    let imageUrl = existingFormation.coverImage;
    if (imageFile) {
      try {
        imageUrl = await uploadToCloudinary(
          imageFile.path,
          "FormationCoverimage"
        );
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({ message: "Error uploading image" });
      }
    }

    // Préparer les données de mise à jour
    const updateData = {
      title: title || existingFormation.title,
      category: category || existingFormation.category,
      description: description || existingFormation.description,
      coverImage: imageUrl,
      status : status,
      maxSeats: Seats ? parseInt(Seats) : existingFormation.maxSeats,
      startAt: date ? new Date(date) : existingFormation.startAt,
      // Le statut et 'accepted' ne sont pas modifiables via cette fonction
    };

    // Mettre à jour la formation
    const updatedFormation = await Formation.findByIdAndUpdate(
      idFormation,
      updateData,
      { new: true } // Retourne le document mis à jour
    );

    return res.status(200).json(updatedFormation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la formation:", error);
    return res
      .status(500)
      .json({ message: "Erreur du serveur", error: error.message });
  }
}

async function checkUserEnrollment(req, res) {
  try {
    const userId = await getUserId(req);
    const { formationId } = req.params;

    console.log('Checking enrollment:', { formationId, userId });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(formationId)) {
      return res.status(400).json({ message: "Invalid formation ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const formation = await Formation.findById(formationId)
      .select('title enrolledSeats')
      .lean();

    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    const isEnrolled = formation.enrolledSeats.some(enrolledUserId => 
      enrolledUserId.userId.toString() === userId.toString()
    );

    return res.status(200).json({
      isEnrolled,
      formationTitle: formation.title,
      userId
    });
  } catch (error) {
    console.error("Error checking user enrollment:", error);
    return res.status(500).json({ 
      message: "Server error",
      error: error.message // Include the actual error message
    });
  }
}

async function joinToFormation(req, res) {
  try {
    const userId = await getUserId(req);
    const { formationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(formationId)) {
      return res.status(400).json({ message: "Format d'ID invalide" });
    }

    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: "Formation introuvable" });
    }

    if (formation.InstructorId.toString() === userId.toString()) {
      return res.status(400).json({ message: "Action interdite" });
    }

    const existeDeja = formation.enrolledSeats.some(
      s => s.userId.toString() === userId.toString()
    );
    if (existeDeja) {
      return res.status(400).json({ message: "Déjà inscrit" });
    }

    if (formation.enrolledSeats.length >= formation.maxSeats) {
      return res.status(400).json({ message: "Complet" });
    }

    formation.enrolledSeats.push({ userId });
    await formation.save();
    
    return res.status(200).json({
      success: true,
      message: "Inscription validée",
      placesRestantes: formation.maxSeats - formation.enrolledSeats.length
    });

  } catch (err) {
    console.error("ERREUR:", err);
    return res.status(500).json({
      success: false,
      message: "Échec de l'inscription",
      error: err.message
    });
  }
}

async function getAllFormationsMembres(req, res) {
  try {
    const { formationId } = req.params;

    // First, validate the formationId
    if (!mongoose.Types.ObjectId.isValid(formationId)) {
      return res.status(400).json({ message: "ID de formation invalide" });
    }

    const formation = await Formation.findById(formationId).populate({
      path: "enrolledSeats.userId",
      populate: {
        path: "profile",
        select: "name lastName sex profilePicture",
        model: "Profile"
      }
    });

    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée" });
    }

    // Filter out any remaining null references (just in case)
    const cleanedFormation = {
      ...formation.toObject(),
      enrolledSeats: formation.enrolledSeats.filter(seat => seat.userId !== null)
    };

    return res.status(200).json(cleanedFormation.enrolledSeats);
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return res.status(500).json({ message: "Erreur du serveur", error });
  }
}

async function getAllFormationsAll(req, res) {
  try {
    const formations = await Formation.find().populate([
      {
        path: "lessons",
        options: { sort: { createdAt: 1 } }
      },
      {
        path: "InstructorId",
        select: "name", // Only get the name field from Profile
        // Assuming you have a reference setup between Formation.InstructorId and Profile.userId
        // If not, you might need to use a different approach
        model: "Profile",
        foreignField: "userId",
        localField: "InstructorId"
      }
    ]);

    if (!formations || formations.length === 0) {
      return res.status(404).json({ message: "Aucune formation trouvée" });
    }

    // If the populate above doesn't work due to reference setup, you can do it manually:
    /*
    const formationsWithInstructor = await Promise.all(formations.map(async (formation) => {
      const profile = await Profile.findOne({ userId: formation.InstructorId });
      return {
        ...formation.toObject(),
        instructorName: profile?.name || 'Unknown'
      };
    }));
    */

    return res.status(200).json(formations);
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return res.status(500).json({ message: "Erreur du serveur", error });
  }
}

async function getAllFormationsadmin(req, res) {
  try {
    const formations = await Formation.find().populate([
      {
        path: "lessons",
        options: { sort: { createdAt: 1 } }
      },
      {
        path: "InstructorId",
        select: "name",
        model: "Profile"
      }
    ]);

    if (!formations || formations.length === 0) {
      return res.status(404).json({ message: "Aucune formation trouvée" });
    }

    // Transformez les données avant de les envoyer
    const formattedFormations = formations.map(formation => ({
      ...formation._doc,
      enrolledSeats: formation.enrolledSeats?.length || 0
    }));

    return res.status(200).json(formattedFormations);
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return res.status(500).json({ message: "Erreur du serveur", error });
  }
}

async function getFormationCountByDate(req, res) {
  try {
    const result = await Formation.aggregate([
      {
        // Convertir createdAt en type Date (au cas où ce serait une string)
        $addFields: {
          createdAtDate: { $toDate: "$createdAt" }
        }
      },
      {
        // S’assurer que createdAtDate est bien une date valide
        $match: {
          createdAtDate: { $type: "date" }
        }
      },
      {
        // Grouper par date formatée
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAtDate" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Erreur lors de l'agrégation des formations:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du nombre de formations",
      error: error.message,
    });
  }
}

async function getStatusCounts(req, res) {
  try {
    // Récupérer toutes les formations
    const formations = await Formation.find();

    // Initialiser les compteurs
    const counts = {
      upcoming: 0,
      ongoing: 0,
      completed: 0,
    };

    // Compter selon le champ status directement
    for (const formation of formations) {
      if (formation.status === "upcoming") counts.upcoming++;
      else if (formation.status === "ongoing") counts.ongoing++;
      else if (formation.status === "completed") counts.completed++;
    }

    // Envoyer la réponse
    res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    console.error("Erreur dans getStatusCounts:", error.message);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des statistiques.",
    });
  }
}

async function updateFormationStatus(req, res) {
  try {
    console.log("Requête reçue");
    const { id } = req.params;
    const { accepted } = req.body;

    if (typeof accepted !== 'boolean') {
      console.log("Champ 'accepted' invalide");
      return res.status(400).json({ message: "Le champ 'accepted' doit être un boolean" });
    }

    console.log("Requête1");
    const formation = await Formation.findById(id);
    console.log(formation);

    if (!formation) {
      console.log("Formation non trouvée");
      return res.status(404).json({ message: "Formation non trouvée" });
    }

    // 🔧 Skipper les entrées invalides dans enrolledSeats
    formation.enrolledSeats = formation.enrolledSeats.filter(seat => seat.userId);

    // ✅ Mise à jour du statut
    formation.accepted = accepted;
    await formation.save();
    console.log("Formation mise à jour");

    return res.status(200).json({
      message: "Statut de la formation mis à jour avec succès",
      formation
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la mise à jour du statut",
      error: error.message
    });
  }
};

async function updateFormationAdmin(req, res) {
  try {
    const { formationId, title, description, category, instructor, status, 
            enrolledSeats, maxSeats, averageRating, totalHours, 
            createdAt, endAt, contents } = req.body;

    // Find and update the formation
    const updatedFormation = await Formation.findByIdAndUpdate(
      formationId,
      {
        title,
        description,
        category,
        instructor,
        status,
        enrolledSeats,
        maxSeats,
        averageRating,
        totalHours,
        createdAt,
        endAt,
        contents
      },
      { new: true }
    );

    if (!updatedFormation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    return res.status(200).json({ formation: updatedFormation });
  } catch (error) {
    console.error("Error updating formation:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = {
  getAllFormations,
  getFormationByID,
  createFormation,
  getMyFormations,
  updateFormation,
  checkUserEnrollment,
  joinToFormation,getAllFormationsAll,getAllFormationsadmin,
  getFormationCountByDate,getStatusCounts,updateFormationStatus,updateFormationAdmin,getAllFormationsMembres
};
