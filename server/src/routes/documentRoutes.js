const express = require('express');
const multer = require('multer');
const { uploadDocument, getDocuments, getDocument, deleteDocument } = require('../controllers/documentController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

module.exports = router;