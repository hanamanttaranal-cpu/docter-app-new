import React, { useState } from 'react';
import { User, DoctorProfile, Feedback, PlatformMetrics } from '../types';
import { Power, Trash2, Mail, ShieldAlert, Heart, Settings, RefreshCw, BarChart2, Star, CheckSquare, MessageSquare, AlertTriangle, MessageCircle, TrendingUp, Users, Award } from 'lucide-react';

interface AdminDashboardProps {
  users: User[];
  doctors: DoctorProfile[];
  feedbacks: Feedback[];
  metrics: PlatformMetrics;
  onDeleteUser: (userId: string) => void;
  onVerifyDoctor: (doctorId: string) => void;
  triggerStompFrame: (frame: string) => void;
}

export default function AdminDashboard({
  users,
  doctors,
  feedbacks,
  metrics,
  onDeleteUser,
  onVerifyDoctor,
  triggerStompFrame
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'doctors' | 'feedback'>('users');
  const [filterRole, setFilterRole] = useState<'ALL' | 'PATIENT' | 'DOCTOR' | 'ADMIN'>('ALL');

  const filteredUsers = users.filter(usr => {
    if (filterRole === 'ALL') return true;
    return usr.role === filterRole;
  });

  const handleDeleteClick = (usrId: string, name: string) => {
    if (confirm(`Are you sure you want to perform a hard cascade delete on User "${name}"? This action is irreversible on the Spring-MySQL cluster.`)) {
      onDeleteUser(usrId);
      triggerStompFrame(`SEND\ndestination:/app/admin/purge-user\ncontent-type:application/json\n\n{"userId":"${usrId}","initiator":"ADMIN"}`);
    }
  };

  const handleVerifyClick = (docId: string, docName: string) => {
    onVerifyDoctor(docId);
    triggerStompFrame(`SEND\ndestination:/app/admin/verify-doctor\ncontent-type:application/json\n\n{"doctorId":"${docId}","isVerified":true}`);
  };

  return (
    <div className="space-y-8 font-sans" id="admin-root">
      {/* GLOBAL METRICS BENTO GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-3xs font-black text-gray-400 uppercase tracking-widest block">Total consultations</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{metrics.totalConsultations}</p>
            <span className="text-4xs text-emerald-600 font-bold flex items-center gap-1 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +14.2% since yesterday
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-3xs font-black text-gray-400 uppercase tracking-widest block">Accrued fees generated</span>
            <p className="text-xl font-bold text-gray-900 mt-1">${metrics.revenueGenerated.toLocaleString()}</p>
            <span className="text-4xs text-emerald-600 font-bold flex items-center gap-1 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +8.1% weekly average
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-3xs font-black text-gray-400 uppercase tracking-widest block">Active Patients list</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{metrics.totalPatients}</p>
            <span className="text-4xs text-gray-400 font-bold block mt-1 font-mono">
              Standard API sync active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-3xs font-black text-gray-400 uppercase tracking-widest block">Portal Satisfaction</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{metrics.averageRating} / 5.0</p>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="w-3 h-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CORE CONTROL SHEET */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {/* Navigation header for Admin Tabs */}
        <div className="p-6 bg-slate-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'users' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              User Purge Ledger
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'doctors' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              Doctor Credential Verification
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'feedback' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              Platform Feedback Analyzers
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerStompFrame('SEND\ndestination:/app/admin/sync\n\n')}
              className="p-2 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              title="Force Sync State from Spring Boot Server"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-2xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-sm">
              Role: System Administrator
            </span>
          </div>
        </div>

        {/* Tab contents (User management sheet) */}
        <div className="p-6" id="admin-active-tab-panel">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-2 items-center pb-2 border-b border-slate-50">
                <span className="text-xs text-gray-400 font-bold uppercase">Role Filtering:</span>
                {['ALL', 'PATIENT', 'DOCTOR', 'ADMIN'].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilterRole(r as any)}
                    className={`text-3xs font-extrabold px-2 py-1 rounded-md transition-all ${
                      filterRole === r
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Table ledger */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-2xs tracking-wider">
                      <th className="p-4">Identified User</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Authorization Scope</th>
                      <th className="p-4 text-right">Database Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(usr => (
                      <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors" id={`usr-row-${usr.id}`}>
                        <td className="p-4 font-semibold text-gray-900 flex items-center gap-2">
                          <img src={usr.avatarUrl} alt={usr.name} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                          <span>{usr.name}</span>
                        </td>
                        <td className="p-4 text-gray-600 font-mono text-2xs">{usr.email}</td>
                        <td className="p-4">
                          <span className={`inline-block text-3xs font-extrabold px-2 py-0.5 rounded-sm uppercase ${
                            usr.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                            usr.role === 'DOCTOR' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {usr.role !== 'ADMIN' ? (
                            <button
                              onClick={() => handleDeleteClick(usr.id, usr.name)}
                              className="text-rose-500 hover:text-white hover:bg-rose-600 p-2 border border-rose-100 rounded-lg transition-all"
                              title="Cascade Delete User"
                              id={`delete-user-${usr.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-3xs italic text-slate-400">Owner protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-50 p-4 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-2xs text-blue-800 font-medium">Verify doctor certificates and medical license logs before enabling doctor discovery routing on the platform. Verification status immediately affects patient search results.</p>
              </div>

              {/* Verified registry card profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(doc => (
                  <div key={doc.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between" id={`admin-doc-${doc.id}`}>
                    <div className="flex items-center gap-3">
                      <img src={doc.avatarUrl} alt={doc.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{doc.name}</h4>
                        <p className="text-2xs font-semibold text-emerald-600">{doc.specialization}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-4xs text-slate-400 font-bold block uppercase">MD Lic. Status</span>
                        <span className={`text-3xs font-extrabold px-2 py-0.5 rounded-sm uppercase ${
                          doc.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.isVerified ? 'VERIFIED' : 'PENDING EVAL'}
                        </span>
                      </div>

                      {!doc.isVerified && (
                        <button
                          onClick={() => handleVerifyClick(doc.id, doc.name)}
                          className="text-3xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg transition-colors"
                          id={`verify-btn-${doc.id}`}
                        >
                          Verify credentials
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sentiment box 1 */}
                <div className="bg-emerald-50/50 p-4 border border-emerald-50 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-extrabold text-sm font-mono">+</div>
                  <div>
                    <span className="text-3xs text-gray-500 font-bold uppercase tracking-wider block">Positive Sentiment</span>
                    <p className="text-md font-bold text-emerald-800">88% of users</p>
                  </div>
                </div>

                {/* Sentiment box 2 */}
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-extrabold text-sm font-mono">~</div>
                  <div>
                    <span className="text-3xs text-gray-500 font-bold uppercase tracking-wider block">Neutral Sentiment</span>
                    <p className="text-md font-bold text-slate-700">9% of users</p>
                  </div>
                </div>

                {/* Sentiment box 3 */}
                <div className="bg-rose-50/50 p-4 border border-rose-50 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-extrabold text-sm font-mono">-</div>
                  <div>
                    <span className="text-3xs text-gray-500 font-bold uppercase tracking-wider block">Negative Sentiment</span>
                    <p className="text-md font-bold text-rose-800">3% of users</p>
                  </div>
                </div>
              </div>

              {/* Feedbacks list */}
              <div className="space-y-3 mt-4">
                <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Semantic Feedback Log</h4>

                {feedbacks.map(fb => (
                  <div key={fb.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-3" id={`fb-card-${fb.id}`}>
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">{fb.userName}</span>
                        <span className="text-4xs font-bold text-slate-400">({fb.userRole})</span>
                        <span className={`text-4xs px-1.5 py-0.5 rounded-sm font-extrabold ${
                          fb.category === 'COMPLAINT' ? 'bg-rose-50 text-rose-800' :
                          fb.category === 'PRAISE' ? 'bg-emerald-50 text-emerald-800' :
                          'bg-indigo-50 text-indigo-800'
                        }`}>
                          {fb.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 block">"{fb.message}"</p>
                    </div>

                    <div className="flex md:flex-col items-start md:items-end gap-1.5 shrink-0">
                      <span className="text-4xs text-slate-400 font-mono">{fb.date}</span>
                      <span className={`inline-block text-4xs font-bold px-2 py-0.5 rounded-md ${
                        fb.sentiment === 'POSITIVE' ? 'bg-emerald-50 text-emerald-700' :
                        fb.sentiment === 'NEUTRAL' ? 'bg-slate-100 text-slate-600' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {fb.sentiment} Sentiment
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
