export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  avatarUrl: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  specialization: string;
  diseasesCovered: string[];
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  avatarUrl: string;
  availableDays: string[];
  availableSlots: string[];
}

export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  phone: string;
  medicalHistory: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  notes: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  appointmentId: string;
  senderId: string;
  senderRole: 'PATIENT' | 'DOCTOR';
  content: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  userName: string;
  userRole: 'PATIENT' | 'DOCTOR';
  category: 'COMPLAINT' | 'SUGGESTION' | 'PRAISE';
  message: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  date: string;
}

export interface PlatformMetrics {
  totalPatients: number;
  totalDoctors: number;
  totalConsultations: number;
  revenueGenerated: number;
  averageRating: number;
}
