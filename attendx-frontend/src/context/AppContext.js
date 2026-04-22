import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [forceReset, setForceReset] = useState(false);

  // Attendance
  const [todayRecord, setTodayRecord] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [activeBreak, setActiveBreak] = useState(false);
  const [allEmployeesToday, setAllEmployeesToday] = useState([]);

  // Dashboard
  const [dashboardStats, setDashboardStats] = useState(null);
  const [adminOverview, setAdminOverview] = useState(null);

  // Chat / Leaves / Notifications
  const [messages, setMessages] = useState([]);
  const [leaveList, setLeaveList] = useState([]);
  const [notifList, setNotifList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Restore session on mount ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('attendx_token');
    if (!token) { setAuthLoading(false); return; }
    api.auth.me()
      .then(data => setCurrentUser(data.user))
      .catch(() => localStorage.removeItem('attendx_token'))
      .finally(() => setAuthLoading(false));
  }, []);

  // ── Auth ─────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('attendx_token', data.access_token);
    if (data.refresh_token) localStorage.setItem('attendx_refresh', data.refresh_token);
    if (data.forceReset) {
      setCurrentUser(data.user);
      setForceReset(true);
      return { success: true, forceReset: true };
    }
    setCurrentUser(data.user);
    setForceReset(false);
    return { success: true };
  };

  const logout = async () => {
    try { await api.auth.logout(); } catch (_) {}
    localStorage.removeItem('attendx_token');
    localStorage.removeItem('attendx_refresh');
    setCurrentUser(null);
    setTodayRecord(null);
    setAttendanceHistory([]);
    setMonthlySummary(null);
    setMessages([]);
    setLeaveList([]);
    setNotifList([]);
    setDashboardStats(null);
    setAdminOverview(null);
    setForceReset(false);
  };

  const resetPassword = async (newPassword) => {
    await api.auth.resetPassword(newPassword);
    const data = await api.auth.me();
    setCurrentUser(data.user);
    setForceReset(false);
  };

  // ── Attendance ───────────────────────────────────────────────
  const fetchTodayAttendance = useCallback(async () => {
    const data = await api.attendance.getToday();
    setTodayRecord(data.attendance);
    return data.attendance;
  }, []);

  const fetchAttendanceHistory = useCallback(async (month) => {
    const data = await api.attendance.getHistory(month);
    setAttendanceHistory(data.records || []);
    return data;
  }, []);

  const fetchMonthlySummary = useCallback(async (month, userId) => {
    const data = await api.attendance.getSummary(month, userId);
    setMonthlySummary(data.summary);
    return data.summary;
  }, []);

  const fetchAllEmployeesToday = useCallback(async () => {
    const data = await api.attendance.getAllToday();
    setAllEmployeesToday(data.employees || []);
    return data.employees;
  }, []);

  const checkIn = async (photoFile) => {
    const formData = new FormData();
    if (photoFile) formData.append('photo', photoFile);
    const coords = await getCoords();
    if (coords) {
      formData.append('lat', coords.latitude);
      formData.append('lng', coords.longitude);
    }
    const data = await api.attendance.checkIn(formData);
    setTodayRecord(data.attendance);
    return data;
  };

  const checkOut = async (photoFile) => {
    const formData = new FormData();
    if (photoFile) formData.append('photo', photoFile);
    const coords = await getCoords();
    if (coords) {
      formData.append('lat', coords.latitude);
      formData.append('lng', coords.longitude);
    }
    const data = await api.attendance.checkOut(formData);
    setTodayRecord(data.attendance);
    return data;
  };

  const startBreak = async () => {
    const data = await api.attendance.startBreak();
    setActiveBreak(true);
    return data;
  };

  const endBreak = async () => {
    const data = await api.attendance.endBreak();
    setActiveBreak(false);
    if (data.attendance) setTodayRecord(data.attendance);
    return data;
  };

  const overrideAttendance = async (id, payload) => {
    return await api.attendance.override(id, payload);
  };

  // ── Dashboard ────────────────────────────────────────────────
  const fetchDashboard = useCallback(async (month) => {
    const data = await api.dashboard.me(month);
    setDashboardStats(data);
    return data;
  }, []);

  const fetchAdminOverview = useCallback(async (month) => {
    const data = await api.dashboard.overview(month);
    setAdminOverview(data);
    return data;
  }, []);

  // ── Chat ─────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (page = 1) => {
    const data = await api.chat.getMessages(page, 100);
    setMessages(data.messages || []);
    return data;
  }, []);

  const sendMessage = async (text) => {
    const data = await api.chat.sendMessage(text);
    setMessages(prev => [...prev, data.message]);
    return data;
  };

  const deleteMessage = async (id) => {
    await api.chat.deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  // ── Leaves ───────────────────────────────────────────────────
  const fetchLeaves = useCallback(async (status) => {
    const data = await api.leaves.list(status);
    setLeaveList(data.leaves || []);
    return data.leaves;
  }, []);

  const applyLeave = async (payload) => {
    const data = await api.leaves.apply(payload);
    setLeaveList(prev => [data.leave, ...prev]);
    return data;
  };

  const approveLeave = async (id) => {
    const data = await api.leaves.approve(id);
    setLeaveList(prev => prev.map(l => l.id === id ? data.leave : l));
    return data;
  };

  const rejectLeave = async (id) => {
    const data = await api.leaves.reject(id);
    setLeaveList(prev => prev.map(l => l.id === id ? data.leave : l));
    return data;
  };

  const cancelLeave = async (id) => {
    await api.leaves.cancel(id);
    setLeaveList(prev => prev.filter(l => l.id !== id));
  };

  // ── Notifications ────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const data = await api.notifications.list();
    setNotifList(data.notifications || []);
    setUnreadCount(data.unread_count || 0);
    return data;
  }, []);

  const markAllNotifRead = async () => {
    await api.notifications.markAllRead();
    setNotifList(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const markNotifRead = async (id) => {
    await api.notifications.markOneRead(id);
    setNotifList(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // ── Users (admin) ────────────────────────────────────────────
  const createUser = async (payload) => {
    return await api.users.create(payload);
  };

  const updateUser = async (id, payload) => {
    const data = await api.users.update(id, payload);
    if (currentUser && id === currentUser.id) setCurrentUser(data.user);
    return data;
  };

  return (
    <AppContext.Provider value={{
      currentUser, authLoading, forceReset,
      login, logout, resetPassword,
      todayRecord, attendanceHistory, monthlySummary, activeBreak,
      fetchTodayAttendance, fetchAttendanceHistory, fetchMonthlySummary,
      checkIn, checkOut, startBreak, endBreak, overrideAttendance,
      allEmployeesToday, fetchAllEmployeesToday,
      dashboardStats, adminOverview, fetchDashboard, fetchAdminOverview,
      messages, fetchMessages, sendMessage, deleteMessage,
      leaveList, fetchLeaves, applyLeave, approveLeave, rejectLeave, cancelLeave,
      notifList, unreadCount, fetchNotifications, markAllNotifRead, markNotifRead,
      createUser, updateUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

function getCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos.coords),
      ()  => resolve(null),
      { timeout: 5000 }
    );
  });
}
