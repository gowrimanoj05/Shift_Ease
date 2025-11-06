import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { shiftAPI } from '../../services/api';
import { User, Mail, Briefcase, Building, Users, Calendar, Shield, Edit2, Save, X } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    totalShifts: 0,
    upcomingShifts: 0,
    completedShifts: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    crew: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        department: user.department,
        position: user.position,
        crew: user.crew
      });
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await shiftAPI.getMyShifts();
      const shifts = response.data.shifts;
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = shifts.filter(s => new Date(s.date) >= now);
      const completed = shifts.filter(s => new Date(s.date) < now);

      setStats({
        totalShifts: shifts.length,
        upcomingShifts: upcoming.length,
        completedShifts: completed.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    // TODO: Implement profile update API
    alert('Profile update functionality will be implemented');
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      position: user.position,
      crew: user.crew
    });
    setEditing(false);
  };

  if (!user) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with Avatar */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <User className="h-10 w-10 text-blue-500" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-blue-100">{user.position}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                      {user.role === 'admin' ? 'Administrator' : 'Employee'}
                    </span>
                    {user.crew && (
                      <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                        Crew {user.crew}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 text-primary hover:text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Full Name</span>
                    </div>
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-gray-900 pl-6">{user.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </div>
                  </label>
                  <p className="text-gray-900 pl-6">{user.email}</p>
                  <p className="text-xs text-gray-500 pl-6 mt-1">Email cannot be changed</p>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Department</span>
                    </div>
                  </label>
                  <p className="text-gray-900 pl-6">{user.department}</p>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Position</span>
                    </div>
                  </label>
                  <p className="text-gray-900 pl-6">{user.position}</p>
                </div>

                {/* Crew */}
                {user.crew && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Crew Assignment</span>
                      </div>
                    </label>
                    <p className="text-gray-900 pl-6">Crew {user.crew}</p>
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Role</span>
                    </div>
                  </label>
                  <p className="text-gray-900 pl-6 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Statistics Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Shift Statistics</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Shifts</span>
                <span className="text-2xl font-bold text-blue-600">{stats.totalShifts}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Upcoming</span>
                <span className="text-2xl font-bold text-green-600">{stats.upcomingShifts}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-2xl font-bold text-gray-600">{stats.completedShifts}</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => alert('Change password functionality coming soon')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
              >
                Change Password
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Crew Info */}
          {user.crew && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Crew Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Your Crew</span>
                  <span className="font-semibold text-gray-900">Crew {user.crew}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {user.crew === 'A' && 'Rotation: Morning → Evening → Night'}
                  {user.crew === 'B' && 'Rotation: Evening → Night → Morning'}
                  {user.crew === 'C' && 'Rotation: Night → Morning → Evening'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;