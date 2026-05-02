require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const Plant = require('./models/Plant');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/herbascan', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
})
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Mongoose will attempt to automatically reconnect.');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime connection error:', err);
});


// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
    res.send('HerbaScan Backend is running!');
});

// Authentication Routes
app.use('/api/auth', require('./routes/auth'));

app.post('/api/identify', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const pythonScriptPath = path.join(__dirname, 'scripts', 'predict.py');

    const pyProcess = spawn('python', [pythonScriptPath, imagePath]);

    let predictionData = '';

    pyProcess.stdout.on('data', (data) => {
        predictionData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
        console.error(`Python stderr: ${data}`);
    });

    pyProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python process exited with code ${code}`);
            return res.status(500).send({ message: 'Error processing image to predict plant.' });
        }
        
        try {
            const aiResult = JSON.parse(predictionData);
            
            Plant.findOne({ name: aiResult.prediction })
                .then(mongoData => {
                    const mappedRemedies = mongoData && mongoData.remedies ? [
                        { condition: "Traditional Use (EN)", preparation: mongoData.remedies.en || "No English remedy data available.", expectedOutcome: "Symptom relief." },
                        { condition: "पारंपरिक उपयोग (HI)", preparation: mongoData.remedies.hi || "हिंदी उपचार डेटा उपलब्ध नहीं है।", expectedOutcome: "लक्षणों से राहत।" },
                        { condition: "ಸಾಂಪ್ರದಾಯಿಕ ಬಳಕೆ (KN)", preparation: mongoData.remedies.kn || "ಕನ್ನಡ ಪರಿಹಾರ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.", expectedOutcome: "ರೋಗಲಕ್ಷಣ ಪರಿಹಾರ." }
                    ] : [
                        { condition: "Traditional Use (EN)", preparation: "No English remedy data available.", expectedOutcome: "Symptom relief." },
                        { condition: "पारंपरिक उपयोग (HI)", preparation: "हिंदी उपचार डेटा उपलब्ध नहीं है।", expectedOutcome: "लक्षणों से राहत।" },
                        { condition: "ಸಾಂಪ್ರದಾಯಿಕ ಬಳಕೆ (KN)", preparation: "ಕನ್ನಡ ಪರಿಹಾರ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.", expectedOutcome: "ರೋಗಲಕ್ಷಣ ಪರಿಹಾರ." }
                    ];

                    const finalResponse = { 
                        name: aiResult.prediction || "Unknown Plant",
                        scientificName: aiResult.scientific_name || "Unknown Scientific Name",
                        description: "A medicinal herb identified by the HerbaScan AI.",
                        medicinalProperties: ["Natural healing properties", "Ethnobotanical significance"],
                        remedies: mappedRemedies,
                        alternatives: [
                            { name: "Consult a herbalist", reason: "For personalized care based on condition severity." }
                        ],
                        warnings: "Always consult a healthcare professional before using herbal remedies.",
                        cnnAnalysis: {
                            confidence: aiResult.confidence || 0.0,
                            featuresIdentified: ["leaf shape morphology", "venation pattern indexing"],
                            neuralMarkers: "Standardized through backend CNN."
                        }
                    };
                    res.status(200).json(finalResponse);
                })
                .catch(dbError => {
                    console.error('Database query error:', dbError);
                    res.status(500).json({ message: 'Error retrieving database details' });
                });
        } catch (error) {
            console.error('Error parsing Python output:', error, 'Output:', predictionData);
            res.status(500).send({ message: 'Invalid response from AI model.' });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
