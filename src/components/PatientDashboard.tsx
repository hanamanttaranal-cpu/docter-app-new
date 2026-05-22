import React, { useState } from 'react';
import { DoctorProfile, Appointment, ChatMessage } from '../types';
import { Search, Calendar, Clock, MessageSquare, Plus, Star, CheckCircle, FileText, Send, Paperclip, AlertCircle } from 'lucide-react';

interface PatientDashboardProps {
  doctors: DoctorProfile[];
  appointments: Appointment[];
  chatMessages: ChatMessage[];
  onBookAppointment: (doctorId: string, date: string, timeSlot: string, notes: string, autoApprove?: boolean) => void;
  onSendMessage: (appointmentId: string, content: string) => void;
  patientId: string;
  patientName: string;
  triggerStompFrame: (frame: string) => void;
  onlineDoctors?: any[];
}

export default function PatientDashboard({
  doctors,
  appointments,
  chatMessages,
  onBookAppointment,
  onSendMessage,
  patientId,
  patientName,
  triggerStompFrame,
  onlineDoctors = []
}: PatientDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeChatAppointment, setActiveChatAppointment] = useState<Appointment | null>(null);

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('2026-05-25');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [symptomFiles, setSymptomFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Chat message input
  const [messageInput, setMessageInput] = useState('');

  // Filtering Specialties
  const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.specialization)))];

  // Dynamic search rule
  const filteredDoctors = doctors.filter(doc => {
    const matchesQuery = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.diseasesCovered.some(disease => disease.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialization === selectedSpecialty;
    
    return matchesQuery && matchesSpecialty;
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !bookingTime) return;

    onBookAppointment(selectedDoctor.id, bookingDate, bookingTime, bookingNotes);
    
    // Simulate STOMP Frame
    triggerStompFrame(`SEND\ndestination:/app/appointment/request\ncontent-type:application/json\n\n{"doctorId":"${selectedDoctor.id}","patientId":"${patientId}","date":"${bookingDate}","timeSlot":"${bookingTime}","notes":"${bookingNotes}"}`);
    
    // Reset Form
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setBookingTime('');
    setBookingNotes('');
    setSymptomFiles([]);
    setUploadProgress('');
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatAppointment || !messageInput.trim()) return;

    onSendMessage(activeChatAppointment.id, messageInput.trim());
    
    // Simulate STOMP Sending frame
    triggerStompFrame(`SEND\ndestination:/app/chat\ncontent-type:application/json\n\n{"appointmentId":"${activeChatAppointment.id}","senderId":"${patientId}","content":"${messageInput.trim()}"}`);
    
    setMessageInput('');
  };

  const handleFileUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSymptomFiles([file]);
      setUploadProgress('Uploading to Cloudinary CDN...');
      setTimeout(() => {
        setUploadProgress(`Successfully uploaded ${file.name} to Cloudinary!`);
        triggerStompFrame(`<<< HTTP 201 Created (Cloudinary: secure_url: "https://res.cloudinary.com/medconsult/image/upload/${file.name}")`);
      }, 1500);
    }
  };

  // Auto-select the newest approved clinical chat workspace when a new one is added
  const appointmentsCount = appointments.length;
  React.useEffect(() => {
    const patientApprovedApts = appointments.filter(apt => apt.patientId === patientId && apt.status === 'APPROVED');
    if (patientApprovedApts.length > 0) {
      setActiveChatAppointment(patientApprovedApts[0]);
    }
  }, [appointmentsCount, patientId]);

  const handleInstantChat = (doctor: DoctorProfile) => {
    const todayStr = new Date().toISOString().split('T')[0];
    onBookAppointment(
      doctor.id, 
      todayStr, 
      'Instant Chat', 
      `Direct instant messaging session with ${doctor.name} for specialized consulting.`, 
      true
    );
    triggerStompFrame(`SEND\ndestination:/app/chat/instant-session\ncontent-type:application/json\n\n{"doctorId":"${doctor.id}","patientId":"${patientId}","notes":"Direct messenger consultation active"}`);
  };

  const openBookingWizard = (doc: DoctorProfile) => {
    setSelectedDoctor(doc);
    setBookingTime(doc.availableSlots[0]);
    setShowBookingModal(true);
  };

  const currentChats = activeChatAppointment 
    ? chatMessages.filter(msg => msg.appointmentId === activeChatAppointment.id) 
    : [];

  const patientAppointments = appointments.filter(apt => apt.patientId === patientId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans" id="patient-root">
      {/* LEFT SECTION: Search and Doctors Discover (7 cols) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Dynamic Doctor Discovery</h2>
          <p className="text-xs text-gray-500 mb-4">Enter symptoms, diseases, specialized titles, or doctor names to route appointment requests instantly.</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search inputs */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search by specialty, symptom (e.g. rash, chest pain, fever)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs input pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 outline-hidden focus:ring-1 focus:ring-emerald-500 rounded-xl"
                id="doctor-search-input"
              />
            </div>

            {/* Specialty tag picker */}
            <div className="relative w-full sm:w-48">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 py-3 pl-3 pr-8 rounded-xl outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer text-gray-700"
                id="specialty-filter-picker"
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid list */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Available Doctors ({filteredDoctors.length})</h3>
          
          {filteredDoctors.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">No doctors match your dynamic search criteria.</p>
              <button onClick={() => { setSearchQuery(''); setSelectedSpecialty('All'); }} className="text-xs text-emerald-600 mt-2 hover:underline">
                Reset Searches
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map(doctor => {
                const isDoctorOnline = onlineDoctors.some(od => od.id === doctor.id || od.email === doctor.email);
                return (
                  <div key={doctor.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-500/20 hover:shadow-lg transition-all flex flex-col justify-between animate-fade-in" id={`doc-card-${doctor.id}`}>
                    <div>
                      <div className="flex items-start gap-4">
                        <img src={doctor.avatarUrl} alt={doctor.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100" />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-sm leading-snug">{doctor.name}</h4>
                            {doctor.isVerified && (
                              <span className="bg-emerald-50 text-emerald-700 text-3xs px-1.5 py-0.5 rounded-sm font-semibold tracking-wider uppercase">Verified</span>
                            )}
                            {isDoctorOnline && (
                              <span className="bg-teal-50 text-teal-800 text-[9px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider uppercase flex items-center gap-1 animate-pulse" title="Connected in other browser tab via Google Auth">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Active Online
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-emerald-600 mt-0.5">{doctor.specialization}</p>
                        
                        <div className="flex items-center gap-1 mt-1 text-2xs text-gray-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-gray-700">{doctor.rating}</span>
                          <span>({doctor.reviewsCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Diseases Covered tags */}
                    <div className="mt-4">
                      <p className="text-3xs font-semibold text-gray-400 uppercase tracking-widest">Symptomatic Scope</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doctor.diseasesCovered.map((disease, i) => (
                          <span key={i} className="text-2xs bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {disease}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-50 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-3xs text-gray-400 uppercase font-semibold">Consultation Fee</p>
                      <p className="text-sm font-bold text-gray-900">${doctor.consultationFee}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInstantChat(doctor)}
                        className="text-2xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                        id={`chat-now-btn-${doctor.id}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat Now
                      </button>
                      <button
                        onClick={() => openBookingWizard(doctor)}
                        className="text-2xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                        id={`book-btn-${doctor.id}`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Book Securely
                      </button>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: My Appointments & Active Chat Room (5 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Appointments List */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">My Appointments</h2>
          {patientAppointments.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No scheduled appointments found.</p>
          ) : (
            <div className="space-y-3">
              {patientAppointments.map(apt => (
                <div key={apt.id} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50" id={`apt-box-${apt.id}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className={`inline-block text-3xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1.5 ${
                        apt.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                        apt.status === 'PENDING' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                        apt.status === 'REJECTED' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {apt.status}
                      </span>
                      <h4 className="font-bold text-gray-900 text-xs">{apt.doctorName}</h4>
                      <p className="text-2xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {apt.date}
                        <Clock className="w-3 h-3 text-slate-400 ml-1" /> {apt.timeSlot}
                      </p>
                    </div>

                    {apt.status === 'APPROVED' && (
                      <button
                        onClick={() => {
                          setActiveChatAppointment(apt);
                          triggerStompFrame(`SUBSCRIBE\nid:sub-chat\ndestination:/topic/chat/${apt.id}\n\n`);
                        }}
                        className={`p-1.5 rounded-lg transition-colors border ${
                          activeChatAppointment?.id === apt.id
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'hover:bg-slate-100 text-emerald-600 border-slate-100'
                        }`}
                        title="Open Consultation Chat Room"
                        id={`chat-trigger-${apt.id}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Chat console */}
        {activeChatAppointment ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col h-[400px] overflow-hidden" id="patient-chat-window">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-sm text-emerald-400">
                  {activeChatAppointment.doctorName[4]}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{activeChatAppointment.doctorName}</h4>
                  <p className="text-4xs text-emerald-300 font-mono">Secure TLS Core Active</p>
                </div>
              </div>
              <button onClick={() => { setActiveChatAppointment(null); }} className="text-xs text-slate-400 hover:text-white underline font-mono">
                Exit Chat
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {currentChats.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-10">Live portal opened. Send a message to start.</p>
              ) : (
                currentChats.map(sms => (
                  <div key={sms.id} className={`flex flex-col ${sms.senderId === patientId ? 'items-end' : 'items-start'}`}>
                    <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs ${
                      sms.senderId === patientId
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {sms.content}
                    </div>
                    <span className="text-4xs text-gray-400 mt-1 px-1 font-mono">{new Date(sms.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                ))
              )}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessageSubmit} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Secure message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-slate-50 focus:bg-white border border-slate-200 outline-hidden rounded-xl focus:ring-1 focus:ring-emerald-500"
                id="patient-chat-input"
              />
              <button type="submit" className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shrink-0" id="patient-chat-send-btn">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">Once your appointment is <strong className="text-emerald-600">APPROVED</strong> by a medical doctor, click the chat trigger to enter your consultation workspace.</p>
          </div>
        )}
      </div>

      {/* Booking Wizard Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="booking-modal-outer">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto" id="booking-modal-inner">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="text-4xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Step Required</span>
                <h3 className="text-md font-bold text-gray-900 mt-1">Book Consultation Appointment</h3>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              {/* Target Doc Card */}
              <div className="flex gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-50">
                <img src={selectedDoctor.avatarUrl} alt={selectedDoctor.name} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <h4 className="font-bold text-xs text-gray-900">{selectedDoctor.name}</h4>
                  <p className="text-2xs text-emerald-700 font-semibold">{selectedDoctor.specialization}</p>
                </div>
              </div>

              {/* Day selection */}
              <div>
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Select Consultation Date</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="date"
                    min="2026-05-22"
                    max="2026-06-05"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <div className="bg-slate-100 p-2 text-2xs text-slate-500 rounded-xl flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Practicing: {selectedDoctor.availableDays.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Slots select */}
              <div>
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Available Dispatch Slots (STOMP Synced)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedDoctor.availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookingTime(slot)}
                      className={`text-2xs font-semibold py-2 rounded-xl transition-all border ${
                        bookingTime === slot
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 text-gray-700 border-slate-200'
                      }`}
                      id={`slot-btn-${slot.replace(':', '').replace(' ', '')}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptom list note */}
              <div>
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Describe symptoms / Request details</label>
                <textarea
                  placeholder="Describe your current medical concern, e.g. acute rash, severe cold fever, high heart palpitations..."
                  rows={3}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  required
                  id="booking-notes-textarea"
                />
              </div>

              {/* Document upload mock to Cloudinary integration */}
              <div>
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Upload Clinical Reports / Symptom Image (Cloudinary Proxy)</label>
                <div className="border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 text-center relative cursor-pointer hover:bg-slate-100/55 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUploadSimulate}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    id="cloudinary-upload-input"
                  />
                  <Paperclip className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  <p className="text-3xs text-slate-500">Drag files here or click to simulate real-time secure upload to Cloudinary.</p>
                </div>
                {uploadProgress && (
                  <p className="text-2xs font-semibold text-emerald-600 mt-1 font-mono tracking-tight">{uploadProgress}</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-slate-50 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold py-3 rounded-xl transition-all"
                >
                  Cancel Request
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10"
                  id="submit-booking-action"
                >
                  Confirm dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
