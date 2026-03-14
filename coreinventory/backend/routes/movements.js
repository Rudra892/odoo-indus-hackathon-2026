const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll } = require('../controllers/movementController');

router.get('/', auth, getAll);

module.exports = router;
