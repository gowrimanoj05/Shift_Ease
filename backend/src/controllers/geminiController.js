const { GoogleGenerativeAI } = require('@google/genai').default;
import Shift from '../models/Shift.js';
// Initialize Gemini AI
let genAI;
let model;

try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Gemini AI initialized');
  } else {
    console.warn('⚠️  Gemini API key not found. Chatbot will use fallback mode.');
  }
} catch (error) {
  console.error('❌ Gemini initialization error:', error.message);
}

// System prompt to give context to Gemini
const SYSTEM_PROMPT = `You are a helpful assistant for ShiftEase, a shift management system. Your role is to:
1. Help employees check their shift schedules
2. Assist with shift swap requests
3. Answer questions about their work schedule
4. Be friendly, professional, and concise

Keep responses brief and conversational. When users ask about shifts, I will provide the actual data.`;

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    // Analyze user intent
    const intent = detectIntent(message);

    let responseText = '';
    let additionalData = null;

    // Handle specific intents with database queries
    if (intent === 'get_next_shift') {
      const shift = await getNextShift(userId);
      if (shift) {
        const shiftDate = new Date(shift.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        
        // Let Gemini format the response naturally
        const prompt = `${SYSTEM_PROMPT}

User ${userName} asked: "${message}"

Their next shift details:
- Date: ${shiftDate}
- Time: ${shift.startTime} to ${shift.endTime}
- Shift type: ${shift.shiftType}
- Department: ${shift.department}

Respond naturally and helpfully about their next shift.`;

        if (model) {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          responseText = response.text();
        } else {
          responseText = `Your next shift is on ${shiftDate} from ${shift.startTime} to ${shift.endTime}. It's a ${shift.shiftType} shift in the ${shift.department} department.`;
        }
        
        additionalData = shift;
      } else {
        responseText = model 
          ? await generateGeminiResponse(`${SYSTEM_PROMPT}\n\nUser ${userName} asked: "${message}"\n\nThey have no upcoming shifts scheduled. Respond helpfully.`)
          : "You don't have any upcoming shifts scheduled at the moment.";
      }
    } else if (intent === 'request_swap') {
      responseText = model
        ? await generateGeminiResponse(`${SYSTEM_PROMPT}\n\nUser ${userName} wants to swap their shift. Guide them to use the calendar to select a shift and choose who to swap with. Be brief and helpful.`)
        : "I can help you request a shift swap! Please click on the shift you want to swap in your calendar, and you'll be able to select which shift you'd like to swap it with.";
    } else if (intent === 'get_schedule') {
      const shifts = await getUserShifts(userId);
      const upcomingShifts = shifts.filter(s => new Date(s.date) >= new Date()).slice(0, 5);
      
      if (upcomingShifts.length > 0) {
        const shiftList = upcomingShifts.map(s => {
          const date = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `- ${date}: ${s.shiftType} shift (${s.startTime}-${s.endTime})`;
        }).join('\n');

        const prompt = `${SYSTEM_PROMPT}

User ${userName} asked: "${message}"

Their upcoming shifts:
${shiftList}

Respond naturally showing their schedule.`;

        responseText = model
          ? await generateGeminiResponse(prompt)
          : `Here are your next ${upcomingShifts.length} shifts:\n\n${shiftList}`;
        
        additionalData = upcomingShifts;
      } else {
        responseText = "You don't have any upcoming shifts scheduled.";
      }
    } else {
      // General conversation - let Gemini handle it
      const prompt = `${SYSTEM_PROMPT}

User ${userName} said: "${message}"

Respond helpfully. If they're asking about shifts, schedule, or swaps, guide them appropriately. Keep it brief.`;

      responseText = model
        ? await generateGeminiResponse(prompt)
        : "I can help you with your shift schedule! Try asking 'When is my next shift?' or 'I want to swap my shift'.";
    }

    res.status(200).json({
      success: true,
      response: responseText,
      intent: intent,
      data: additionalData
    });
  } catch (error) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
      response: 'I can help you check your shifts or request swaps. What would you like to do?'
    });
  }
};

// Helper function to generate Gemini response
const generateGeminiResponse = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
};

// Simple intent detection
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.match(/\b(next|upcoming|when|what'?s?)\b.*\b(shift|work|schedule)\b/)) {
    return 'get_next_shift';
  }
  if (lowerMessage.match(/\b(swap|change|switch|exchange)\b.*\b(shift)\b/)) {
    return 'request_swap';
  }
  if (lowerMessage.match(/\b(show|view|see|check|list)\b.*\b(schedule|shifts|calendar)\b/)) {
    return 'get_schedule';
  }
  
  return 'general';
};

// Helper functions
const getNextShift = async (userId) => {
  const now = new Date();
  const shift = await Shift.findOne({
    userId: userId,
    date: { $gte: now }
  }).sort({ date: 1 });
  return shift;
};

const getUserShifts = async (userId) => {
  const shifts = await Shift.find({ userId: userId }).sort({ date: 1 });
  return shifts;
};

module.exports = { chat };