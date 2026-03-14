const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAll, create, update, confirm, validate, cancel, remove } = require('../controllers/receiptController');

router.get('/', auth, getAll);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.put('/:id/confirm', auth, confirm);
router.put('/:id/validate', auth, validate);
router.put('/:id/cancel', auth, cancel);
router.delete('/:id', auth, remove);

module.exports = router;
