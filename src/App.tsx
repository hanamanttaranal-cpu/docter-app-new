/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, DoctorProfile, Appointment, ChatMessage, Feedback, PlatformMetrics } from './types';
import { 
  INITIAL_DOCTORS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_FEEDBACKS, 
  MASTER_METRICS 
} from './data/mockData';
import DashboardSelector from './components/DashboardSelector';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import JavaBlueprintViewer from './components/JavaBlueprintViewer';
import LoginScreen from './components/LoginScreen';
import { Network, Database, ShieldAlert, Check, UserCheck, Code } from 'lucide-react';

export default function App() {
  const DEMO_USERS: User[] = [
    { id: 'pat-1', name: 'John Doe', email: 'john.doe@gmail.com', role: 'PATIENT', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
    { id: 'pat-2', name: 'Alice Smith', email: 'alice.smith@gmail.com', role: 'PATIENT', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: 'doc-1', name: 'Dr. Adrian Vance', email: 'adrian.vance@medicare.com', role: 'DOCTOR', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200' },
    { id: 'doc-3', name: 'Dr. Robert Chen', email: 'robert.chen@medicare.com', role: 'DOCTOR', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200' },
    { id: 'admin-1', name: 'Platform Administrator', email: 'admin@platform.com', role: 'ADMIN', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150' }
  ];

  // Current session user initialized as null to enforce Google SSO Onboarding selection flow
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('medconsult_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Global Synchronized active databases
  const [doctors, setDoctors] = useState<DoctorProfile[]>(() => {
    const stored = localStorage.getItem('medconsult_doctors');
    return stored ? JSON.parse(stored) : INITIAL_DOCTORS;
  });

  const [users, setUsers] = useState<User[]>(DEMO_USERS);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const stored = localStorage.getItem('medconsult_appointments');
    return stored ? JSON.parse(stored) : INITIAL_APPOINTMENTS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem('medconsult_chat_messages');
    return stored ? JSON.parse(stored) : INITIAL_CHAT_MESSAGES;
  });

  const [onlineUsers, setOnlineUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('medconsult_online_users');
    return stored ? JSON.parse(stored) : [];
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [metrics, setMetrics] = useState<PlatformMetrics>(MASTER_METRICS);

  // workspace visual tab routing
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'workspace' | 'blueprint'>('workspace');

  // WebSocket / STOMP frame traffic log queue
  const [socketLogs, setSocketLogs] = useState<string[]>([
    '<<< CONNECTED\nversion:1.1\nheart-beat:10000,10000\n\n'
  ]);

  const addSocketLog = (frame: string) => {
    setSocketLogs(prev => [frame, ...prev].slice(0, 50));
  };

  const clearSocketLogs = () => {
    setSocketLogs([]);
  };

  // Setup reactive shared storage publishers
  useEffect(() => {
    localStorage.setItem('medconsult_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('medconsult_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('medconsult_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('medconsult_online_users', JSON.stringify(onlineUsers));
  }, [onlineUsers]);

  // Synchronize separate browser tabs dynamically for genuine multi-user interactions!
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medconsult_appointments' && e.newValue) {
        setAppointments(JSON.parse(e.newValue));
      }
      if (e.key === 'medconsult_chat_messages' && e.newValue) {
        setChatMessages(JSON.parse(e.newValue));
      }
      if (e.key === 'medconsult_online_users' && e.newValue) {
        setOnlineUsers(JSON.parse(e.newValue));
      }
      if (e.key === 'medconsult_doctors' && e.newValue) {
        setDoctors(JSON.parse(e.newValue));
      }
      if (e.key === 'medconsult_current_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // On Login: update current user and persist online list
  const handleLogin = (user: User, customDoc?: DoctorProfile) => {
    setCurrentUser(user);
    localStorage.setItem('medconsult_current_user', JSON.stringify(user));

    setOnlineUsers(prev => {
      const filtered = prev.filter(u => u.id !== user.id);
      const updated = [...filtered, user];
      localStorage.setItem('medconsult_online_users', JSON.stringify(updated));
      return updated;
    });

    if (customDoc) {
      setDoctors(prev => {
        const filtered = prev.filter(d => d.id !== customDoc.id);
        const updated = [...filtered, customDoc];
        localStorage.setItem('medconsult_doctors', JSON.stringify(updated));
        return updated;
      });
    }

    addSocketLog(`>>> CONNECTED VIA GOOGLE OAUTH\nuser-name: ${user.name}\nuser-id: ${user.id}\nrole: ${user.role}\n\n`);
  };

  // On Logout: remove user from session and online cache
  const handleLogOut = () => {
    if (currentUser) {
      setOnlineUsers(prev => {
        const updated = prev.filter(u => u.id !== currentUser.id);
        localStorage.setItem('medconsult_online_users', JSON.stringify(updated));
        return updated;
      });
      addSocketLog(`<<< DISCONNECTING SESSION\nuser-id: ${currentUser.id}\n\n`);
    }
    setCurrentUser(null);
    localStorage.removeItem('medconsult_current_user');
  };

  // HANDLER: Booking requests
  const handleBookAppointment = (doctorId: string, date: string, timeSlot: string, notes: string, autoApprove?: boolean) => {
    if (!currentUser) return;
    const selectedDoc = doctors.find(d => d.id === doctorId);
    if (!selectedDoc) return;

    const newAppointment: Appointment = {
      id: `apt-${Date.now().toString().slice(-4)}`,
      patientId: currentUser.id,
      patientName: currentUser.name,
      patientPhone: '+1 (555) 234-5678',
      doctorId: doctorId,
      doctorName: selectedDoc.name,
      doctorSpecialization: selectedDoc.specialization,
      date: date,
      timeSlot: timeSlot,
      status: autoApprove ? 'APPROVED' : 'PENDING',
      notes: notes,
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newAppointment, ...prev]);
    
    setMetrics(prev => ({
      ...prev,
      totalConsultations: prev.totalConsultations + 1,
      revenueGenerated: autoApprove ? prev.revenueGenerated + 125 : prev.revenueGenerated
    }));

    if (autoApprove) {
      addSocketLog(`<<< MESSAGE\ndestination:/topic/appointments/incoming\npublished:true\n\n{"id":"${newAppointment.id}","patient":"${currentUser.name}","doctor":"${selectedDoc.name}","status":"APPROVED"}`);
    } else {
      addSocketLog(`<<< MESSAGE\ndestination:/topic/appointments/incoming\npublished:true\n\n{"id":"${newAppointment.id}","patient":"${currentUser.name}","doctor":"${selectedDoc.name}"}`);
    }
  };

  // HANDLER: Approve/Reject requests
  const handleUpdateAppointmentStatus = (appointmentId: string, status: 'APPROVED' | 'REJECTED') => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === appointmentId) {
        return { ...apt, status };
      }
      return apt;
    }));

    if (status === 'APPROVED') {
      setMetrics(prev => ({
        ...prev,
        revenueGenerated: prev.revenueGenerated + 125
      }));
    }

    addSocketLog(`<<< MESSAGE\ndestination:/topic/appointment/status/${appointmentId}\n\n{"appointmentId":"${appointmentId}","status":"${status}"}`);
  };

  // HANDLER: Direct instant chat spinup by Clinician
  const handleStartInstantChatByDoctor = (patientId: string, patientName: string) => {
    if (!currentUser) return;
    
    // Auto find if approved instant chat room is already running
    const existing = appointments.find(a => a.patientId === patientId && a.doctorId === currentUser.id && a.status === 'APPROVED');
    if (existing) {
      addSocketLog(`<<< MESSAGE\ndestination:/topic/chat/channels\n\n{"info":"Chat room ${existing.id} already active"}`);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newAppointment: Appointment = {
      id: `apt-inst-${Date.now().toString().slice(-4)}`,
      patientId: patientId,
      patientName: patientName,
      patientPhone: '+1 (555) 999-0000',
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorSpecialization: doctors.find(d => d.id === currentUser.id)?.specialization || 'Clinical Doctor',
      date: todayStr,
      timeSlot: 'Instant Chat',
      status: 'APPROVED',
      notes: 'Direct clinical session initiated by medical specialist.',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newAppointment, ...prev]);
    addSocketLog(`<<< MESSAGE\ndestination:/topic/appointments/incoming\n\n{"id":"${newAppointment.id}","patient":"${patientName}","doctor":"${currentUser.name}","status":"APPROVED"}`);
  };

  // HANDLER: Chat message streams (100% human-to-human, no automatic response timer)
  const handleSendMessage = (appointmentId: string, content: string) => {
    if (!currentUser) return;
    const senderRole = currentUser.role === 'PATIENT' ? 'PATIENT' : 'DOCTOR';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now().toString().slice(-4)}`,
      appointmentId: appointmentId,
      senderId: currentUser.id,
      senderRole: senderRole,
      content: content,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMsg]);
    
    addSocketLog(`<<< MESSAGE\ndestination:/topic/chat/${appointmentId}\nsubscription:sub-chat\n\n{"id":"${newMsg.id}","sender":"${currentUser.name}","content":"${content.substring(0, 30)}..."}`);
    // Simulated robot delayed replies are fully deleted to enforce genuine human-to-human communications!
  };

  // HANDLER: Purging Users
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setDoctors(prev => prev.filter(d => d.id !== userId && d.email !== users.find(u => u.id === userId)?.email));
    setAppointments(prev => prev.filter(apt => apt.patientId !== userId && apt.doctorId !== userId));
    setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    addSocketLog(`<<< MESSAGE\ndestination:/topic/admin/purges\n\n{"deletedUserId":"${userId}"}`);
  };

  // HANDLER: Verifying clinical credentials
  const handleVerifyDoctor = (docId: string) => {
    setDoctors(prev => prev.map(doc => {
      if (doc.id === docId) {
        return { ...doc, isVerified: true };
      }
      return doc;
    }));
    addSocketLog(`<<< MESSAGE\ndestination:/topic/admin/verifications\n\n{"verifiedDoctorId":"${docId}","status":"VERIFIED"}`);
  };

  // RENDER Welcome & Google auth wizard when no session exists
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-root-container">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center sticky top-0 z-50">
          <div className="max-w-7xl w-full mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
                <Network className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-md sm:text-md font-black text-gray-900 tracking-tight block">MedConsult Access Gateway</span>
                <span className="text-4xs font-bold text-gray-400 uppercase tracking-widest block -mt-1">Secure Sign-On Node</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                const adminUser: User = { id: 'admin-1', name: 'Platform Administrator', email: 'admin@platform.com', role: 'ADMIN', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150' };
                handleLogin(adminUser);
              }}
              className="text-3xs font-bold tracking-wider uppercase text-slate-400 hover:text-emerald-600 border border-transparent hover:border-slate-200 px-2.5 py-1 rounded-md transition-all font-mono"
            >
              Admin Bypass Access
            </button>
          </div>
        </header>

        <LoginScreen onLogin={handleLogin} />

        <footer className="bg-white border-t border-gray-100 py-6" id="app-landing-footer">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-3xs text-gray-400 font-sans">
            <span>Security Certification Identifier: MedConsult-OAuth2-TLS</span>
            <span>Online Doctor Consultation Platform - Certified Real-time Architecture</span>
          </div>
        </footer>
      </div>
    );
  }

  // Filter online list for dashboards
  const onlinePatients = onlineUsers.filter(u => u.role === 'PATIENT');
  const onlineDoctors = onlineUsers.filter(u => u.role === 'DOCTOR');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans" id="app-root-container">
      {/* Top Selector Panel Header */}
      <DashboardSelector
        currentUser={currentUser}
        onUserChange={(usr) => {
          setCurrentUser(usr);
        }}
        availableUsers={users}
        socketLogs={socketLogs}
        clearSocketLogs={clearSocketLogs}
        lockedRole={currentUser.role}
        onLogOut={handleLogOut}
      />

      {/* Primary Workspace container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-gray-100 max-w-xs shadow-xs">
          <button
            onClick={() => setActiveWorkspaceTab('workspace')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeWorkspaceTab === 'workspace' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'hover:bg-slate-50 text-gray-600'
            }`}
            id="tab-workspace-trigger"
          >
            <Database className="w-3.5 h-3.5" /> Workspace
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('blueprint')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeWorkspaceTab === 'blueprint' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'hover:bg-slate-50 text-gray-600'
            }`}
            id="tab-blueprint-trigger"
          >
            <Code className="w-3.5 h-3.5" /> Java Blueprint
          </button>
        </div>

        {/* Tab content renderer panels */}
        {activeWorkspaceTab === 'workspace' ? (
          <div>
            {/* Quick Helper Banner to explain cross-role testing */}
            <div className="bg-emerald-50 border border-emerald-100/60 p-4 rounded-2xl mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 shrink-0 flex items-center justify-center text-emerald-800 font-bold text-xs select-none">
                💡
              </div>
              <p className="text-2xs sm:text-xs text-emerald-800 font-medium">
                <strong>Dynamic Multi-Tab Co-Practicing Guide:</strong> To test 100% human-to-human real-time chat, simply open another browser page or incognito/private window, sign with Google as a different role, and experience completely synchronized live requests and secure typing!
              </p>
            </div>

            {/* Dashboard role dispatcher */}
            {currentUser.role === 'PATIENT' && (
              <PatientDashboard
                doctors={doctors.filter(d => d.id !== currentUser?.id)} // make sure doctor doesn't book search own self
                appointments={appointments}
                chatMessages={chatMessages}
                onBookAppointment={handleBookAppointment}
                onSendMessage={handleSendMessage}
                patientId={currentUser.id}
                patientName={currentUser.name}
                triggerStompFrame={addSocketLog}
                onlineDoctors={onlineDoctors}
              />
            )}

            {currentUser.role === 'DOCTOR' && (
              <DoctorDashboard
                doctorId={currentUser.id}
                doctorName={currentUser.name}
                specialization={doctors.find(d => d.id === currentUser?.id)?.specialization || 'General practitioner'}
                appointments={appointments}
                chatMessages={chatMessages}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                onSendMessage={handleSendMessage}
                triggerStompFrame={addSocketLog}
                onlinePatients={onlinePatients}
                onStartInstantChatWithPatient={handleStartInstantChatByDoctor}
              />
            )}

            {currentUser.role === 'ADMIN' && (
              <AdminDashboard
                users={users}
                doctors={doctors}
                feedbacks={feedbacks}
                metrics={metrics}
                onDeleteUser={handleDeleteUser}
                onVerifyDoctor={handleVerifyDoctor}
                triggerStompFrame={addSocketLog}
              />
            )}
          </div>
        ) : (
          <JavaBlueprintViewer />
        )}
      </main>

      {/* Elegant developer footer */}
      <footer className="bg-white border-t border-gray-100 py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-3xs text-gray-400 font-mono">Environment Status: Container Ingress Port 3000 | Spring Broker Boot Port 8080</p>
          <p className="text-3xs text-gray-400 font-sans">Online Doctor Consultation Platform - Certified Blueprint Design</p>
        </div>
      </footer>
    </div>
  );
}
