import React, { useState, useEffect, useRef,  } from 'react';
import { useApp } from '../context/AppContext';
import './AttendancePage.css';

function formatHrs(h) { return h != null ? Number(h).toFixed(2) + 'h' : '—'; }

/* ─── Camera Modal ──────────────────────────────────────────────── */
function CameraModal({ mode, onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [camError, setCamError] = useState('');
  const [ready, setReady] = useState(false);

  // Start camera
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      } catch (e) {
        setCamError('Camera access denied. Please allow camera permission and try again.');
      }
    })();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL('image/jpeg', 0.85));
  };

  const handleRetake = () => setCaptured(null);

  const handleConfirm = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onCapture(captured);
  };

  const handleCancel = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    onCancel();
  };

  return (
    <div className="cam-overlay" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
      <div className="cam-modal">
        <div className="cam-modal-header">
          <div className="cam-modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
            {mode === 'in' ? 'Check-In Photo' : 'Check-Out Photo'}
          </div>
          <button className="cam-close-btn" onClick={handleCancel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="cam-body">
          {camError ? (
            <div className="cam-error">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>{camError}</p>
            </div>
          ) : (
            <>
              <div className="cam-viewfinder" style={{ display: captured ? 'none' : 'block' }}>
                {!ready && (
                  <div className="cam-loading">
                    <svg className="spin-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    <span>Starting camera…</span>
                  </div>
                )}
                <video ref={videoRef} autoPlay playsInline muted className="cam-video" style={{ opacity: ready ? 1 : 0 }} />
                <div className="cam-face-guide" />
              </div>

              {captured && (
                <div className="cam-preview">
                  <img src={captured} alt="Captured" className="cam-preview-img" />
                  <div className="cam-preview-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Photo captured
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </>
          )}
        </div>

        {!camError && (
          <div className="cam-footer">
            {!captured ? (
              <>
                <button className="btn btn-outline" onClick={handleCancel}>Cancel</button>
                <button className="btn btn-primary cam-capture-btn" onClick={handleCapture} disabled={!ready}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  </svg>
                  Capture Photo
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" onClick={handleRetake}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.6"/>
                  </svg>
                  Retake
                </button>
                <button className="btn btn-primary" onClick={handleConfirm}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {mode === 'in' ? 'Confirm & Check In' : 'Confirm & Check Out'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
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
  // Camera modal state: null | 'in' | 'out'
  const [cameraMode, setCameraMode] = useState(null);

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendanceHistory();
    fetchMonthlySummary();
  }, [fetchTodayAttendance, fetchAttendanceHistory, fetchMonthlySummary]);

  // Called after user confirms photo for check-in
  const handleCheckInPhoto = async (photoDataUrl) => {
    setCameraMode(null);
    setCheckingIn(true);
    setMsg('Getting your location…');
    setError('');
    try {
      await checkIn(photoDataUrl);
      setMsg('');
    } catch (err) {
      setError(err.message || 'Check-in failed.');
      setMsg('');
    } finally {
      setCheckingIn(false);
    }
  };

  // Called after user confirms photo for check-out
  const handleCheckOutPhoto = async (photoDataUrl) => {
    setCameraMode(null);
    setCheckingOut(true);
    setMsg('Calculating hours…');
    setError('');
    try {
      await checkOut(photoDataUrl);
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
      {/* Camera Modal */}
      {cameraMode && (
        <CameraModal
          mode={cameraMode}
          onCapture={cameraMode === 'in' ? handleCheckInPhoto : handleCheckOutPhoto}
          onCancel={() => setCameraMode(null)}
        />
      )}

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
            {today?.check_in_photo_url && (
              <img src={today.check_in_photo_url} alt="check-in selfie" className="attend-today-photo" />
            )}
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
            {today?.check_out_photo_url && (
              <img src={today.check_out_photo_url} alt="check-out selfie" className="attend-today-photo" />
            )}
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
            <button
              className="btn btn-primary btn-lg attend-btn"
              onClick={() => setCameraMode('in')}
              disabled={checkingIn}
            >
              {checkingIn ? (
                <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
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
              <button
                className="btn btn-danger btn-lg attend-btn"
                onClick={() => setCameraMode('out')}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <svg className="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
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
