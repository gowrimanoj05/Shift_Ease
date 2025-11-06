import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { shiftAPI, swapAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ShiftModal from './ShiftModal';
import { RefreshCw, Sun, Sunset, Moon } from 'lucide-react';

const localizer = momentLocalizer(moment);

const ShiftCalendar = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalShifts: 0,
    upcomingShifts: 0,
    shiftsByType: {
      morning: 0,
      evening: 0,
      night: 0
    }
  });

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const response = await shiftAPI.getMyShifts();
      const shiftsData = response.data.shifts;
      setShifts(shiftsData);

      // Calculate statistics
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const upcoming = shiftsData.filter(s => new Date(s.date) >= now);
      const shiftsByType = {
        morning: shiftsData.filter(s => s.shiftType === 'morning').length,
        evening: shiftsData.filter(s => s.shiftType === 'evening').length,
        night: shiftsData.filter(s => s.shiftType === 'night').length
      };

      setStats({
        totalShifts: shiftsData.length,
        upcomingShifts: upcoming.length,
        shiftsByType
      });

      const formattedEvents = shiftsData.map(shift => ({
        id: shift._id,
        title: `${shift.shiftType} Shift`,
        start: new Date(shift.date),
        end: new Date(shift.date),
        resource: shift,
        className: shift.shiftType
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedShift(event.resource);
    setShowModal(true);
  };

  const handleRequestSwap = async (shiftId, targetShiftId, reason) => {
  try {
    await swapAPI.createSwapRequest({ 
      shiftId, 
      targetShiftId, 
      reason 
    });
    alert('Swap request created successfully!');
    setShowModal(false);
    loadShifts(); // Reload to show updated data
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to create swap request');
  }
};

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6';
    
    switch (event.resource.shiftType) {
      case 'morning':
        backgroundColor = '#fbbf24';
        break;
      case 'evening':
        backgroundColor = '#f97316';
        break;
      case 'night':
        backgroundColor = '#8b5cf6';
        break;
      default:
        backgroundColor = '#3b82f6';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading your shifts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Shift Calendar</h1>
          <p className="text-gray-600 mt-1 flex items-center flex-wrap gap-2">
            View and manage your work shifts
            {user?.crew && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Crew {user.crew}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadShifts}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Shifts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalShifts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-green-600">{stats.upcomingShifts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Sun className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Morning Shifts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.shiftsByType.morning}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Sun className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Night Shifts</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.shiftsByType.night}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Moon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Legend */}
        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Shift Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#fbbf24' }}>
                <Sun className="h-4 w-4 text-yellow-900" />
              </div>
              <div>
                <span className="text-sm font-medium">Morning</span>
                <p className="text-xs text-gray-500">6:00 - 14:00</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
                <Sunset className="h-4 w-4 text-orange-900" />
              </div>
              <div>
                <span className="text-sm font-medium">Evening</span>
                <p className="text-xs text-gray-500">14:00 - 22:00</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#8b5cf6' }}>
                <Moon className="h-4 w-4 text-purple-100" />
              </div>
              <div>
                <span className="text-sm font-medium">Night</span>
                <p className="text-xs text-gray-500">22:00 - 6:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        {shifts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <RefreshCw className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shifts Scheduled</h3>
            <p className="text-gray-600">
              You don't have any shifts scheduled yet. Please contact your admin.
            </p>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="month"
            popup
            selectable
            tooltipAccessor={(event) => 
              `${event.resource.shiftType} shift\n${event.resource.startTime} - ${event.resource.endTime}`
            }
          />
        )}
      </div>

      {/* Shift Pattern Info for Employee's Crew */}
      {user?.crew && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Your Crew Rotation Pattern</h3>
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user.crew === 'A' ? 'bg-yellow-100' :
                user.crew === 'B' ? 'bg-orange-100' :
                'bg-indigo-100'
              }`}>
                <span className={`font-bold ${
                  user.crew === 'A' ? 'text-yellow-700' :
                  user.crew === 'B' ? 'text-orange-700' :
                  'text-indigo-700'
                }`}>
                  {user.crew}
                </span>
              </div>
              <span className="font-semibold">Crew {user.crew} Pattern</span>
            </div>
            <ol className="space-y-1 text-sm text-gray-600">
              {user.crew === 'A' && (
                <>
                  <li>1. Morning (4 days) → 1 day off</li>
                  <li>2. Evening (4 days) → 1 day off</li>
                  <li>3. Night (4 days) → 2 days off</li>
                </>
              )}
              {user.crew === 'B' && (
                <>
                  <li>1. Evening (4 days) → 1 day off</li>
                  <li>2. Night (4 days) → 2 days off</li>
                  <li>3. Morning (4 days) → 1 day off</li>
                </>
              )}
              {user.crew === 'C' && (
                <>
                  <li>1. Night (4 days) → 2 days off</li>
                  <li>2. Morning (4 days) → 1 day off</li>
                  <li>3. Evening (4 days) → 1 day off</li>
                </>
              )}
              <li className="text-gray-500 italic mt-2">Pattern repeats every 16 days</li>
            </ol>
          </div>
        </div>
      )}

      {/* Upcoming Shifts List */}
      {stats.upcomingShifts > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Next 10 Upcoming Shifts</h3>
          <div className="space-y-2">
            {shifts
              .filter(shift => new Date(shift.date) >= new Date())
              .slice(0, 10)
              .map(shift => {
                const shiftDate = new Date(shift.date);
                const isToday = shiftDate.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={shift._id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    } hover:shadow-md transition cursor-pointer`}
                    onClick={() => {
                      setSelectedShift(shift);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        shift.shiftType === 'morning' ? 'bg-yellow-100' :
                        shift.shiftType === 'evening' ? 'bg-orange-100' :
                        'bg-indigo-100'
                      }`}>
                        {shift.shiftType === 'morning' && <Sun className="h-5 w-5 text-yellow-600" />}
                        {shift.shiftType === 'evening' && <Sunset className="h-5 w-5 text-orange-600" />}
                        {shift.shiftType === 'night' && <Moon className="h-5 w-5 text-indigo-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {shiftDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          {isToday && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Today</span>}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {shift.shiftType} • {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                    </div>
                    <button className="text-primary hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {showModal && selectedShift && (
        <ShiftModal
          shift={selectedShift}
          onClose={() => setShowModal(false)}
          onRequestSwap={handleRequestSwap}
        />
      )}
    </div>
  );
};

export default ShiftCalendar;