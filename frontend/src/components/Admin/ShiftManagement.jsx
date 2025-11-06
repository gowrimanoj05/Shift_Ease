import React, { useState, useEffect } from 'react';
import { shiftAPI, authAPI } from '../../services/api';
import { Plus, Edit, Trash2, X, Save, Calendar, Sparkles, AlertCircle } from 'lucide-react';

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [formMode, setFormMode] = useState('auto'); // 'auto' or 'manual'
  const [formData, setFormData] = useState({
    userId: '',
    date: '',
    startTime: '06:00',
    endTime: '14:00',
    shiftType: 'morning',
    department: '',
    notes: '',
    autoSchedule: true
  });

  useEffect(() => {
    loadShifts();
    loadUsers();
  }, []);

  const loadShifts = async () => {
    try {
      setLoading(true);
      const response = await shiftAPI.getAllShifts();
      setShifts(response.data.shifts);
    } catch (error) {
      console.error('Error loading shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-fill department when user is selected
    if (name === 'userId') {
      const selectedUser = users.find(u => u._id === value);
      setFormData({
        ...formData,
        userId: value,
        department: selectedUser ? selectedUser.department : formData.department
      });
    } else if (name === 'shiftType') {
      // Auto-adjust times based on shift type
      const timings = {
        morning: { startTime: '06:00', endTime: '14:00' },
        evening: { startTime: '14:00', endTime: '22:00' },
        night: { startTime: '22:00', endTime: '06:00' }
      };
      setFormData({
        ...formData,
        shiftType: value,
        ...(formMode === 'manual' ? timings[value] : {})
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleModeChange = (mode) => {
    setFormMode(mode);
    setFormData({
      ...formData,
      autoSchedule: mode === 'auto'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingShift) {
        await shiftAPI.updateShift(editingShift._id, formData);
        alert('Shift updated successfully!');
      } else {
        const response = await shiftAPI.createShift(formData);
        if (formMode === 'auto') {
          alert(`✨ Successfully created ${response.data.count} shifts for complete rotation!`);
        } else {
          alert('Shift created successfully!');
        }
      }
      loadShifts();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save shift');
    }
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setFormMode('manual');
    setFormData({
      userId: shift.userId._id,
      date: new Date(shift.date).toISOString().split('T')[0],
      startTime: shift.startTime,
      endTime: shift.endTime,
      shiftType: shift.shiftType,
      department: shift.department,
      notes: shift.notes || '',
      autoSchedule: false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      try {
        await shiftAPI.deleteShift(id);
        loadShifts();
        alert('Shift deleted successfully!');
      } catch (error) {
        alert('Failed to delete shift');
      }
    }
  };

  const handleDeleteUserShifts = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (window.confirm(`Are you sure you want to delete ALL future shifts for ${user?.name}?`)) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await shiftAPI.deleteUserShifts(userId, today);
        loadShifts();
        alert(response.data.message);
      } catch (error) {
        alert('Failed to delete shifts');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      date: '',
      startTime: '06:00',
      endTime: '14:00',
      shiftType: 'morning',
      department: '',
      notes: '',
      autoSchedule: true
    });
    setFormMode('auto');
    setEditingShift(null);
    setShowForm(false);
  };

  const getUserShiftCount = (userId) => {
    return shifts.filter(s => s.userId._id === userId).length;
  };

  if (loading) {
    return <div className="text-center py-8">Loading shifts...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Shifts</h2>
          <p className="text-sm text-gray-600 mt-1">
            {users.length} employees • {shifts.length} total shifts
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule Shifts</span>
        </button>
      </div>

      {/* Shift Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingShift ? 'Edit Shift' : 'Schedule New Shifts'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mode Toggle (only for new shifts) */}
            {!editingShift && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Scheduling Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleModeChange('auto')}
                    className={`p-4 border-2 rounded-lg transition ${
                      formMode === 'auto'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className={`h-5 w-5 ${formMode === 'auto' ? 'text-primary' : 'text-gray-400'}`} />
                      <span className="font-semibold">Auto Schedule</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Creates complete rotation: 4 Morning → 1 off → 4 Evening → 1 off → 4 Night → 2 off
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('manual')}
                    className={`p-4 border-2 rounded-lg transition ${
                      formMode === 'manual'
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className={`h-5 w-5 ${formMode === 'manual' ? 'text-primary' : 'text-gray-400'}`} />
                      <span className="font-semibold">Manual</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Create a single shift for a specific date
                    </p>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Employee</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.position} ({getUserShiftCount(user._id)} shifts)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formMode === 'auto' ? 'Start Date *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {formMode === 'auto' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Rotation will start from this date
                    </p>
                  )}
                </div>

                {formMode === 'manual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift Type *
                    </label>
                    <select
                      name="shiftType"
                      value={formData.shiftType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="morning">Morning (6:00 - 14:00)</option>
                      <option value="evening">Evening (14:00 - 22:00)</option>
                      <option value="night">Night (22:00 - 6:00)</option>
                    </select>
                  </div>
                )}
              </div>

              {formMode === 'manual' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  readOnly={formData.userId !== ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                  placeholder="Auto-filled from employee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={formMode === 'auto' ? 'Notes will be added automatically' : 'Add any additional notes...'}
                />
              </div>

              {formMode === 'auto' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Auto-scheduling will create:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>4 days of Morning shift (6:00 - 14:00)</li>
                        <li>1 day off</li>
                        <li>4 days of Evening shift (14:00 - 22:00)</li>
                        <li>1 day off</li>
                        <li>4 days of Night shift (22:00 - 6:00)</li>
                        <li>2 days off</li>
                      </ul>
                      <p className="mt-2 font-semibold">Total: 12 working days + 4 off days = 16 days</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  <Save className="h-5 w-5" />
                  <span>
                    {editingShift ? 'Update Shift' : formMode === 'auto' ? 'Create Rotation' : 'Create Shift'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shifts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No shifts found. Click "Schedule Shifts" to create them.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {shift.userId?.name}
                      </div>
                      <div className="text-sm text-gray-500">{shift.userId?.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(shift.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shift.startTime} - {shift.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        shift.shiftType === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                        shift.shiftType === 'evening' ? 'bg-orange-100 text-orange-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {shift.shiftType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shift.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(shift)}
                        className="text-primary hover:text-blue-700 mr-3"
                        title="Edit shift"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(shift._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete shift"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Summary Cards */}
      {users.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Employee Shift Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => {
              const userShifts = shifts.filter(s => s.userId._id === user._id);
              const upcomingShifts = userShifts.filter(s => new Date(s.date) >= new Date());
              
              return (
                <div key={user._id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-500">{user.position}</p>
                    </div>
                    {upcomingShifts.length > 0 && (
                      <button
                        onClick={() => handleDeleteUserShifts(user._id)}
                        className="text-xs text-red-600 hover:text-red-800"
                        title="Delete all future shifts"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Shifts:</span>
                    <span className="font-semibold">{userShifts.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Upcoming:</span>
                    <span className="font-semibold text-primary">{upcomingShifts.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;