const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  deleteEvent,getAllEventsadmin,updateEvent,createAdminEvent
} = require('./../controllers/EventController');

// POST /api/events - Créer un nouvel événement
router.post('/',createEvent);
router.post('/admin', createAdminEvent); // Nouvelle route pour créer des événements admin

router.get('/adminevents', getAllEventsadmin);

// GET /api/events - Obtenir tous les événements
router.get('/', getAllEvents);

// DELETE /api/events/:id - Supprimer un événement
router.delete('/delete-event/:id', deleteEvent);
router.put('/update-event/:id',  updateEvent);



module.exports = router;
