const express = require('express');
const router = express.Router();
const { getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/', getOffers);
router.post('/', auth, adminAuth, createOffer);
router.put('/:id', auth, adminAuth, updateOffer);
router.delete('/:id', auth, adminAuth, deleteOffer);

module.exports = router;
