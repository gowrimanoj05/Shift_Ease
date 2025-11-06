import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Building, RefreshCw, ArrowRight } from 'lucide-react';
import { swapAPI } from '../../services/api';

const ShiftModal = ({ shift, onClose, onRequestSwap }) => {
  const [swapReason, setSwapReason] = useState('');
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [availableShifts, setAvailableShifts] = useState([]);
  const [selectedTargetShift, setSelectedTargetShift] = useState(null);
  const [loadingShifts, setLoadingShifts] = useState(false);

  useEffect(() => {
    if (showSwapForm) {
      loadAvailableShifts();
    }
  }, [showSwapForm]);

  const loadAvailableShifts = async () => {
    try {
      setLoadingShifts(true);
      const response = await swapAPI.getAvailableShiftsForSwap(shift._id);
      setAvailableShifts(response.data.availableShifts);
    } catch (error) {
      console.error('Error loading available shifts:', error);
    } finally {
      setLoadingShifts(false);
    }
  };

  const handleSubmitSwap = () => {
    if (!selectedTargetShift) {
      alert('Please select a shift to swap with');
      return;
    }

    onRequestSwap(shift._id, selectedTargetShift._id, swapReason);
    setSwapReason('');
    setShowSwapForm(false);
    setSelectedTargetShift(null);
  };

  const getShiftColor = (shiftType) => {
    switch (shiftType) {
      case 'morning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'evening': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'night': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative max-h-screen overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900">Shift Details</h2>

        {/* Current Shift Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(shift.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{shift.startTime} - {shift.endTime}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Building className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{shift.department}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Shift Type</p>
              <p className="font-medium capitalize">{shift.shiftType}</p>
            </div>
          </div>

          {shift.notes && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-500 mb-1">Notes</p>
              <p className="text-sm">{shift.notes}</p>
            </div>
          )}
        </div>

        {/* Swap Request Section */}
        {!showSwapForm ? (
          <button
            onClick={() => setShowSwapForm(true)}
            className="w-full bg-secondary text-white py-2 px-4 rounded-md hover:bg-purple-600 transition"
          >
            Request Shift Swap
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Shift to Swap With</h3>
            
            {loadingShifts ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading available shifts...</p>
              </div>
            ) : availableShifts.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No available shifts to swap with on this date. Other employees may already have pending swap requests.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableShifts.map((availShift) => (
                    <div
                      key={availShift._id}
                      onClick={() => setSelectedTargetShift(availShift)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        selectedTargetShift?._id === availShift._id
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {availShift.userId.name}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getShiftColor(availShift.shiftType)}`}>
                              {availShift.shiftType}
                            </span>
                            {availShift.userId.crew && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                Crew {availShift.userId.crew}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{availShift.startTime} - {availShift.endTime}</span>
                            <span>•</span>
                            <span>{availShift.userId.position}</span>
                          </div>
                        </div>
                        <ArrowRight className={`h-5 w-5 ${
                          selectedTargetShift?._id === availShift._id ? 'text-primary' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTargetShift && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-2">Swap Summary:</p>
                    <div className="flex items-center justify-center space-x-3 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">Your Shift</p>
                        <p className={`mt-1 px-3 py-1 rounded capitalize font-medium ${getShiftColor(shift.shiftType)}`}>
                          {shift.shiftType}
                        </p>
                        <p className="text-gray-600 mt-1">{shift.startTime} - {shift.endTime}</p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-blue-600" />
                      <div className="text-center">
                        <p className="font-semibold">{selectedTargetShift.userId.name}'s Shift</p>
                        <p className={`mt-1 px-3 py-1 rounded capitalize font-medium ${getShiftColor(selectedTargetShift.shiftType)}`}>
                          {selectedTargetShift.shiftType}
                        </p>
                        <p className="text-gray-600 mt-1">{selectedTargetShift.startTime} - {selectedTargetShift.endTime}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Swap (Optional)
                  </label>
                  <textarea
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    placeholder="Why do you want to swap this shift?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleSubmitSwap}
                    disabled={!selectedTargetShift}
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Swap Request
                  </button>
                  <button
                    onClick={() => {
                      setShowSwapForm(false);
                      setSelectedTargetShift(null);
                      setSwapReason('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftModal;