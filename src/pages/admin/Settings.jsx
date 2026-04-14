import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TfiSettings, 
  TfiShield, 
  TfiEmail, 
  TfiServer, 
  TfiBolt, 
  TfiReload,
  TfiAngleRight,
  TfiPulse,
  TfiTarget,
  TfiLock,
  TfiWrite
} from 'react-icons/tfi';
import { toast } from 'sonner';
import systemService from '../../services/systemService';

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: 'InnovAIte Interview Guardian',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    mfaRequired: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await systemService.getSettings();
      setSettings(res.data);
    } catch (err) {
      toast.error('ERROR: Unable to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await systemService.updateSettings(settings);
      toast.success('SYSTEM SETTINGS UPDATED: Update successful');
    } catch (err) {
      toast.error(err.response?.data?.error || 'ERROR: Unable to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] elite-glass-panel border-white/5 bg-black/40 mx-10">
        <TfiReload className="text-5xl text-red-600 animate-spin mb-8" />
        <p className="text-[11px] font-black uppercase tracking-[1em] text-white/40 italic">Loading System Settings...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20 px-6 max-w-5xl mx-auto">
      {/* Header Hub */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
        <div>
            <h1 className="elite-tactical-header">System Settings</h1>
            <p className="elite-sub-header mt-2 text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Platform Management · Global Configuration</p>
        </div>
        
        <div className="flex gap-4">
            <div className="elite-glass-panel py-4 px-8 border-red-600/20 bg-red-600/5 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 italic shadow-2xl">
                <TfiShield className="animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.4)]" /> ADMIN ACCESS VERIFIED
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <SettingsCard icon={<TfiServer />} title="General Settings" description="General system-wide configuration">
          <SettingRow
            label="Platform Name"
            value={settings.siteName}
            type="text"
            onChange={(val) => setSettings(prev => ({ ...prev, siteName: val }))}
          />
          <SettingRow
            label="Maintenance Mode"
            value={settings.maintenanceMode}
            type="toggle"
            onChange={() => handleToggle('maintenanceMode')}
            description="Disable all non-admin access points across the platform"
          />
          <SettingRow
            label="Allow Registration"
            value={settings.allowRegistration}
            type="toggle"
            onChange={() => handleToggle('allowRegistration')}
            description="Allow new users to create accounts in the platform"
          />
        </SettingsCard>

        <SettingsCard icon={<TfiLock />} title="Security Settings" description="User authentication and access control">
          <SettingRow
            label="Two-Factor Authentication (2FA)"
            value={settings.mfaRequired}
            type="toggle"
            onChange={() => handleToggle('mfaRequired')}
            description="Require secondary authentication for all user accounts"
          />
        </SettingsCard>

        <SettingsCard icon={<TfiEmail />} title="Notification Settings" description="Automated system and user notifications">
          <SettingRow
            label="Email Notifications"
            value={settings.emailNotifications}
            type="toggle"
            onChange={() => handleToggle('emailNotifications')}
            description="Send email notifications for important platform activity"
          />
        </SettingsCard>
      </div>

      <div className="mt-16 flex flex-col items-center">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full max-w-md bg-white text-black hover:bg-red-600 hover:text-white py-8 rounded-[2.5rem] font-black uppercase italic tracking-[0.5em] shadow-2xl shadow-red-600/10 flex items-center justify-center gap-6 transition-all group"
            >
                {saving ? (
                    <TfiReload className="animate-spin text-2xl" />
                ) : (
                    <>
                        SAVE SETTINGS <TfiBolt className="text-xl animate-pulse group-hover:text-white" />
                    </>
                )}
            </motion.button>
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-[1em] mt-10 italic opacity-20">System Version 4.0</p>
      </div>
    </div>
  );
}

function SettingsCard({ icon, title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="elite-glass-panel p-12 bg-white border-gray-100 relative group shadow-2xl overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/[0.05] blur-[80px] pointer-events-none group-hover:bg-red-600/[0.1] transition-all" />
      <div className="flex items-center gap-8 mb-12 border-l-4 border-red-600 pl-8 relative z-10 transition-all group-hover:pl-10">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-red-600 text-2xl shadow-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-700">
          {icon}
        </div>
        <div>
          <h3 className="text-[14px] font-black uppercase italic tracking-widest text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{title}</h3>
          <p className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] italic">{description}</p>
        </div>
      </div>
      <div className="space-y-4 relative z-10">{children}</div>
    </motion.div>
  );
}

function SettingRow({ label, value, type, onChange, description }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-8 border-b border-white/5 last:border-0 group/row">
      <div className="mb-4 md:mb-0">
        <label className="text-[12px] font-black uppercase tracking-widest text-gray-950 italic group-hover/row:text-red-600 transition-colors">{label}</label>
        {description && <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest italic mt-1.5 opacity-80">{description}</p>}
      </div>
      
      {type === 'toggle' ? (
        <button
          onClick={onChange}
          className={`relative w-20 h-10 rounded-full transition-all duration-500 focus:outline-none border-2 shadow-inner ${value ? 'bg-red-600 border-red-700' : 'bg-gray-100 border-gray-200'}`}
        >
          <motion.span 
            animate={{ x: value ? 40 : 4 }}
            className={`absolute top-1.5 w-6 h-6 rounded-full shadow-2xl transition-colors ${value ? 'bg-white' : 'bg-gray-400'}`} 
          />
        </button>
      ) : (
        <div className="w-full md:w-80 relative group/input">
            <TfiWrite className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover/input:text-red-600 transition-colors" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl pl-16 pr-6 text-[11px] font-black text-gray-900 italic uppercase tracking-widest focus:border-red-600/40 focus:bg-white transition-all shadow-sm"
            />
        </div>
      )}
    </div>
  );
}
