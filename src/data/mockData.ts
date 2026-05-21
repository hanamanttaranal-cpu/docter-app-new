import { DoctorProfile, PatientProfile, Appointment, Feedback, ChatMessage, PlatformMetrics } from '../types';

export const INITIAL_DOCTORS: DoctorProfile[] = [
  {
    id: "doc-1",
    name: "Dr. Adrian Vance",
    email: "adrian.vance@medicare.com",
    specialization: "Cardiology",
    diseasesCovered: ["Chest pain", "Arrhythmia", "Hypertension", "Palpitations", "Coronary Artery Disease"],
    experienceYears: 14,
    consultationFee: 150,
    rating: 4.9,
    reviewsCount: 184,
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableSlots: ["09:00 AM", "10:30 AM", "01:30 PM", "03:00 PM"]
  },
  {
    id: "doc-2",
    name: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@medicare.com",
    specialization: "Dermatology",
    diseasesCovered: ["Acne", "Eczema", "Psoriasis", "Skin rash", "Hair loss", "Melanoma"],
    experienceYears: 9,
    consultationFee: 110,
    rating: 4.8,
    reviewsCount: 142,
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200",
    availableDays: ["Tuesday", "Thursday", "Friday"],
    availableSlots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"]
  },
  {
    id: "doc-3",
    name: "Dr. Robert Chen",
    email: "robert.chen@medicare.com",
    specialization: "Pediatrics",
    diseasesCovered: ["Fever", "Measles", "Child nutrition", "Common cold", "Ear infection", "Allergies"],
    experienceYears: 12,
    consultationFee: 95,
    rating: 4.95,
    reviewsCount: 215,
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    availableSlots: ["08:30 AM", "11:00 AM", "03:30 PM", "05:00 PM"]
  },
  {
    id: "doc-4",
    name: "Dr. Eliana Ross",
    email: "eliana.ross@medicare.com",
    specialization: "Psychiatry",
    diseasesCovered: ["Anxiety", "Depression", "Insomnia", "Panic attacks", "ADHD", "Stress management"],
    experienceYears: 11,
    consultationFee: 130,
    rating: 4.75,
    reviewsCount: 96,
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
    availableDays: ["Wednesday", "Thursday", "Friday"],
    availableSlots: ["09:00 AM", "11:00 AM", "01:00 PM", "04:00 PM"]
  },
  {
    id: "doc-5",
    name: "Dr. Marcus Thorne",
    email: "marcus.thorne@medicare.com",
    specialization: "Orthopedics",
    diseasesCovered: ["Spinal injury", "Joint pain", "Fracture", "Arthritis", "Ligament tear", "Back pain"],
    experienceYears: 16,
    consultationFee: 160,
    rating: 4.88,
    reviewsCount: 167,
    isVerified: true,
    avatarUrl: "https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&q=80&w=200",
    availableDays: ["Monday", "Tuesday", "Thursday"],
    availableSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "04:00 PM"]
  }
];

export const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: "pat-1",
    name: "John Doe",
    email: "john.doe@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    phone: "+1 (555) 234-5678",
    medicalHistory: ["Mild Asthma", "Peanut Allergy"]
  },
  {
    id: "pat-2",
    name: "Alice Smith",
    email: "alice.smith@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    phone: "+1 (555) 765-4321",
    medicalHistory: ["Seasonal Allergies", "Vitamin D Deficiency"]
  },
  {
    id: "pat-3",
    name: "Robert Miller",
    email: "robert.miller@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
    phone: "+1 (555) 890-1234",
    medicalHistory: ["Type 2 Diabetes (Controlled)"]
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    patientId: "pat-1",
    patientName: "John Doe",
    patientPhone: "+1 (555) 234-5678",
    doctorId: "doc-1",
    doctorName: "Dr. Adrian Vance",
    doctorSpecialization: "Cardiology",
    date: "2026-05-25",
    timeSlot: "10:30 AM",
    status: "APPROVED",
    notes: "Experiencing mild chest tightness during morning runs.",
    createdAt: "2026-05-21T08:30:00Z"
  },
  {
    id: "apt-2",
    patientId: "pat-2",
    patientName: "Alice Smith",
    patientPhone: "+1 (555) 765-4321",
    doctorId: "doc-3",
    doctorName: "Dr. Robert Chen",
    doctorSpecialization: "Pediatrics",
    date: "2026-05-23",
    timeSlot: "11:00 AM",
    status: "PENDING",
    notes: "Routine vaccination schedule checkup.",
    createdAt: "2026-05-21T09:15:00Z"
  },
  {
    id: "apt-3",
    patientId: "pat-1",
    patientName: "John Doe",
    patientPhone: "+1 (555) 234-5678",
    doctorId: "doc-2",
    doctorName: "Dr. Sarah Jenkins",
    doctorSpecialization: "Dermatology",
    date: "2026-05-18",
    timeSlot: "02:00 PM",
    status: "COMPLETED",
    notes: "Follow up check on acne treatment lotion results.",
    createdAt: "2026-05-15T14:20:00Z"
  },
  {
    id: "apt-4",
    patientId: "pat-3",
    patientName: "Robert Miller",
    patientPhone: "+1 (555) 890-1234",
    doctorId: "doc-5",
    doctorName: "Dr. Marcus Thorne",
    doctorSpecialization: "Orthopedics",
    date: "2026-05-26",
    timeSlot: "09:30 AM",
    status: "PENDING",
    notes: "Chronic joint pain in left knee worsening after stairs.",
    createdAt: "2026-05-21T10:05:00Z"
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    appointmentId: "apt-1",
    senderId: "doc-1",
    senderRole: "DOCTOR",
    content: "Hello John, I have reviewed your notes about the chest tightness. We will discuss this detailedly in our appointment.",
    timestamp: "2026-05-21T10:15:00Z"
  },
  {
    id: "msg-2",
    appointmentId: "apt-1",
    senderId: "pat-1",
    senderRole: "PATIENT",
    content: "Thank you Dr. Vance! Understood. Should I avoid heavy workouts until we talk?",
    timestamp: "2026-05-21T10:20:00Z"
  },
  {
    id: "msg-3",
    appointmentId: "apt-1",
    senderId: "doc-1",
    senderRole: "DOCTOR",
    content: "Yes, please stick to light walks and avoid high-intensity workouts. See you on Monday.",
    timestamp: "2026-05-21T10:24:00Z"
  }
];

export const INITIAL_FEEDBACKS: Feedback[] = [
  {
    id: "fb-1",
    userName: "Alice Smith",
    userRole: "PATIENT",
    category: "PRAISE",
    message: "The video and chat streaming is incredibly polished. Booking with Dr. Chen took less than 2 minutes!",
    sentiment: "POSITIVE",
    date: "2026-05-19"
  },
  {
    id: "fb-2",
    userName: "Robert Miller",
    userRole: "PATIENT",
    category: "SUGGESTION",
    message: "Would love to see an automated prescription download link as a PDF right in the chat room.",
    sentiment: "POSITIVE",
    date: "2026-05-20"
  },
  {
    id: "fb-3",
    userName: "Dr. Sarah Jenkins",
    userRole: "DOCTOR",
    category: "COMPLAINT",
    message: "Occasionally the scheduling calendar slot shows a minor lag when saving from a mobile browser. Please inspect the touch element triggers.",
    sentiment: "NEGATIVE",
    date: "2026-05-21"
  }
];

export const MASTER_METRICS: PlatformMetrics = {
  totalPatients: 412,
  totalDoctors: 24,
  totalConsultations: 1894,
  revenueGenerated: 208340,
  averageRating: 4.85
};
