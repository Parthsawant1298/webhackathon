"use client";

import { ArrowLeft, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SupplierSettings = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    marketingEmails: false
  });

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    // TODO: Implement save settings API call
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-white">
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => router.push('/supplier/dashboard')}
              className="mb-6 flex items-center text-green-600 hover:text-green-800 transition-colors"
            >
              <ArrowLeft size={18} className="mr-1" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-200">
              <div className="flex items-center mb-6">
                <Settings className="h-6 w-6 text-green-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Supplier Settings</h1>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive order and system updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={() => handleSettingChange('emailNotifications')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">SMS Notifications</h3>
                        <p className="text-sm text-gray-500">Receive urgent updates via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={() => handleSettingChange('smsNotifications')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Order Updates</h3>
                        <p className="text-sm text-gray-500">Get notified about new orders and changes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.orderUpdates}
                        onChange={() => handleSettingChange('orderUpdates')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Marketing Emails</h3>
                        <p className="text-sm text-gray-500">Receive promotional and marketing content</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={() => handleSettingChange('marketingEmails')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupplierSettings;
