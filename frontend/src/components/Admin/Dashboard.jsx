import React, { useState } from 'react';
import { Users, Calendar, RefreshCw } from 'lucide-react';
import CrewSchedule from './CrewSchedule';
import SwapRequests from './SwapRequests';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('crews');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage crew schedules and swap requests</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('crews')}
              className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'crews'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Crew Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab('swaps')}
              className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'swaps'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <RefreshCw className="h-5 w-5" />
              <span>Swap Requests</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'crews' && <CrewSchedule />}
        {activeTab === 'swaps' && <SwapRequests />}
      </div>
    </div>
  );
};

export default Dashboard;