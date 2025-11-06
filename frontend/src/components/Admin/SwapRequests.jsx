import React, { useState, useEffect } from 'react';
import { swapAPI } from '../../services/api';
import { Check, X, Clock, RefreshCw } from 'lucide-react';

const SwapRequests = () => {
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSwapRequests();
  }, []);

  const loadSwapRequests = async () => {
    try {
      setLoading(true);
      const response = await swapAPI.getSwapRequests();
      setSwapRequests(response.data.swapRequests);
    } catch (error) {
      console.error('Error loading swap requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this swap request?')) {
      try {
        await swapAPI.approveSwapRequest(id);
        loadSwapRequests();
        alert('Swap request approved successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to approve swap request');
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this swap request?')) {
      try {
        await swapAPI.rejectSwapRequest(id);
        loadSwapRequests();
        alert('Swap request rejected successfully!');
      } catch (error) {
        alert('Failed to reject swap request');
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading swap requests...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Swap Requests</h2>
        <button
          onClick={loadSwapRequests}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid gap-6">
        {swapRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No swap requests found
          </div>
        ) : (
          swapRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Swap Request #{request._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Requester */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Requester</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Name:</span> {request.requesterId?.name}</p>
                    <p><span className="text-gray-600">Department:</span> {request.requesterId?.department}</p>
                    {request.requesterShiftId && (
                      <>
                        <p><span className="text-gray-600">Date:</span> {new Date(request.requesterShiftId.date).toLocaleDateString()}</p>
                        <p><span className="text-gray-600">Time:</span> {request.requesterShiftId.startTime} - {request.requesterShiftId.endTime}</p>
                        <p><span className="text-gray-600">Type:</span> {request.requesterShiftId.shiftType}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Target */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {request.targetUserId ? 'Target' : 'Awaiting Match'}
                  </h4>
                  {request.targetUserId ? (
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Name:</span> {request.targetUserId?.name}</p>
                      <p><span className="text-gray-600">Department:</span> {request.targetUserId?.department}</p>
                      {request.targetShiftId && (
                        <>
                          <p><span className="text-gray-600">Date:</span> {new Date(request.targetShiftId.date).toLocaleDateString()}</p>
                          <p><span className="text-gray-600">Time:</span> {request.targetShiftId.startTime} - {request.targetShiftId.endTime}</p>
                          <p><span className="text-gray-600">Type:</span> {request.targetShiftId.shiftType}</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Waiting for match</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {request.reason && (
                <div className="mt-4 bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600 font-medium mb-1">Reason:</p>
                  <p className="text-sm text-gray-800">{request.reason}</p>
                </div>
              )}

              {(request.status === 'pending' || request.status === 'matched') && (
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                  >
                    <Check className="h-5 w-5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(request._id)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                  >
                    <X className="h-5 w-5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SwapRequests;