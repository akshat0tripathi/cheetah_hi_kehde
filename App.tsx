
import React, { useState, useMemo, useCallback } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Profile, MbtiType, BigFive, BigFiveTrait } from './types';
import { MBTI_TYPES, BIG_FIVE_TRAITS } from './constants';
import useLocalStorage from './hooks/useLocalStorage';

// --- HELPER FUNCTIONS & ICONS ---

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);


// --- UI SUB-COMPONENTS ---

interface ProfileCardProps {
  profile: Profile;
  isSelected: boolean;
  onSelect: () => void;
}
const ProfileCard: React.FC<ProfileCardProps> = ({ profile, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
        isSelected ? 'bg-brand-primary' : 'hover:bg-gray-700'
      }`}
    >
      <img src={profile.image} alt={profile.nickname} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-600" />
      <div>
        <h3 className="font-bold text-white">{profile.nickname}</h3>
        <p className="text-sm text-gray-400">{profile.mbti}</p>
      </div>
    </div>
  );
};


interface ProfileDetailViewProps {
  profile: Profile;
  onEdit: () => void;
  onDelete: () => void;
}
const ProfileDetailView: React.FC<ProfileDetailViewProps> = ({ profile, onEdit, onDelete }) => {
  const chartData = useMemo(() => BIG_FIVE_TRAITS.map(trait => ({
    subject: trait.name,
    value: profile.bigFive[trait.key],
    fullMark: 100,
  })), [profile]);

  return (
    <div className="p-8 animate-fade-in h-full overflow-y-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <img src={profile.image} alt={profile.nickname} className="w-24 h-24 rounded-full object-cover mr-6 border-4 border-gray-700" />
          <div>
            <h1 className="text-4xl font-bold text-white">{profile.nickname}</h1>
            <p className="text-xl text-brand-secondary font-semibold">{profile.mbti}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><EditIcon className="w-6 h-6 text-gray-400" /></button>
          <button onClick={onDelete} className="p-2 rounded-full hover:bg-gray-700 transition-colors"><TrashIcon className="w-6 h-6 text-red-500" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Big 5 Personality</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#4b5563" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#d1d5db' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={profile.nickname} dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <div><h3 className="font-bold text-lg text-white">Relation</h3><p className="text-gray-300">{profile.relation}</p></div>
            <div><h3 className="font-bold text-lg text-white">Appearance</h3><p className="text-gray-300 whitespace-pre-wrap">{profile.appearance}</p></div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg md:col-span-2">
            <h3 className="font-bold text-lg mb-2 text-white">Notes</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{profile.notes}</p>
        </div>
      </div>
    </div>
  );
};


interface ProfileFormProps {
  initialProfile?: Profile | null;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}
const ProfileForm: React.FC<ProfileFormProps> = ({ initialProfile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Profile, 'id' | 'createdAt'>>({
    nickname: initialProfile?.nickname || '',
    image: initialProfile?.image || 'https://picsum.photos/200',
    mbti: initialProfile?.mbti || MbtiType.INFP,
    bigFive: initialProfile?.bigFive || { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 },
    relation: initialProfile?.relation || '',
    appearance: initialProfile?.appearance || '',
    notes: initialProfile?.notes || '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBigFiveChange = (trait: BigFiveTrait, value: number) => {
    setFormData(prev => ({ ...prev, bigFive: { ...prev.bigFive, [trait]: value } }));
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setFormData(prev => ({ ...prev, image: base64 }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData: Profile = {
      id: initialProfile?.id || crypto.randomUUID(),
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      ...formData,
    };
    onSave(profileData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 animate-fade-in space-y-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-white">{initialProfile ? 'Edit Profile' : 'Create New Profile'}</h1>
      
      <div className="flex items-center space-x-6">
        <img src={formData.image} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"/>
        <div>
          <label htmlFor="image-upload" className="cursor-pointer bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-secondary transition-colors">
            Upload Image
          </label>
          <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden"/>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 font-semibold text-gray-300">Nickname</label>
          <input type="text" name="nickname" value={formData.nickname} onChange={handleInputChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-300">Relation</label>
          <input type="text" name="relation" value={formData.relation} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-300">MBTI Type</label>
          <select name="mbti" value={formData.mbti} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:outline-none">
            {MBTI_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Big 5 Traits</h2>
        <div className="space-y-4">
          {BIG_FIVE_TRAITS.map(trait => (
            <div key={trait.key}>
              <label className="flex justify-between items-center font-semibold text-gray-300">
                <span>{trait.name}</span>
                <span className="text-brand-primary font-bold">{formData.bigFive[trait.key]}</span>
              </label>
              <input type="range" min="0" max="100" value={formData.bigFive[trait.key]} onChange={e => handleBigFiveChange(trait.key, parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
            </div>
          ))}
        </div>
      </div>
      
      <div>
          <label className="block mb-2 font-semibold text-gray-300">Appearance</label>
          <textarea name="appearance" value={formData.appearance} onChange={handleInputChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
      </div>
      
      <div>
          <label className="block mb-2 font-semibold text-gray-300">Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={5} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:outline-none"/>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors">Cancel</button>
        <button type="submit" className="px-6 py-2 rounded-md bg-brand-primary hover:bg-brand-secondary transition-colors font-semibold">Save Profile</button>
      </div>
    </form>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [profiles, setProfiles] = useLocalStorage<Profile[]>('persona-profiles', []);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list'); // 'list' also covers detail view

  const sortedProfiles = useMemo(() => 
    [...profiles].sort((a, b) => a.nickname.localeCompare(b.nickname)),
  [profiles]);

  const selectedProfile = useMemo(() => 
    profiles.find(p => p.id === selectedProfileId), 
  [profiles, selectedProfileId]);

  const handleSaveProfile = useCallback((profile: Profile) => {
    setProfiles(prev => {
      const index = prev.findIndex(p => p.id === profile.id);
      if (index > -1) {
        const newProfiles = [...prev];
        newProfiles[index] = profile;
        return newProfiles;
      }
      return [...prev, profile];
    });
    setSelectedProfileId(profile.id);
    setView('list');
  }, [setProfiles]);
  
  const handleDeleteProfile = useCallback(() => {
    if (selectedProfileId && window.confirm('Are you sure you want to delete this profile?')) {
      setProfiles(prev => prev.filter(p => p.id !== selectedProfileId));
      setSelectedProfileId(null);
    }
  }, [selectedProfileId, setProfiles]);
  
  const handleAddNew = () => {
    setSelectedProfileId(null);
    setView('form');
  };
  
  const handleEdit = () => {
    if (selectedProfile) {
      setView('form');
    }
  };

  const handleCancelForm = () => {
    setView('list');
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <aside className="w-1/4 max-w-sm bg-gray-800 p-4 border-r border-gray-700 flex flex-col">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-white">Persona Profiles</h1>
        </header>
        <button onClick={handleAddNew} className="w-full flex items-center justify-center p-3 mb-4 bg-brand-primary rounded-lg text-white font-semibold hover:bg-brand-secondary transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Profile
        </button>
        <div className="flex-grow overflow-y-auto space-y-2 pr-2">
          {sortedProfiles.map(p => (
            <ProfileCard 
              key={p.id} 
              profile={p} 
              isSelected={p.id === selectedProfileId} 
              onSelect={() => {
                setSelectedProfileId(p.id);
                setView('list');
              }}
            />
          ))}
        </div>
      </aside>

      <main className="flex-1 bg-gray-900">
        {view === 'list' && selectedProfile && (
          <ProfileDetailView 
            profile={selectedProfile}
            onEdit={handleEdit}
            onDelete={handleDeleteProfile}
          />
        )}
        {view === 'list' && !selectedProfile && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-semibold">Welcome to Persona Profiles</h2>
              <p>Select a profile from the list or create a new one.</p>
            </div>
          </div>
        )}
        {view === 'form' && (
          <ProfileForm 
            initialProfile={selectedProfile} 
            onSave={handleSaveProfile} 
            onCancel={handleCancelForm}
          />
        )}
      </main>
    </div>
  );
};

export default App;
