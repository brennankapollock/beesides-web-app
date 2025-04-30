import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { UserIcon, BellIcon, EyeIcon, PaletteIcon, LinkIcon, KeyIcon, LogOutIcon, CheckIcon, ChevronRightIcon, MoonIcon, SunIcon, GlobeIcon, VolumeIcon, ShieldIcon } from 'lucide-react';
export function Settings() {
  const [activeSection, setActiveSection] = useState('account');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const sections = [{
    id: 'account',
    name: 'Account',
    icon: <UserIcon size={20} />
  }, {
    id: 'notifications',
    name: 'Notifications',
    icon: <BellIcon size={20} />
  }, {
    id: 'privacy',
    name: 'Privacy',
    icon: <EyeIcon size={20} />
  }, {
    id: 'appearance',
    name: 'Appearance',
    icon: <PaletteIcon size={20} />
  }, {
    id: 'connections',
    name: 'Connected Accounts',
    icon: <LinkIcon size={20} />
  }, {
    id: 'security',
    name: 'Security',
    icon: <ShieldIcon size={20} />
  }];
  const renderAccountSection = () => <>
      <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm opacity-70 mb-1">
                Display Name
              </label>
              <input type="text" defaultValue="John Doe" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm opacity-70 mb-1">Username</label>
              <input type="text" defaultValue="musiclover42" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm opacity-70 mb-1">Email</label>
              <input type="email" defaultValue="john.doe@example.com" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm opacity-70 mb-1">Bio</label>
              <textarea defaultValue="Music enthusiast with a passion for discovering new sounds and artists. Collector of vinyl and digital music across various genres." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]" />
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Profile Picture</h3>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-xl font-bold">
              JD
            </div>
            <div>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors mb-2 w-full">
                Upload New Picture
              </button>
              <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full">
                Remove
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Danger Zone</h3>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            Delete Account
          </button>
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </>;
  const renderNotificationsSection = () => <>
      <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New followers</p>
                <p className="text-sm opacity-70">
                  Receive emails when someone follows you
                </p>
              </div>
              <button onClick={() => setEmailNotifications(!emailNotifications)} className={`w-12 h-6 rounded-full relative transition-colors ${emailNotifications ? 'bg-black' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailNotifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm opacity-70">
                  Receive a weekly summary of new music and activity
                </p>
              </div>
              <button className={`w-12 h-6 rounded-full relative transition-colors ${emailNotifications ? 'bg-black' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailNotifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Push Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable push notifications</p>
                <p className="text-sm opacity-70">
                  Receive notifications on your device
                </p>
              </div>
              <button onClick={() => setPushNotifications(!pushNotifications)} className={`w-12 h-6 rounded-full relative transition-colors ${pushNotifications ? 'bg-black' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${pushNotifications ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Notification types</p>
              <div className="flex flex-col gap-3 pl-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-black" />
                  <span>New followers</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-black" />
                  <span>Comments on your reviews</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-black" />
                  <span>Mentions</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded text-black" />
                  <span>New music recommendations</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </>;
  const renderPrivacySection = () => <>
      <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Profile Visibility</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input type="radio" name="visibility" value="public" checked={profileVisibility === 'public'} onChange={() => setProfileVisibility('public')} />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-sm opacity-70">
                    Anyone can view your profile and activity
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="visibility" value="followers" checked={profileVisibility === 'followers'} onChange={() => setProfileVisibility('followers')} />
                <div>
                  <p className="font-medium">Followers Only</p>
                  <p className="text-sm opacity-70">
                    Only people who follow you can view your profile
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="visibility" value="private" checked={profileVisibility === 'private'} onChange={() => setProfileVisibility('private')} />
                <div>
                  <p className="font-medium">Private</p>
                  <p className="text-sm opacity-70">
                    Only you can view your profile
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Activity Sharing</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Share my listening activity</span>
              <button className="w-12 h-6 rounded-full relative bg-black">
                <span className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white" />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span>Share my ratings</span>
              <button className="w-12 h-6 rounded-full relative bg-black">
                <span className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white" />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span>Share my reviews</span>
              <button className="w-12 h-6 rounded-full relative bg-black">
                <span className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white" />
              </button>
            </label>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Data & Privacy</h3>
          <div className="space-y-4">
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full text-left flex justify-between items-center">
              <span>Download my data</span>
              <ChevronRightIcon size={18} />
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full text-left flex justify-between items-center">
              <span>Privacy policy</span>
              <ChevronRightIcon size={18} />
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </>;
  const renderAppearanceSection = () => <>
      <h2 className="text-2xl font-bold mb-6">Appearance Settings</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Theme</h3>
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => setDarkMode(false)} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${!darkMode ? 'border-black' : 'border-transparent'}`}>
              <SunIcon size={24} />
              <span className="font-medium">Light</span>
            </button>
            <button onClick={() => setDarkMode(true)} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${darkMode ? 'border-black' : 'border-transparent'}`}>
              <MoonIcon size={24} />
              <span className="font-medium">Dark</span>
            </button>
            <button className="p-4 rounded-xl border-2 border-transparent flex flex-col items-center gap-2">
              <div className="flex">
                <SunIcon size={24} className="mr-1" />
                <MoonIcon size={24} />
              </div>
              <span className="font-medium">System</span>
            </button>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Language</h3>
          <div className="flex items-center gap-2 w-full">
            <GlobeIcon size={20} className="text-gray-500" />
            <select className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Audio Quality</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium">High Quality Streaming</p>
                <p className="text-sm opacity-70">
                  Stream music at highest quality
                </p>
              </div>
              <button className="w-12 h-6 rounded-full relative bg-black">
                <span className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white" />
              </button>
            </label>
            <div className="pt-2">
              <label className="block text-sm opacity-70 mb-1">
                Volume Normalization
              </label>
              <div className="flex items-center gap-4">
                <VolumeIcon size={20} className="text-gray-500" />
                <input type="range" className="flex-1" defaultValue={80} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </>;
  const renderConnectionsSection = () => <>
      <h2 className="text-2xl font-bold mb-6">Connected Accounts</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Music Services</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <p className="font-medium">Spotify</p>
                  <p className="text-sm opacity-70">Connected</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                Disconnect
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <p className="font-medium">Apple Music</p>
                  <p className="text-sm opacity-70">Not connected</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm">
                Connect
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Social Media</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  F
                </div>
                <div>
                  <p className="font-medium">Facebook</p>
                  <p className="text-sm opacity-70">Not connected</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm">
                Connect
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                  X
                </div>
                <div>
                  <p className="font-medium">X (Twitter)</p>
                  <p className="text-sm opacity-70">Not connected</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </>;
  const renderSecuritySection = () => <>
      <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm opacity-70 mb-1">
                Current Password
              </label>
              <input type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm opacity-70 mb-1">
                New Password
              </label>
              <input type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm opacity-70 mb-1">
                Confirm New Password
              </label>
              <input type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors w-full">
              Update Password
            </button>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Two-Factor Authentication</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable 2FA</p>
                <p className="text-sm opacity-70">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button className="w-12 h-6 rounded-full relative bg-gray-300">
                <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold mb-4">Sessions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-xs opacity-70">
                  Chrome on MacOS • New York, USA
                </p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Active Now
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">iPhone 13</p>
                <p className="text-xs opacity-70">iOS App • New York, USA</p>
              </div>
              <span className="text-xs opacity-70">2 days ago</span>
            </div>
            <button className="px-4 py-2 text-red-500 hover:underline transition-colors text-sm">
              Log out of all other devices
            </button>
          </div>
        </div>
      </div>
    </>;
  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'privacy':
        return renderPrivacySection();
      case 'appearance':
        return renderAppearanceSection();
      case 'connections':
        return renderConnectionsSection();
      case 'security':
        return renderSecuritySection();
      default:
        return renderAccountSection();
    }
  };
  return <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-20 md:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-mono font-bold mb-8">
          Settings
        </h1>
        <div className="md:flex gap-8">
          {/* Sidebar Navigation */}
          <div className="md:w-64 mb-6 md:mb-0">
            <div className="bg-gray-50 rounded-xl p-4">
              <nav className="space-y-1">
                {sections.map(section => <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeSection === section.id ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
                    {section.icon}
                    <span>{section.name}</span>
                  </button>)}
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-gray-100 transition-colors">
                  <LogOutIcon size={20} />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>
    </Layout>;
}