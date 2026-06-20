import express from 'express';
import { backendDb } from '../data/backendDb.js';

export const appNetworkRouter = express.Router();
appNetworkRouter.use(express.json());

/**
 * ====================================================
 * SYSTEM STATE SYNC & SCENARIO SEEDING ENDPOINTS
 * ====================================================
 */

/**
 * POST /api/scenarios/seed
 * Seeds the backend in-memory database with custom scenario data
 */
appNetworkRouter.post('/scenarios/seed', (req, res) => {
  const { emails, calendarEvents } = req.body;
  if (!Array.isArray(emails) || !Array.isArray(calendarEvents)) {
    res.status(400).json({ success: false, message: 'Please provide array of "emails" and "calendarEvents" fields.' });
    return;
  }
  const result = backendDb.seedState(emails, calendarEvents);
  res.json({ success: true, ...result });
});

/**
 * GET /api/scenarios/state
 * Pulls the raw backend state for both emails and events
 */
appNetworkRouter.get('/scenarios/state', (req, res) => {
  res.json({ success: true, ...backendDb.getState() });
});

/**
 * POST /api/scenarios/reset
 * Resets database back to standard default dataset
 */
appNetworkRouter.post('/scenarios/reset', (req, res) => {
  const result = backendDb.resetToDefaults();
  res.json({ success: true, ...result });
});


/**
 * ====================================================
 * CALENDAR APP API ENDPOINTS
 * ====================================================
 */

/**
 * GET /api/calendar/events
 */
appNetworkRouter.get('/calendar/events', (req, res) => {
  const { date } = req.query;
  const list = backendDb.list_events({ date: typeof date === 'string' ? date : undefined });
  res.json({ success: true, count: list.length, data: list });
});

/**
 * GET /api/calendar/availability
 */
appNetworkRouter.get('/calendar/availability', (req, res) => {
  const { date, timeSlot } = req.query;
  if (!date || !timeSlot || typeof date !== 'string' || typeof timeSlot !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Query parameters "date" (YYYY-MM-DD) and "timeSlot" (e.g., "11.00") are required.'
    });
    return;
  }

  const result = backendDb.check_availability({ date, timeSlot });
  res.json({ success: true, ...result });
});

/**
 * POST /api/calendar/events
 */
appNetworkRouter.post('/calendar/events', (req, res) => {
  const { title, date, time, color } = req.body;
  if (!title || !date || !time) {
    res.status(400).json({
      success: false,
      message: 'Body fields "title", "date" (YYYY-MM-DD), and "time" (e.g. "9.00 AM – 10.30 PM") are required.'
    });
    return;
  }

  const created = backendDb.create_event({ title, date, time, color });
  res.status(211).json({ success: true, message: 'Event scheduled successfully.', data: created });
});

/**
 * DELETE /api/calendar/events/:id
 */
appNetworkRouter.delete('/calendar/events/:id', (req, res) => {
  const { id } = req.params;
  const result = backendDb.delete_event({ id });
  if (!result.success) {
    res.status(404).json({ success: false, message: result.message });
    return;
  }
  res.json({ success: true, message: result.message });
});


/**
 * ====================================================
 * EMAIL CLIENT APP API ENDPOINTS
 * ====================================================
 */

/**
 * GET /api/emails
 */
appNetworkRouter.get('/emails', (req, res) => {
  const { folder } = req.query;
  const list = backendDb.list_emails({ folder: typeof folder === 'string' ? folder : undefined });
  res.json({ success: true, count: list.length, data: list });
});

/**
 * GET /api/emails/search
 */
appNetworkRouter.get('/emails/search', (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    res.status(400).json({ success: false, message: 'Query parameter "q" is required.' });
    return;
  }

  const list = backendDb.search_emails({ query: q });
  res.json({ success: true, matchesCount: list.length, data: list });
});

/**
 * POST /api/emails
 */
appNetworkRouter.post('/email', (req, res) => {
  const { recipientEmail, subject, body, folder } = req.body;
  if (!recipientEmail || !subject || !body) {
    res.status(400).json({
      success: false,
      message: 'Body fields "recipientEmail", "subject", and "body" are required.'
    });
    return;
  }

  const created = backendDb.send_email({ recipientEmail, subject, body });
  if (folder && folder !== 'Sent') {
    // If a custom folder was requested (e.g. Drafts), adjust it directly
    created.folder = folder;
  }
  res.status(211).json({ success: true, message: 'Email sent/created successfully.', data: created });
});

/**
 * PUT /api/emails/:id/archive
 */
appNetworkRouter.put('/emails/:id/archive', (req, res) => {
  const { id } = req.params;
  const result = backendDb.archive_email({ id });
  if (!result.success) {
    res.status(404).json({ success: false, message: result.message });
    return;
  }
  res.json({ success: true, message: result.message });
});

/**
 * PUT /api/emails/:id/read
 */
appNetworkRouter.put('/emails/:id/read', (req, res) => {
  const { id } = req.params;
  const { read } = req.body;

  if (typeof read !== 'boolean') {
    res.status(400).json({ success: false, message: 'Body field "read" (boolean) is required.' });
    return;
  }

  const result = backendDb.mark_as_read({ id, read });
  if (!result.success) {
    res.status(404).json({ success: false, message: `Email with ID "${id}" not found.` });
    return;
  }
  res.json({ success: true, message: `Email read state modified.` });
});

/**
 * DELETE /api/emails/:id
 */
appNetworkRouter.delete('/emails/:id', (req, res) => {
  const { id } = req.params;
  const result = backendDb.delete_email({ id });
  res.json({ success: true, message: result.message });
});

/**
 * PUT /api/emails/:id/restore
 */
appNetworkRouter.put('/emails/:id/restore', (req, res) => {
  const { id } = req.params;
  const result = backendDb.restore_email({ id });
  if (!result.success) {
    res.status(404).json({ success: false, message: result.message });
    return;
  }
  res.json({ success: true, message: result.message });
});