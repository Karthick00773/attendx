import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './AttendancePage.css';

function formatHrs(h) { return h != null ? Number(h).toFixed(2) + 'h' : '—'; }

export default function AttendancePage() {
  const {
    currentUser,
    todayRecord, fetchTodayAttendance,
    attendanceHistory, fetchAttendanceHistory,
    monthlySummary, fetchMonthlySummary,
    activeBreak,
    checkIn, checkOut, startBreak, endBreak,
  } = useApp();

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [breakLoading, setBreakLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendanceHistory();
    fetchMonthlySummary();
  }, [fetchTodayAttendance, fetchAttendanceHistory, fetchMonthlySummary]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setMsg('Getting your location…');
    setError('');
    try {
      await checkIn();
      setMsg('');
    } catch (err) {
      setError(err.message || 'Check-in failed.');
      setMsg('');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    setMsg('Calculating hours…');
    setError('');
    try {
      await checkOut();
      setMsg('');
    } catch (err) {
      setError(err.message || 'Check-out failed.');
      setMsg('');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleBreak = async () => {
    setBreakLoading(true);
    setError('');
    try {
      if (activeBreak) await endBreak();
      else await startBreak();
    } catch (err) {
      setError(err.message || 'Break action failed.');
    } finally {
      setBreakLoading(false);
    }
  };

  const today = todayRecord;
  const isBreak = activeBreak;

  const statusLabel = !today ? 'Not Checked In'
    : isBreak ? 'On Break'
    : today.check_out_time ? 'Checked Out'
    : 'Present';

  const statusColor = !today ? 'badge-red'
    : isBreak ? 'badge-orange'
    : today.check_out_time ? 'badge-blue'
    : 'badge-green';

  const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—';

  return (
    <div className="page animate-fadeup">
      <div className="page-header">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="page-sub">Track your daily working hours</p>
        </div>
        <span className={`badge ${statusColor}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          ● {statusLabel}
        </span>
      </div>

      {/* Check-in/out card */}
      <div className="card attend-main-card">
        <div className="attend-header">
          <div className="attend-avatar avatar avatar-xl">{currentUser?.avatar_initials}</div>
          <div className="attend-info">
            <h3>{currentUser?.name}</h3>
            <p>{currentUser?.designation} · {currentUser?.department}</p>
            <p className="attend-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="attend-times">
          <div className="attend-time-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="attend-time-label">Check-In</span>
            <span className="attend-time-val">{fmtTime(today?.check_in_time)}</span>
          </div>
          <div className="attend-time-divider">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
          <div className="attend-time-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="attend-time-label">Check-Out</span>
            <span className="attend-time-val">{fmtTime(today?.check_out_time)}</span>
          </div>
        </div>

        {today && (
          <div className="attend-hours-row">
            <div className="attend-hour-chip">
              <span>Normal</span>
              <strong>{formatHrs(today.normal_hours)}</strong>
            </div>
            <div className="attend-hour-chip attend-hour-chip-ot">
              <span>Overtime</span>
              <strong>{formatHrs(today.overtime_hours)}</strong>
            </div>
            <div className="attend-hour-chip attend-hour-chip-total">
              <span>Total</span>
              <strong>{formatHrs(today.total_hours)}</strong>
            </div>
          </div>
        )}

        {isBreak && (
          <div className="break-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            <span>You are currently on a <strong>break</strong>. Time is paused.</span>
          </div>
        )}

        {msg && <p className="gps-msg">{msg}</p>}
        {error && <p className="gps-msg" style={{ color: 'var(--red)' }}>{error}</p>}

        <div className="attend-actions">
          {!today && (
            <button className="btn btn-primary btn-lg attend-btn" onClick={handleCheckIn} disabled={checkingIn}>
              {checkingIn ? (
                <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              )}
              {checkingIn ? 'Checking In…' : '✓ Check In'}
            </button>
          )}
          {today && !today.check_out_time && (
            <>
              <button
                className={`btn btn-lg attend-btn ${isBreak ? 'btn-success' : 'btn-outline'}`}
                onClick={handleBreak}
                disabled={breakLoading}
              >
                {isBreak ? (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>Resume Work</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Take Break</>
                )}
              </button>
              <button className="btn btn-danger btn-lg attend-btn" onClick={handleCheckOut} disabled={checkingOut}>
                {checkingOut ? (
                  <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                )}
                {checkingOut ? 'Checking Out…' : '← Check Out'}
              </button>
            </>
          )}
          {today?.check_out_time && (
            <div className="attend-done-msg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Great work today! See you tomorrow 🎉
            </div>
          )}
        </div>
      </div>

      {/* Monthly summary */}
      {monthlySummary && (
        <div className="grid-3" style={{ marginTop: 24, marginBottom: 24 }}>
          <div className="card attend-stat-mini">
            <span className="attend-stat-label">Normal Hours (Month)</span>
            <span className="attend-stat-val" style={{ color: 'var(--accent)' }}>{Number(monthlySummary.normal_hours || 0).toFixed(1)}h</span>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${Math.min(((monthlySummary.normal_hours || 0) / 180) * 100, 100)}%` }} />
            </div>
            <span className="attend-stat-sub">Target: 180h</span>
          </div>
          <div className="card attend-stat-mini">
            <span className="attend-stat-label">Overtime (Month)</span>
            <span className="attend-stat-val" style={{ color: 'var(--orange)' }}>{Number(monthlySummary.overtime_hours || 0).toFixed(1)}h</span>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${Math.min(((monthlySummary.overtime_hours || 0) / 40) * 100, 100)}%`, background: 'var(--orange)' }} />
            </div>
            <span className="attend-stat-sub">Max tracked: 40h</span>
          </div>
          <div className="card attend-stat-mini">
            <span className="attend-stat-label">Days Present (Month)</span>
            <span className="attend-stat-val" style={{ color: 'var(--green)' }}>{monthlySummary.present_days || 0}</span>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${Math.min(((monthlySummary.present_days || 0) / 22) * 100, 100)}%`, background: 'var(--green)' }} />
            </div>
            <span className="attend-stat-sub">Absent: {monthlySummary.absent_days || 0} · On Leave: {monthlySummary.leave_days || 0}</span>
          </div>
        </div>
      )}

      {/* History */}
      <div className="card" style={{ padding: 24 }}>
        <h3 className="card-title">Attendance History</h3>
        {attendanceHistory.length === 0 ? (
          <p className="empty-msg">No records yet</p>
        ) : (
          <div className="attend-history">
            {attendanceHistory.map((r, i) => (
              <div key={r.id || i} className="history-card">
                <div className="history-card-head">
                  <div>
                    <span className="history-day">{new Date(r.date).toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                    <span className="history-date">{new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <span className={`badge ${r.status === 'present' ? 'badge-green' : r.status === 'on_leave' ? 'badge-orange' : 'badge-red'}`}>
                    {r.status === 'present' ? 'Present' : r.status === 'on_leave' ? 'On Leave' : 'Absent'}
                  </span>
                </div>
                <div className="history-times">
                  <div className="history-time-box">
                    <span className="history-time-label">Check-In</span>
                    <span className="history-time-val">{fmtTime(r.check_in_time)}</span>
                    {r.check_in_photo_url ? (
                      <img src={r.check_in_photo_url} alt="check-in" className="history-photo" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', marginTop: 4 }} />
                    ) : (
                      <div className="history-photo-placeholder">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                        </svg>
                        <span>No Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="history-time-box">
                    <span className="history-time-label">Check-Out</span>
                    <span className="history-time-val">{fmtTime(r.check_out_time)}</span>
                    {r.check_out_photo_url ? (
                      <img src={r.check_out_photo_url} alt="check-out" className="history-photo" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', marginTop: 4 }} />
                    ) : (
                      <div className="history-photo-placeholder">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                        </svg>
                        <span>No Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="history-hours">
                    <div className="history-hour-item"><span>Normal</span><strong style={{ color: 'var(--accent)' }}>{formatHrs(r.normal_hours)}</strong></div>
                    <div className="history-hour-item"><span>Overtime</span><strong style={{ color: 'var(--orange)' }}>{formatHrs(r.overtime_hours)}</strong></div>
                    <div className="history-hour-item"><span>Total</span><strong style={{ color: 'var(--green)' }}>{formatHrs(r.total_hours)}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
