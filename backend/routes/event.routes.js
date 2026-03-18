const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  getMyEvents,
  getFeaturedEvents,
  getEventsByCategory
} = require('../controllers/event.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const optionalProtect = require('../middleware/optionalProtect');

const router = express.Router();

// router.route('/')
//   .get(getEvents)
//   .post(protect, authorize('organizer', 'admin'), createEvent);

router.route('/')
  .get(optionalProtect, getEvents)
  .post(protect, authorize('organizer', 'admin'), createEvent);
  
router.route('/featured')
  .get(getFeaturedEvents);

router.route('/category/:category')
  .get(getEventsByCategory);

router.route('/organizer/me')
  .get(protect, authorize('organizer', 'admin'), getMyEvents);

router.route('/:id')
  .get(getEvent)
  .put(protect, authorize('organizer', 'admin'), updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

// Remove or comment out the upload route for now
// router.route('/:id/images')
//   .post(protect, authorize('organizer', 'admin'), upload.single('image'), uploadEventImage);

module.exports = router;