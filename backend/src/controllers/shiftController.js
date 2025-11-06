const Shift = require('../models/Shift');
const User = require('../models/User');

// Get shifts for logged-in user
exports.getMyShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ userId: req.user._id })
      .populate('userId', 'name email department position crew')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: shifts.length,
      shifts
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all shifts (admin)
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find()
      .populate('userId', 'name email department position crew')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: shifts.length,
      shifts
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get crew schedule summary
exports.getCrewSchedule = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const shifts = await Shift.find(query)
      .populate('userId', 'name email crew department position')
      .sort({ date: 1 });

    // Group by crew
    const crewSchedule = {
      A: [],
      B: [],
      C: []
    };

    shifts.forEach(shift => {
      if (shift.userId && shift.userId.crew) {
        crewSchedule[shift.userId.crew].push(shift);
      }
    });

    // Get crew members
    const crewMembers = await User.find({ crew: { $in: ['A', 'B', 'C'] } })
      .select('name email crew department position');

    res.status(200).json({
      success: true,
      crewSchedule,
      crewMembers
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Generate shifts for all crews
exports.generateCrewShifts = async (req, res) => {
  try {
    const { startDate, months } = req.body;
    
    if (!startDate || !months) {
      return res.status(400).json({ 
        message: 'Start date and number of months are required' 
      });
    }

    const start = new Date(startDate);
    const monthsToGenerate = parseInt(months);
    
    // Get all employees with crews
    const employees = await User.find({ 
      crew: { $in: ['A', 'B', 'C'] } 
    });

    if (employees.length === 0) {
      return res.status(400).json({ 
        message: 'No employees found with crew assignments' 
      });
    }

    // Delete existing future shifts
    await Shift.deleteMany({
      date: { $gte: start }
    });

    let totalShifts = 0;
    const crewShiftPatterns = {
      A: ['morning', 'evening', 'night'],
      B: ['evening', 'night', 'morning'],
      C: ['night', 'morning', 'evening']
    };

    // Calculate end date
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + monthsToGenerate);

    // Generate shifts for each employee
    for (const employee of employees) {
      const shifts = await generateEmployeeShifts({
        userId: employee._id,
        crew: employee.crew,
        department: employee.department,
        startDate: start,
        endDate: endDate,
        shiftPattern: crewShiftPatterns[employee.crew]
      });
      totalShifts += shifts.length;
    }

    res.status(201).json({
      success: true,
      message: `Generated ${totalShifts} shifts for ${employees.length} employees across ${monthsToGenerate} months`,
      totalShifts,
      employeeCount: employees.length,
      months: monthsToGenerate
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to generate shifts for one employee
const generateEmployeeShifts = async ({ userId, crew, department, startDate, endDate, shiftPattern }) => {
  const shifts = [];
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  
  let patternIndex = 0;
  const end = new Date(endDate);

  const shiftTimings = {
    morning: { startTime: '06:00', endTime: '14:00' },
    evening: { startTime: '14:00', endTime: '22:00' },
    night: { startTime: '22:00', endTime: '06:00' }
  };

  while (currentDate < end) {
    const currentShiftType = shiftPattern[patternIndex];
    const timing = shiftTimings[currentShiftType];

    // Work 4 days
    for (let day = 0; day < 4; day++) {
      if (currentDate >= end) break;

      const shift = await Shift.create({
        userId,
        date: new Date(currentDate),
        startTime: timing.startTime,
        endTime: timing.endTime,
        shiftType: currentShiftType,
        department,
        notes: `Crew ${crew} - ${currentShiftType} shift - Day ${day + 1}`
      });

      shifts.push(shift);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Determine off days
    let offDays = 1;
    if (currentShiftType === 'night') {
      offDays = 2;
    }

    // Add off days
    currentDate.setDate(currentDate.getDate() + offDays);

    // Move to next shift type in rotation
    patternIndex = (patternIndex + 1) % shiftPattern.length;
  }

  return shifts;
};

// Create single shift (manual)
exports.createShift = async (req, res) => {
  try {
    const { userId, date, startTime, endTime, shiftType, department, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const shift = await Shift.create({
      userId,
      date,
      startTime,
      endTime,
      shiftType,
      department,
      notes
    });

    const populatedShift = await Shift.findById(shift._id)
      .populate('userId', 'name email department position crew');

    res.status(201).json({
      success: true,
      shift: populatedShift
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email department position crew');

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.status(200).json({
      success: true,
      shift
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Shift deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUserShifts = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const query = { userId };
    
    if (startDate) {
      query.date = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query.date = { ...query.date, $lte: new Date(endDate) };
    }

    const result = await Shift.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} shifts`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getNextShift = async (req, res) => {
  try {
    const now = new Date();
    const shift = await Shift.findOne({
      userId: req.user._id,
      date: { $gte: now }
    }).sort({ date: 1 });

    if (!shift) {
      return res.status(404).json({ message: 'No upcoming shifts found' });
    }

    res.status(200).json({
      success: true,
      shift
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};