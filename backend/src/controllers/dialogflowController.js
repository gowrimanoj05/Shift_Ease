const Shift = require('../models/Shift');

exports.detectIntent = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    let responseText = '';
    let intent = 'Default';
    let additionalData = null;

    // Simple keyword matching (temporary replacement for Dialogflow)
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('next shift') || lowerMessage.includes('schedule')) {
      const shift = await getNextShift(userId);
      if (shift) {
        responseText = `Your next shift is on ${new Date(shift.date).toLocaleDateString()} from ${shift.startTime} to ${shift.endTime}. It's a ${shift.shiftType} shift.`;
        additionalData = shift;
        intent = 'GetNextShift';
      } else {
        responseText = "You don't have any upcoming shifts scheduled.";
        intent = 'GetNextShift';
      }
    } else if (lowerMessage.includes('swap') || lowerMessage.includes('change shift')) {
      responseText = "I can help you request a shift swap. Please select the shift you'd like to swap from your calendar, and I'll find matching opportunities for you.";
      intent = 'RequestShiftSwap';
    } else {
      responseText = 'I can help you with your shift schedules. Try asking "When is my next shift?" or "I want to swap my shift".';
      intent = 'Default';
    }

    res.status(200).json({
      success: true,
      response: responseText,
      intent: intent,
      confidence: 0.9,
      data: additionalData
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({
      message: 'Error processing your request',
      error: error.message
    });
  }
};

const getNextShift = async (userId) => {
  const now = new Date();
  const shift = await Shift.findOne({
    userId: userId,
    date: { $gte: now }
  }).sort({ date: 1 });
  return shift;
};

exports.webhook = async (req, res) => {
  try {
    res.json({
      fulfillmentText: 'Webhook received'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};