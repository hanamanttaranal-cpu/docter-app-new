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
import { Network, Database, ShieldAlert, Check, UserCheck, Code } from 'lucide-react';

export default function App() {
  // Pre-configured characters representing roles
  const DEMO_USERS: User[] = [
    { id: 'pat-1', name: 'John Doe', email: 'john.doe@gmail.com', role: 'PATIENT', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' },
    { id: 'pat-2', name: 'Alice Smith', email: 'alice.smith@gmail.com', role: 'PATIENT', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: 'doc-1', name: 'Dr. Adrian Vance', email: 'adrian.vance@medicare.com', role: 'DOCTOR', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200' },
    { id: 'doc-3', name: 'Dr. Robert Chen', email: 'robert.chen@medicare.com', role: 'DOCTOR', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200' },
    { id: 'admin-1', name: 'Platform Administrator', email: 'admin@platform.com', role: 'ADMIN', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150' }
  ];

  // Helper to detect current locked role from build-time environment variable OR active host port
  const getRoleFromEnvironmentOrPort = (): 'PATIENT' | 'DOCTOR' | 'ADMIN' => {
    const envRole = (import.meta as any).env?.VITE_APP_ROLE;
    if (envRole === 'ADMIN' || envRole === 'DOCTOR' || envRole === 'PATIENT') {
      return envRole;
    }
    if (typeof window !== 'undefined' && window.location) {
      const port = window.location.port;
      if (port === '3002') return 'ADMIN';
      if (port === '3001') return 'DOCTOR';
      if (port === '3000') return 'PATIENT';
    }
    return 'PATIENT';
  };

  const activeRole = getRoleFromEnvironmentOrPort();
  const roleFilteredUsers = DEMO_USERS.filter(u => u.role === activeRole);

  // Global System Memory
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return roleFilteredUsers[0] || DEMO_USERS[0];
  });
  const [doctors, setDoctors] = useState<DoctorProfile[]>(() => {
    // Synchronize doctors using matching IDs
    return INITIAL_DOCTORS;
  });
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [metrics, setMetrics] = useState<PlatformMetrics>(MASTER_METRICS);

  // active browser app tabs ('workspace' | 'blueprint')
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'workspace' | 'blueprint'>('workspace');

  // WebSocket / STOMP frame traffic logger
  const [socketLogs, setSocketLogs] = useState<string[]>([
    '<<< CONNECTED\nversion:1.1\nheart-beat:10000,10000\n\n'
  ]);

  const addSocketLog = (frame: string) => {
    setSocketLogs(prev => [frame, ...prev].slice(0, 50));
  };

  const clearSocketLogs = () => {
    setSocketLogs([]);
  };

  // HANDLER: Booking requests
  const handleBookAppointment = (doctorId: string, date: string, timeSlot: string, notes: string, autoApprove?: boolean) => {
    const selectedDoc = doctors.find(d => d.id === doctorId);
    if (!selectedDoc) return;

    const newAppointment: Appointment = {
      id: `apt-${Date.now().toString().slice(-4)}`,
      patientId: currentUser.id,
      patientName: currentUser.name,
      patientPhone: '+1 (555) 234-5678', // standard fallback
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
    
    // Increment total consultations index
    setMetrics(prev => ({
      ...prev,
      totalConsultations: prev.totalConsultations + 1,
      revenueGenerated: autoApprove ? prev.revenueGenerated + 125 : prev.revenueGenerated
    }));

    if (autoApprove) {
      addSocketLog(`<<< MESSAGE\ndestination:/topic/appointments/incoming\nsubscription:sub-0\n\n{"id":"${newAppointment.id}","patient":"${currentUser.name}","doctor":"${selectedDoc.name}","status":"APPROVED"}`);
      addSocketLog(`<<< MESSAGE\ndestination:/topic/appointment/status/${newAppointment.id}\n\n{"appointmentId":"${newAppointment.id}","status":"APPROVED"}`);
    } else {
      addSocketLog(`<<< MESSAGE\ndestination:/topic/appointments/incoming\nsubscription:sub-0\n\n{"id":"${newAppointment.id}","patient":"${currentUser.name}","doctor":"${selectedDoc.name}"}`);
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

    // Update Platform metrics if approved
    if (status === 'APPROVED') {
      setMetrics(prev => ({
        ...prev,
        revenueGenerated: prev.revenueGenerated + 125
      }));
    }

    addSocketLog(`<<< MESSAGE\ndestination:/topic/appointment/status/${appointmentId}\n\n{"appointmentId":"${appointmentId}","status":"${status}"}`);
  };

  const getAutomatedDoctorResponse = (specialization: string, patientMessage: string, docName: string): string => {
    const msg = patientMessage.toLowerCase();
    
    if (specialization === "Cardiology") {
      if (msg.includes("pain") || msg.includes("tight") || msg.includes("hurt")) {
        return `Hello, this is ${docName}. For any acute chest pain or tightness, please ensure you rest immediately, sit upright, and avoid any physical exertion. If the pain is radiating to your left arm or neck, please seek emergency care. If it is mild, let's monitor your blood pressure and heart rate.`;
      }
      return `Hello, thank you for checking in. As your cardiologist, I've noted your message. Could you clarify if you've been experiencing any rapid heart rate (palpitations), dizziness, or swelling in your feet recently?`;
    }
    
    if (specialization === "Dermatology") {
      if (msg.includes("itch") || msg.includes("rash") || msg.includes("red")) {
        return `Hello, ${docName} here. For skin rashes or itching, I recommend keeping the area cool, moisturized, and absolutely clean. Refrain from scratching or applying perfumed products. Please share if there's any warmth, swelling, or open wounds.`;
      }
      return `Greetings. As a dermatologist, I've received your query. Please describe the appearance of the affected skin area (e.g. raised, dry, scaling) and how long it has been present. You may also simulate uploading a symptom image.`;
    }
    
    if (specialization === "Pediatrics") {
      if (msg.includes("fever") || msg.includes("temp") || msg.includes("hot")) {
        return `Hello, this is Dr. Robert Chen. For a fever, the most important step is keeping the child well-hydrated with water, diluted juices, or oral rehydration solutions. Note down their temperature every 4 hours. If they remain alert and playful, it is generally safe to monitor locally.`;
      }
      return `Hi, thank you for reaching out. In pediatric care, we prioritize active checkups. Please tell me about your child's age, appetite, sleep patterns, and any physical symptoms they are showing today.`;
    }
    
    if (specialization === "Psychiatry") {
      if (msg.includes("anxious") || msg.includes("stress") || msg.includes("depress") || msg.includes("sad") || msg.includes("sleep")) {
        return `Thank you for sharing, this is ${docName}. Physical feelings of anxiety or stress are very real. I recommend taking five slow, deep diaphragmatic breaths (inhale for 4 seconds, hold for 4, exhale for 6). Please let me know if these feelings are disrupting your sleep or routine, we can look into personalized exercises together.`;
      }
      return `Hello. I am here and listening in this secure space. How are your energy levels and sleep patterns today? Feel free to share whatever is on your mind.`;
    }
    
    if (specialization === "Orthopedics") {
      if (msg.includes("pain") || msg.includes("joint") || msg.includes("swell") || msg.includes("back")) {
        return `Hello! ${docName} here. For musculoskeletal or joint discomfort, I highly advise following the R.I.C.E protocol (Rest, Ice for 15-20 min, Compression, Elevation). Avoid heavy load bearing until we confirm stability.`;
      }
      return `Greetings. As an orthopedic specialist, I've monitored your message. Please share which joint or muscle group is experiencing distress, and whether there is any visible bruising, swelling, or range-of-motion limits.`;
    }

    return `Thank you for checking in. I have securely received your inquiry and am reviewing your symptomatic reports. I will follow up with specific suggestions shortly. Please let me know if you are experiencing any other symptoms.`;
  };

  // HANDLER: Chat message streams
  const handleSendMessage = (appointmentId: string, content: string) => {
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
    
    addSocketLog(`<<< MESSAGE\ndestination:/topic/chat/${appointmentId}\nsubscription:sub-chat\n\n{"id":"${newMsg.id}","sender":"${currentUser.name}","content":"${content.substring(0, 20)}..."}`);

    // Simulate response if sender is patient
    if (senderRole === 'PATIENT') {
      const apt = appointments.find(a => a.id === appointmentId);
      if (apt) {
        setTimeout(() => {
          const doctorReplyMsg: ChatMessage = {
            id: `msg-${(Date.now() + 1).toString().slice(-4)}`,
            appointmentId: appointmentId,
            senderId: apt.doctorId,
            senderRole: 'DOCTOR',
            content: getAutomatedDoctorResponse(apt.doctorSpecialization || 'General', content, apt.doctorName),
            timestamp: new Date().toISOString()
          };
          setChatMessages(prev => [...prev, doctorReplyMsg]);
          addSocketLog(`<<< MESSAGE\ndestination:/topic/chat/${appointmentId}\nsubscription:sub-chat\n\n{"id":"${doctorReplyMsg.id}","sender":"${apt.doctorName}","content":"${doctorReplyMsg.content.substring(0, 20)}..."}`);
        }, 1200);
      }
    }
  };

  // HANDLER: Purging Users
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setDoctors(prev => prev.filter(d => d.id !== userId && d.email !== users.find(u => u.id === userId)?.email));
    setAppointments(prev => prev.filter(apt => apt.patientId !== userId && apt.doctorId !== userId));
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-root-container">
      {/* Top Selector Panel Header */}
      <DashboardSelector
        currentUser={currentUser}
        onUserChange={(usr) => {
          setCurrentUser(usr);
          addSocketLog(`>>> SEND\ndestination:/app/session/switch\n\n{"oldRole":"${currentUser.role}","newRole":"${usr.role}"}`);
        }}
        availableUsers={users.filter(u => u.role === activeRole)}
        socketLogs={socketLogs}
        clearSocketLogs={clearSocketLogs}
        lockedRole={activeRole}
      />

      {/* Primary Workspace container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-2xl p-1.5 border border-gray-100 max-w-xs shadow-xs">
          <button
            onClick={() => setActiveWorkspaceTab('workspace')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeWorkspaceTab === 'workspace' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'hover:bg-slate-50 text-gray-600'
            }`}
            id="tab-workspace-trigger"
          >
            <Database className="w-4 h-4" /> Workspace
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('blueprint')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeWorkspaceTab === 'blueprint' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'hover:bg-slate-50 text-gray-600'
            }`}
            id="tab-blueprint-trigger"
          >
            <Code className="w-4 h-4" /> Java Blueprint
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
                <strong>Sandbox Testing Guide:</strong> Switch characters dynamically in the top bar dropdown to try both sides of the bi-directional workflow! Try <strong>booking an appointment</strong> as Patient John Doe, then switch to <strong>Dr. Adrian Vance</strong> to approve it and start a <strong>secure STOMP chat</strong>!
              </p>
            </div>

            {/* Dashboard role dispatcher */}
            {currentUser.role === 'PATIENT' && (
              <PatientDashboard
                doctors={doctors.filter(d => d.id !== currentUser.id)} // make sure doctor doesn't book search own self
                appointments={appointments}
                chatMessages={chatMessages}
                onBookAppointment={handleBookAppointment}
                onSendMessage={handleSendMessage}
                patientId={currentUser.id}
                patientName={currentUser.name}
                triggerStompFrame={addSocketLog}
              />
            )}

            {currentUser.role === 'DOCTOR' && (
              <DoctorDashboard
                doctorId={currentUser.id}
                doctorName={currentUser.name}
                specialization={doctors.find(d => d.id === currentUser.id)?.specialization || 'General practitioner'}
                appointments={appointments}
                chatMessages={chatMessages}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                onSendMessage={handleSendMessage}
                triggerStompFrame={addSocketLog}
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
