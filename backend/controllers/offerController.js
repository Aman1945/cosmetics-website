const Offer = require('../models/Offer');

exports.getOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ isActive: true }).populate('targetProductId');
        res.json({ success: true, data: { offers } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const offer = new Offer(req.body);
        await offer.save();
        res.status(201).json({ success: true, data: { offer } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: { offer } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        await Offer.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Offer deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
