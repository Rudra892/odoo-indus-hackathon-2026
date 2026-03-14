const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, create } = require('../controllers/adjustmentController');

router.get('/', auth, getAll);
router.post('/', auth, create);

module.exports = router;
