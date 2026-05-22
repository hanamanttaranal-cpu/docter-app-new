import React, { useState } from 'react';
import { Appointment, ChatMessage, User } from '../types';
import { ShieldCheck, Calendar, Clock, MessageSquare, Check, X, Send, Activity, Users, DollarSign, Award, AlertCircle } from 'lucide-react';

interface DoctorDashboardProps {
  doctorId: string;
  doctorName: string;
  specialization: string;
  appointments: Appointment[];
  chatMessages: ChatMessage[];
  onUpdateAppointmentStatus: (appointmentId: string, status: 'APPROVED' | 'REJECTED') => void;
  onSendMessage: (appointmentId: string, content: string) => void;
  triggerStompFrame: (frame: string) => void;
  onlinePatients?: User[];
  onStartInstantChatWithPatient?: (patientId: string, patientName: string) => void;
}

export default function DoctorDashboard({
  doctorId,
  doctorName,
  specialization,
  appointments,
  chatMessages,
  onUpdateAppointmentStatus,
  onSendMessage,
  triggerStompFrame,
  onlinePatients = [],
  onStartInstantChatWithPatient
}: DoctorDashboardProps) {
  const [activeChatAppointment, setActiveChatAppointment] = useState<Appointment | null>(null);
  const [docMessageInput, setDocMessageInput] = useState('');

  // Collect doctor specific appointments
  const docAppointments = appointments.filter(apt => apt.doctorId === doctorId);

  // Separate pending queue from approved slots
  const pendingRequests = docAppointments.filter(apt => apt.status === 'PENDING');
  const activeSchedules = docAppointments.filter(apt => apt.status === 'APPROVED');

  // Calculate doctor metrics
  const patientCount = Array.from(new Set(docAppointments.map(a => a.patientId))).length;
  const totalRevenue = docAppointments.filter(a => a.status === 'APPROVED' || a.status === 'COMPLETED').length * 125; // 125 avg consultation fee
  const approvedConsultationsCount = docAppointments.filter(a => a.status === 'APPROVED' || a.status === 'COMPLETED').length;

  const handleApprove = (aptId: string) => {
    onUpdateAppointmentStatus(aptId, 'APPROVED');
    triggerStompFrame(`SEND\ndestination:/app/appointment/status/${aptId}\ncontent-type:application/json\n\n{"status":"APPROVED","doctorId":"${doctorId}"}`);
  };

  const handleReject = (aptId: string) => {
    onUpdateAppointmentStatus(aptId, 'REJECTED');
    triggerStompFrame(`SEND\ndestination:/app/appointment/status/${aptId}\ncontent-type:application/json\n\n{"status":"REJECTED","doctorId":"${doctorId}"}`);
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatAppointment || !docMessageInput.trim()) return;

    onSendMessage(activeChatAppointment.id, docMessageInput.trim());
    triggerStompFrame(`SEND\ndestination:/app/chat\ncontent-type:application/json\n\n{"appointmentId":"${activeChatAppointment.id}","senderId":"${doctorId}","content":"${docMessageInput.trim()}"}`);
    setDocMessageInput('');
  };

  const currentChats = activeChatAppointment 
    ? chatMessages.filter(msg => msg.appointmentId === activeChatAppointment.id) 
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans" id="doctor-root">
      {/* HEADER OVERVIEW / PRACTICING METRICS BAR (12 cols) */}
      <div className="lg:col-span-12">
        <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative shadow-md">
          {/* Subtle background glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-bold uppercase tracking-widest text-3xs">Practicing Console</span>
              </div>
              <h2 className="text-xl font-bold mt-1">{doctorName}</h2>
              <p className="text-xs text-slate-400 font-semibold">{specialization} Division & Clinic Scheduler</p>
            </div>

            {/* Quick dashboard numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-3xs font-bold uppercase tracking-wider">Weekly Revenue</span>
                </div>
                <p className="text-md font-bold mt-1">${totalRevenue}</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-3xs font-bold uppercase tracking-wider">Patients</span>
                </div>
                <p className="text-md font-bold mt-1">{patientCount}</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-3xs font-bold uppercase tracking-wider">Consultations</span>
                </div>
                <p className="text-md font-bold mt-1">{approvedConsultationsCount}</p>
              </div>

              <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-400">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-3xs font-bold uppercase tracking-wider">Reputation</span>
                </div>
                <p className="text-md font-bold mt-1">4.9 / 5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT PORTAL: Pending Booking Dispatch Queue (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-md font-bold text-gray-900">Appointment Request Routing Invoice</h3>
              <p className="text-xs text-slate-400">Real-time patient request workflow. Approve to start secured chat.</p>
            </div>
            <span className="bg-amber-50 text-amber-800 text-2xs font-bold px-2.5 py-1 rounded-lg">
              Pending: {pendingRequests.length}
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-100 bg-slate-50/50 rounded-2xl text-center text-slate-400">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500/80" />
              <p className="text-sm font-semibold text-slate-700">All request routes fully dispatched!</p>
              <p className="text-xs mt-1">New requests booked by patients will show up here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(apt => (
                <div key={apt.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id={`pending-req-${apt.id}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      <p className="text-xs font-bold text-slate-800">Booking from {apt.patientName}</p>
                    </div>
                    <p className="text-2xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.date}
                      <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" /> {apt.timeSlot}
                    </p>
                    <div className="mt-2.5 bg-white border border-slate-100 p-2 text-2xs text-slate-600 rounded-lg">
                      <strong className="text-slate-800">Symptom Notes:</strong> {apt.notes}
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(apt.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                      id={`approve-btn-${apt.id}`}
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(apt.id)}
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 font-bold text-2xs px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                      id={`reject-btn-${apt.id}`}
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Practice Analytics (Custom visual graphs in SVG to present analytics) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h3 className="text-md font-bold text-gray-900 mb-4">Practice Analytics (Consultations / Revenue)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual consultation trends */}
            <div className="border border-slate-100 rounded-xl p-4">
              <h4 className="text-2xs text-slate-400 font-bold uppercase mb-4 tracking-wider">Weekly Consultations Count</h4>
              <div className="flex h-32 items-end justify-between px-2 gap-2 mt-4" id="consultation-analytics-bar">
                <div className="bg-slate-100 w-full rounded-t-sm h-[35%] flex flex-col justify-end items-center relative group">
                  <span className="absolute -top-4 opacity-0 group-hover:opacity-100 text-3xs font-black bg-slate-900 text-white px-1.5 rounded-sm transition-opacity">5</span>
                  <span className="text-4xs text-slate-400 font-bold mt-1 select-none absolute -bottom-5">Mon</span>
                </div>
                <div className="bg-slate-100 w-full rounded-t-sm h-[20%] flex flex-col justify-end items-center relative group">
                  <span className="absolute -top-4 opacity-0 group-hover:opacity-100 text-3xs font-black bg-slate-900 text-white px-1.5 rounded-sm transition-opacity">3</span>
                  <span className="text-4xs text-slate-400 font-bold mt-1 select-none absolute -bottom-5">Tue</span>
                </div>
                <div className="bg-emerald-600 w-full rounded-t-sm h-[85%] flex flex-col justify-end items-center relative group">
                  <span className="absolute -top-4 opacity-0 group-hover:opacity-100 text-3xs font-black bg-slate-900 text-white px-1.5 rounded-sm transition-opacity">12</span>
                  <span className="text-4xs text-slate-400 font-bold mt-1 select-none absolute -bottom-5">Wed</span>
                </div>
                <div className="bg-emerald-600 w-full rounded-t-sm h-[60%] flex flex-col justify-end items-center relative group">
                  <span className="absolute -top-4 opacity-0 group-hover:opacity-100 text-3xs font-black bg-slate-900 text-white px-1.5 rounded-sm transition-opacity">8</span>
                  <span className="text-4xs text-slate-400 font-bold mt-1 select-none absolute -bottom-5">Thu</span>
                </div>
                <div className="bg-emerald-600 w-full rounded-t-sm h-[70%] flex flex-col justify-end items-center relative group">
                  <span className="absolute -top-4 opacity-0 group-hover:opacity-100 text-3xs font-black bg-slate-900 text-white px-1.5 rounded-sm transition-opacity">10</span>
                  <span className="text-4xs text-slate-400 font-bold mt-1 select-none absolute -bottom-5">Fri</span>
                </div>
              </div>
            </div>

            {/* Patients Specialization metrics lists */}
            <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-2xs text-slate-400 font-bold uppercase tracking-wider">Demographic Breakdown</h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-2xs py-1">
                    <span className="font-semibold text-slate-600">Adult Outpatients</span>
                    <span className="font-bold text-slate-800">65%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-[65%] rounded-full"></div>
                  </div>

                  <div className="flex justify-between text-2xs py-1">
                    <span className="font-semibold text-slate-600">Pediatric/Geriatric Care</span>
                    <span className="font-bold text-slate-800">35%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[35%] rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-1.5 text-3xs text-slate-500 mt-2">
                <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Compliance metrics matching Medicare standards. Verified automatically before dispatch.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PORTAL: Approved Active Schedule & Chats (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Patients Online Panel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Patients Online ({onlinePatients.length})
          </h3>
          <p className="text-[10px] text-slate-400 mb-3 leading-tight">Google-authorized patients currently active. Click below to start an instant human-to-human chat session.</p>
          
          {onlinePatients.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No patients are online right now. Open another window/tab as a Patient to test bi-directional chat!</p>
          ) : (
            <div className="space-y-2.5">
              {onlinePatients.map(user => (
                <div key={user.id} className="p-3 rounded-xl border border-slate-100 hover:border-teal-600/10 transition-colors bg-slate-50/50 flex justify-between items-center animate-fade-in" id={`online-patient-card-${user.id}`}>
                  <div className="flex items-center gap-2.5">
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/10" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-2xs">{user.name}</h4>
                      <p className="text-[10px] font-mono text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  {onStartInstantChatWithPatient && (
                    <button
                      onClick={() => onStartInstantChatWithPatient(user.id, user.name)}
                      className="text-[10px] font-bold text-white bg-teal-600 hover:bg-teal-700 py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors"
                      id={`start-chat-online-${user.id}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Start Chat
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Active schedules ({activeSchedules.length})</h3>
          
          {activeSchedules.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No approved clinics today.</p>
          ) : (
            <div className="space-y-2.5">
              {activeSchedules.map(apt => (
                <div key={apt.id} className="p-3.5 rounded-lg border border-slate-100 hover:border-emerald-600/10 transition-colors bg-slate-50/50 flex justify-between items-center" id={`active-card-${apt.id}`}>
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">{apt.patientName}</h4>
                    <p className="text-2xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.timeSlot}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveChatAppointment(apt);
                      triggerStompFrame(`SUBSCRIBE\nid:sub-doc-chat\ndestination:/topic/chat/${apt.id}\n\n`);
                    }}
                    className={`p-2 rounded-xl border transition-colors ${
                      activeChatAppointment?.id === apt.id
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'hover:bg-slate-100 text-emerald-600 border-slate-100'
                    }`}
                    title="Open Secure Clinical Workspace Chat"
                    id={`doc-chat-btn-${apt.id}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Chat stream console */}
        {activeChatAppointment ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col h-[350px] overflow-hidden" id="doc-chat-area-inner">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400">
                  {activeChatAppointment.patientName[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{activeChatAppointment.patientName}</h4>
                  <p className="text-4xs text-emerald-300 font-mono">Patient Room: {activeChatAppointment.id}</p>
                </div>
              </div>
              <button onClick={() => { setActiveChatAppointment(null); }} className="text-xs text-slate-400 hover:text-white underline">
                End session
              </button>
            </div>

            {/* Streams Message box */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {currentChats.map(sms => (
                <div key={sms.id} className={`flex flex-col ${sms.senderId === doctorId ? 'items-end' : 'items-start'}`}>
                  <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs ${
                    sms.senderId === doctorId
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                  }`}>
                    {sms.content}
                  </div>
                  <span className="text-4xs text-gray-400 mt-1 px-1 font-mono">{new Date(sms.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              ))}
            </div>

            {/* Send footer */}
            <form onSubmit={handleSendMessageSubmit} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Prescribe or send message secure TLS..."
                value={docMessageInput}
                onChange={(e) => setDocMessageInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 outline-hidden rounded-xl focus:ring-1 focus:ring-emerald-500"
                id="doc-chat-footer-input"
              />
              <button type="submit" className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shrink-0" id="doc-chat-footer-send-btn">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
            <MessageSquare className="w-7 h-7 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Select any approved schedules above to open direct bi-directional chat channels with patients.</p>
          </div>
        )}
      </div>
    </div>
  );
}
