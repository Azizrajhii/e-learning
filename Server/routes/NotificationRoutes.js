const express = require('express');
const router = express.Router();
const { getAllNotifications , sendNotification , markAllNotificationsAsRead , getUnreadCount } = require('./../controllers/NotificationController');

router.get('/', getAllNotifications);
router.post('/mark-all-read', markAllNotificationsAsRead);
router.get("/unread-count", getUnreadCount);
router.post('/:userId', sendNotification);


module.exports = router;