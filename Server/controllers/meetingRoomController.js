const axios = require('axios');
const Classroom = require('../models/Classroom');

exports.createRoom = async (req, res) => {
  try {
    if (!req.user.isTeacher) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const response = await axios.post(
      'https://api.daily.co/v1/rooms',
      {
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          permissions: {
            canSend: true,
            canAdmin: true
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const room = response.data;

    const newClassroom = new Classroom({
      dailyRoomId: room.id,
      teacher: req.user._id,
      roomUrl: room.url,
      students: []
    });

    await newClassroom.save();

    res.json({
      url: room.url,
      id: room.id
    });

  } catch (error) {
    console.error('Daily.co API error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create room',
      details: error.response?.data || error.message 
    });
  }
};