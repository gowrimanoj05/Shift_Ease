import React, { useState, useEffect } from 'react';
import { shiftAPI } from '../../services/api';
import { Calendar, Users, RefreshCw, Sparkles } from 'lucide-react';

const CrewSchedule = () => {
  const [crewData, setCrewData] = useState({ A: [], B: [], C: [] });
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorData, setGeneratorData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    months: 3
  });

  useEffect(() => {
    loadCrewSchedule();
  }, []);

  const loadCrewSchedule = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const response = await shiftAPI.getCrewSchedule(
        today.toISOString().split('T')[0],
        threeMonthsLater.toISOString().split('T')[0]
      );

      setCrewData(response.data.crewSchedule);
      setCrewMembers(response.data.crewMembers);
    } catch (error) {
      console.error('Error loading crew schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateShifts = async () => {
    if (!window.confirm(`Generate shifts for ${generatorData.months} months starting from ${generatorData.startDate}? This will replace all existing future shifts.`)) {
      return;
    }

    try {
      setGenerating(true);
      const response = await shiftAPI.generateCrewShifts(generatorData);
      alert(response.data.message);
      setShowGenerator(false);
      loadCrewSchedule();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate shifts');
    } finally {
      setGenerating(false);
    }
  };

  const getCrewMembers = (crew) => {
    return crewMembers.filter(m => m.crew === crew);
  };

  const getCrewShiftSummary = (crew) => {
    const shifts = crewData[crew] || [];
    const summary = {
      total: shifts.length,
      morning: shifts.filter(s => s.shiftType === 'morning').length,
      evening: shifts.filter(s => s.shiftType === 'evening').length,
      night: shifts.filter(s => s.shiftType === 'night').length
    };
    return summary;
  };

  const getCurrentShiftType = (crew) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const shifts = crewData[crew] || [];
    const todayShift = shifts.find(s => {
      const shiftDate = new Date(s.date);
      shiftDate.setHours(0, 0, 0, 0);
      return shiftDate.getTime() === today.getTime();
    });
    
    return todayShift?.shiftType || 'Off';
  };

  if (loading) {
    return <div className="text-center py-8">Loading crew schedules...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crew Schedule</h2>
          <p className="text-sm text-gray-600 mt-1">
            {crewMembers.length} total employees across 3 crews
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadCrewSchedule}
            className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            <Sparkles className="h-5 w-5" />
            <span>Generate Shifts</span>
          </button>
        </div>
      </div>

      {/* Shift Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Generate Crew Shifts</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={generatorData.startDate}
                  onChange={(e) => setGeneratorData({...generatorData, startDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Months
                </label>
                <select
                  value={generatorData.months}
                  onChange={(e) => setGeneratorData({...generatorData, months: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1">1 Month</option>
                  <option value="2">2 Months</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will generate shifts for all employees in Crews A, B, and C.
                  Each crew follows their rotation pattern:
                </p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Crew A: Morning → Evening → Night</li>
                  <li>• Crew B: Evening → Night → Morning</li>
                  <li>• Crew C: Night → Morning → Evening</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleGenerateShifts}
                disabled={generating}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
              <button
                onClick={() => setShowGenerator(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crew Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['A', 'B', 'C'].map(crew => {
          const members = getCrewMembers(crew);
          const summary = getCrewShiftSummary(crew);
          const currentShift = getCurrentShiftType(crew);

          return (
            <div key={crew} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Crew Header */}
              <div className={`p-6 ${
                crew === 'A' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                crew === 'B' ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                'bg-gradient-to-r from-indigo-400 to-indigo-500'
              }`}>
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-2xl font-bold">Crew {crew}</h3>
                    <p className="text-sm opacity-90">{members.length} members</p>
                  </div>
                  <Users className="h-10 w-10 opacity-80" />
                </div>
                <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm text-white opacity-90">Today's Shift</p>
                  <p className="text-xl font-bold text-white capitalize">{currentShift}</p>
                </div>
              </div>

              {/* Shift Summary */}
              <div className="p-6 border-b">
                <h4 className="font-semibold text-gray-900 mb-3">Shift Summary (3 months)</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Shifts:</span>
                    <span className="font-semibold">{summary.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-yellow-400"></div>
                      <span className="text-gray-600">Morning:</span>
                    </span>
                    <span className="font-semibold">{summary.morning}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-orange-400"></div>
                      <span className="text-gray-600">Evening:</span>
                    </span>
                    <span className="font-semibold">{summary.evening}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-indigo-400"></div>
                      <span className="text-gray-600">Night:</span>
                    </span>
                    <span className="font-semibold">{summary.night}</span>
                  </div>
                </div>
              </div>

              {/* Crew Members */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Members</h4>
                {members.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No members assigned
                  </p>
                ) : (
                  <div className="space-y-2">
                    {members.map(member => (
                      <div key={member._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rotation Pattern Info */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Shift Rotation Pattern</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="font-bold text-yellow-700">A</span>
              </div>
              <span className="font-semibold">Crew A Pattern</span>
            </div>
            <ol className="space-y-1 text-sm text-gray-600">
              <li>1. Morning (4 days) → 1 off</li>
              <li>2. Evening (4 days) → 1 off</li>
              <li>3. Night (4 days) → 2 off</li>
              <li className="text-gray-500 italic">Repeats...</li>
            </ol>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="font-bold text-orange-700">B</span>
              </div>
              <span className="font-semibold">Crew B Pattern</span>
            </div>
            <ol className="space-y-1 text-sm text-gray-600">
              <li>1. Evening (4 days) → 1 off</li>
              <li>2. Night (4 days) → 2 off</li>
              <li>3. Morning (4 days) → 1 off</li>
              <li className="text-gray-500 italic">Repeats...</li>
            </ol>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="font-bold text-indigo-700">C</span>
              </div>
              <span className="font-semibold">Crew C Pattern</span>
            </div>
            <ol className="space-y-1 text-sm text-gray-600">
              <li>1. Night (4 days) → 2 off</li>
              <li>2. Morning (4 days) → 1 off</li>
              <li>3. Evening (4 days) → 1 off</li>
              <li className="text-gray-500 italic">Repeats...</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewSchedule;