const SwapRequest = require('../models/SwapRequest');
const Shift = require('../models/Shift');
const User = require('../models/User');

exports.createSwapRequest = async (req, res) => {
  try {
    const { shiftId, targetShiftId, reason } = req.body;

    // Validate requester's shift
    const requesterShift = await Shift.findById(shiftId);
    if (!requesterShift) {
      return res.status(404).json({ message: 'Your shift not found' });
    }

    if (requesterShift.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to swap this shift' });
    }

    // Check for existing pending request
    const existingRequest = await SwapRequest.findOne({
      requesterShiftId: shiftId,
      status: { $in: ['pending', 'matched'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending swap request for this shift' });
    }

    let swapRequestData = {
      requesterId: req.user._id,
      requesterShiftId: shiftId,
      reason,
      status: 'pending'
    };

    // If target shift is specified
    if (targetShiftId) {
      const targetShift = await Shift.findById(targetShiftId).populate('userId');
      
      if (!targetShift) {
        return res.status(404).json({ message: 'Target shift not found' });
      }

      // Can't swap with own shift
      if (targetShift.userId._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot swap with your own shift' });
      }

      // Check if shifts are on same date
      const requesterDate = new Date(requesterShift.date).toDateString();
      const targetDate = new Date(targetShift.date).toDateString();
      
      if (requesterDate !== targetDate) {
        return res.status(400).json({ message: 'Can only swap shifts on the same date' });
      }

      // Check if target employee has a pending swap request for the same shift
      const targetHasRequest = await SwapRequest.findOne({
        requesterShiftId: targetShiftId,
        status: { $in: ['pending', 'matched'] }
      });

      if (targetHasRequest) {
        return res.status(400).json({ 
          message: `${targetShift.userId.name} already has a pending swap request for that shift` 
        });
      }

      swapRequestData.targetUserId = targetShift.userId._id;
      swapRequestData.targetShiftId = targetShiftId;
      swapRequestData.requestedDate = targetShift.date;
      swapRequestData.status = 'matched';
    }

    const swapRequest = await SwapRequest.create(swapRequestData);

    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requesterId', 'name email department position crew')
      .populate('requesterShiftId')
      .populate('targetUserId', 'name email department position crew')
      .populate('targetShiftId');

    res.status(201).json({
      success: true,
      swapRequest: populatedRequest
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSwapRequests = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee') {
      query = {
        $or: [
          { requesterId: req.user._id },
          { targetUserId: req.user._id }
        ]
      };
    }

    const swapRequests = await SwapRequest.find(query)
      .populate('requesterId', 'name email department position crew')
      .populate('requesterShiftId')
      .populate('targetUserId', 'name email department position crew')
      .populate('targetShiftId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: swapRequests.length,
      swapRequests
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAvailableShiftsForSwap = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const myShift = await Shift.findById(shiftId);
    if (!myShift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    if (myShift.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find shifts on the same date, different shift type, different user
    const availableShifts = await Shift.find({
      date: myShift.date,
      shiftType: { $ne: myShift.shiftType },
      userId: { $ne: req.user._id }
    })
      .populate('userId', 'name email department position crew')
      .sort({ shiftType: 1 });

    // Filter out shifts that already have pending swap requests
    const shiftsWithoutRequests = [];
    for (const shift of availableShifts) {
      const hasRequest = await SwapRequest.findOne({
        requesterShiftId: shift._id,
        status: { $in: ['pending', 'matched'] }
      });
      if (!hasRequest) {
        shiftsWithoutRequests.push(shift);
      }
    }

    res.status(200).json({
      success: true,
      availableShifts: shiftsWithoutRequests
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.approveSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('requesterShiftId')
      .populate('targetShiftId');

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (!swapRequest.targetShiftId) {
      return res.status(400).json({ message: 'Cannot approve swap without a matched target shift' });
    }

    // Swap the shifts
    const shift1 = await Shift.findById(swapRequest.requesterShiftId._id);
    const shift2 = await Shift.findById(swapRequest.targetShiftId._id);

    const tempUserId = shift1.userId;
    shift1.userId = shift2.userId;
    shift2.userId = tempUserId;

    await shift1.save();
    await shift2.save();

    swapRequest.status = 'approved';
    await swapRequest.save();

    res.status(200).json({
      success: true,
      message: 'Swap request approved and shifts updated',
      swapRequest
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.rejectSwapRequest = async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    )
      .populate('requesterId', 'name email department position crew')
      .populate('requesterShiftId')
      .populate('targetUserId', 'name email department position crew')
      .populate('targetShiftId');

    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Swap request rejected',
      swapRequest
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};