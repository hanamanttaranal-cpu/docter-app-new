import React, { useState } from 'react';
import { User, DoctorProfile, PatientProfile } from '../types';
import { INITIAL_DOCTORS, INITIAL_PATIENTS } from '../data/mockData';
import { Heart, Activity, UserCheck, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User, isCustomDoctor?: DoctorProfile) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<'PATIENT' | 'DOCTOR' | null>(null);
  const [showGoogleAuth, setShowGoogleAuth] = useState(false);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customSpecialization, setCustomSpecialization] = useState('General Practice');

  const handleSelectRole = (role: 'PATIENT' | 'DOCTOR') => {
    setSelectedRole(role);
    setShowGoogleAuth(true);
  };

  const handleSelectPredefinedAccount = (profile: any) => {
    const userRole = selectedRole as 'PATIENT' | 'DOCTOR';
    const loggedUser: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: userRole,
      avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    };
    onLogin(loggedUser);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    const userRole = selectedRole as 'PATIENT' | 'DOCTOR';
    const uniqueId = `usr-${userRole.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    
    const loggedUser: User = {
      id: uniqueId,
      name: customName,
      email: customEmail,
      role: userRole,
      avatarUrl: userRole === 'DOCTOR' 
        ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200' 
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    };

    let customDoc: DoctorProfile | undefined;
    if (userRole === 'DOCTOR') {
      customDoc = {
        id: uniqueId,
        name: customName,
        email: customEmail,
        specialization: customSpecialization,
        diseasesCovered: ["General consult", "Flu and Cold", "Medication review", "Wellness advisory"],
        experienceYears: 5,
        consultationFee: 100,
        rating: 5.0,
        reviewsCount: 1,
        isVerified: true,
        avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
      };
    }

    onLogin(loggedUser, customDoc);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" id="login-container">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {!showGoogleAuth ? (
          <div className="space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/10 mb-4">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Welcome to MedConsult
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium">
                Select your designated access portal to connect and consult in real-time
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Patient Card Choice */}
              <button
                onClick={() => handleSelectRole('PATIENT')}
                className="group relative bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 p-6 rounded-2xl text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-hidden"
                id="select-patient-button"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-md font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  I am a Patient
                </h3>
                <p className="mt-2 text-xs text-gray-500 font-medium leading-relaxed">
                  Book secure appointments, receive diagnostics, explore specialized clinical divisions, and chat directly with medical experts.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter Boarding Portal <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Doctor Card Choice */}
              <button
                onClick={() => handleSelectRole('DOCTOR')}
                className="group relative bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 p-6 rounded-2xl text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-hidden"
                id="select-doctor-button"
              >
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-md font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                  I am a Doctor
                </h3>
                <p className="mt-2 text-xs text-gray-500 font-medium leading-relaxed">
                  Authorize credentials, manage patient appointment logs, approve clinical checkups, and start human-to-human consults.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-teal-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter Practicing Portal <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => {
                setShowGoogleAuth(false);
                setIsCreatingCustom(false);
              }}
              className="text-2xs text-gray-400 hover:text-gray-600 font-semibold flex items-center gap-1"
            >
              ← Go back to role selector
            </button>

            <div className="text-center">
              <div className="text-2xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 max-w-max mx-auto px-2.5 py-1 rounded-md mb-2">
                Simulated Google Auth Service
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Continue to MedConsult with Google
              </h3>
              <p className="text-2xs text-gray-400 max-w-sm mx-auto mt-1 leading-snug">
                To facilitate secure, bi-directional clinical queues, authorize single sign-on access to your credential.
              </p>
            </div>

            {!isCreatingCustom ? (
              <div className="space-y-4 pt-4">
                <p className="text-3xs font-bold text-gray-400 uppercase tracking-wider text-center">
                  Select a Google account to sign up / sign in
                </p>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedRole === 'PATIENT' ? (
                    INITIAL_PATIENTS.map((pat) => (
                      <button
                        key={pat.id}
                        onClick={() => handleSelectPredefinedAccount(pat)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-emerald-500/30 hover:bg-emerald-50/20 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={pat.avatarUrl}
                            alt={pat.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-800">{pat.name}</p>
                            <p className="text-3xs font-mono text-gray-400">{pat.email}</p>
                          </div>
                        </div>
                        <div className="text-3xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          Use This Account
                        </div>
                      </button>
                    ))
                  ) : (
                    INITIAL_DOCTORS.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleSelectPredefinedAccount(doc)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-teal-500/30 hover:bg-teal-50/20 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.avatarUrl}
                            alt={doc.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-800">{doc.name}</p>
                            <span className="text-4xs font-semibold text-teal-600">{doc.specialization} expert</span>
                            <p className="text-3xs font-mono text-gray-400">{doc.email}</p>
                          </div>
                        </div>
                        <div className="text-3xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-sm">
                          Login Doctor
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 flex flex-col items-center">
                  <span className="text-3xs font-bold text-gray-400 uppercase tracking-widest mb-3">Or create a custom profile</span>
                  <button
                    onClick={() => setIsCreatingCustom(true)}
                    className="w-full text-xs font-bold text-gray-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    id="create-custom-account-button"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> SignUp with custom details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-4 pt-2">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Dynamic Google Sign up Registration
                  </h4>
                  <p className="text-3xs text-slate-500">
                    Your dynamic login details will instantly registers. If joining as a doctor, you'll be listed online in search criteria matching your selected division!
                  </p>
                </div>

                <div>
                  <label className="text-3xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hanamant"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full text-xs bg-slate-50/60 p-3 border border-slate-200 outline-hidden focus:ring-1 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-3xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. hanamant@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50/60 p-3 border border-slate-200 outline-hidden focus:ring-1 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

                {selectedRole === 'DOCTOR' && (
                  <div>
                    <label className="text-3xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Division Specialization</label>
                    <select
                      value={customSpecialization}
                      onChange={(e) => setCustomSpecialization(e.target.value)}
                      className="w-full text-xs bg-slate-50/60 p-3 border border-slate-200 outline-hidden focus:ring-1 focus:ring-emerald-500 rounded-xl cursor-pointer"
                    >
                      <option value="Cardiology">Cardiology (Heart & Pulse)</option>
                      <option value="Dermatology">Dermatology (Skin & Allergies)</option>
                      <option value="Pediatrics">Pediatrics (Child Healthcare)</option>
                      <option value="Psychiatry">Psychiatry (Mental Wellness)</option>
                      <option value="Orthopedics">Orthopedics (Joint & Musculoskeletal)</option>
                      <option value="General Practice">General Practice (Primary Care)</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(false)}
                    className="flex-1 text-2xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 py-3 rounded-xl transition-all"
                  >
                    Use predefined account
                  </button>
                  <button
                    type="submit"
                    className="flex-1 text-2xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10"
                    id="submit-google-custom-signup"
                  >
                    Verify & Create Google Account
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
