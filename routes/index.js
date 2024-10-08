require('dotenv').config();
const express = require('express');
const passport = require('passport');
const authcontroller = require('../controllers/authcontroller');
const usercontroller = require('../controllers/usercontroller');
const callcontroller = require('../controllers/callcontroller');
const audiocontroller = require('../controllers/audiocontroller');
const sidcontroller = require('../utils/service.utils');
const appcontroller = require('../controllers/appcontroller');
const multer = require('multer');
const { memoryStorage } = require('multer');
const { isAdmin, limitTrials } = require('../utils/authValidators.utils');

const storage = memoryStorage();
const upload = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024 }, //50MB
});

const router = express.Router();

router.get('/', appcontroller.ElderAppHome);
router.get('/elderdocs', appcontroller.documentationPage);
// Auth routes
router.post('/auth/signup', authcontroller.signup);
router.post('/auth/login', authcontroller.login);
router.post(
	'/auth/forgot-password',
	limitTrials(5),
	authcontroller.forgotPassword
);
router.post(
	'/auth/reset-password',
	limitTrials(5),
	authcontroller.resetPassword
);
router.get('/password-reset', authcontroller.servePasswordResetPage);

// User routes
router.get('/userbyid/:id', usercontroller.getUserById);
// router.get('/users', usercontroller.getAllUSers);`
router.delete(
	'/deleteUser',
	passport.authenticate('jwt', { session: false }),
	usercontroller.removeUser
);

// Call routes
router.post(
	'/make-call',
	passport.authenticate('jwt', { session: false }),
	callcontroller.makeCall
);
router.post(
	'/end-call',
	passport.authenticate('jwt', { session: false }),
	callcontroller.endCall
);
router.get('/status', callcontroller.webhook);
router.get('/twilioLogs', callcontroller.getTwilioCallLogs);
router.get('/outboundCallLogs', callcontroller.getCustomOutboundCallLogs);
router.get('/customlogs', callcontroller.getCustomCallLogs);

// Audio routes
router.post(
	'/upload',
	passport.authenticate('jwt', { session: false }),
	isAdmin,
	upload.single('audiofile'),
	audiocontroller.uploadAsset
);
router.get('/audiobycategory', audiocontroller.getAudiosByCategory);

// SID creator
router.get('/getSid', sidcontroller.createService);

module.exports = router;
