const Event = require('./../models/EventModel');
const { getUserId } = require('./../utils/tokenAuth.js');
const User = require('./../models/userModel');
const Profile =require('./../models/profileModel.js')

const createEvent = async (req, res) => {
    try {
        const { title, description, date, color, global } = req.body;
        
        // Validation des champs obligatoires
        if (!title || !date) {
            return res.status(400).json({ 
                error: 'Le titre et la date sont obligatoires' 
            });
        }

        const userId = await getUserId(req);
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        const newEvent = new Event({
            userId: global ? undefined : userId, // userId seulement si non global
            title,
            description: description || '', // Valeur par défaut
            date: new Date(date),
            color: color || '#3498db', // Valeur par défaut
            global: global || false // Valeur par défaut
        });

        // Validation avant sauvegarde
        await newEvent.validate();
        
        const savedEvent = await newEvent.save();
        
        res.status(201).json({
            message: 'Événement créé avec succès',
            event: savedEvent
        });

    } catch (error) {
        console.error('Erreur détaillée:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors
            });
        }
        
        res.status(500).json({ 
            error: 'Erreur lors de la création de l\'événement',
            details: error.message 
        });
    }
};

// Obtenir tous les événements
const getAllEvents = async (req, res) => {
    try {
        const userId = await getUserId(req);
        const events = await Event.find({
            $or: [
                { global: true },
                { userId }
            ]
        }).sort({ date: 1 });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des événements.' });
    }
};

// Supprimer un événement
const deleteEvent = async (req, res) => {
    try {
        // Vérifier si l'événement existe
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Événement non trouvé.' });
        }

        // Supprimer l'événement directement
        await Event.findByIdAndDelete(req.params.id);
        
        return res.status(200).json({ 
            message: 'Événement supprimé avec succès.',
            deletedEvent: event
        });

    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la suppression de l\'événement.',
            details: error.message 
        });
      }}
// Example EventController.js

const getAllEventsadmin = async (req, res) => {
  try {
    // Étape 1: Récupérer tous les événements
    const events = await Event.find({}).lean();
    
    // Étape 2: Récupérer tous les userIds distincts
    const userIds = [...new Set(events.map(e => e.userId?.toString()).filter(Boolean))];
    
    // Étape 3: Récupérer les profils correspondants
    const profiles = await Profile.find({ 
      userId: { $in: userIds } 
    }).lean();
    
    // Étape 4: Créer un map pour une recherche rapide
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.userId.toString()] = profile;
      return acc;
    }, {});
    
    // Étape 5: Fusionner les données
    const formattedEvents = events.map(event => {
      const eventObj = { ...event };
      
      if (event.userId) {
        const profile = profileMap[event.userId.toString()];
        if (profile) {
          eventObj.userName = profile.name;
        }
      }
      
      return eventObj;
    });

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des événements.',
      details: error.message 
    });
  }
};
const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const updates = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ error: 'Événement non trouvé.' });
        }

        return res.status(200).json({
            message: 'Événement mis à jour avec succès.',
            event: updatedEvent
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la modification',
            details: error.message 
        });
    }
};
const createAdminEvent = async (req, res) => {
    try {
        const { title, description, date, color } = req.body;
        
        // Validation des champs obligatoires
        if (!title || !date) {
            return res.status(400).json({ 
                error: 'Le titre et la date sont obligatoires' 
            });
        }

        const newEvent = new Event({
            title,
            description: description || '', // Valeur par défaut si non fournie
            date: new Date(date),
            color: color || '#3498db', // Couleur par défaut
            global: true // Toujours true pour les événements admin
        });

        // Validation avant sauvegarde
        await newEvent.validate();
        
        const savedEvent = await newEvent.save();
        
        res.status(201).json({
            message: 'Événement admin créé avec succès',
            event: savedEvent
        });

    } catch (error) {
        console.error('Erreur création événement admin:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Erreur de validation',
                details: error.errors
            });
        }
        
        res.status(500).json({ 
            error: 'Erreur lors de la création de l\'événement admin',
            details: error.message 
        });
    }
};

// Route protégée
module.exports = {
    createEvent,
    getAllEvents,
    deleteEvent,
    getAllEventsadmin,updateEvent,createAdminEvent
};
