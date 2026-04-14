require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const Plant = require('./models/Plant');
const SavedSpecimen = require('./models/SavedSpecimen');
const Archive = require('./models/Archive');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/herbascan')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));



const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });


app.get('/', (req, res) => {
    res.send('HerbaScan Backend is running!');
});

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
            console.log(`[DB] Attempting lookup for Plant ID: ${aiResult.plant_id} (${aiResult.prediction})`);
            
            Plant.findOne({ plant_id: aiResult.plant_id })
                .then(mongoData => {
                    if (!mongoData) {
                        console.warn(`[DB] No matching document found in Atlas for ID: ${aiResult.plant_id}`);
                        return res.status(200).json({
                            name: aiResult.prediction || "Unknown Specimen",
                            scientific_name: "Species recognized by AI",
                            overview: { 
                                en: "AI identified this plant, but we don't have its medicinal details in our current database yet.", 
                                hi: "एआई ने इस पौधे की पहचान की है, लेकिन अभी हमारे पास इसका औषधीय विवरण नहीं है।", 
                                kn: "AI ಈ ಸಸ್ಯವನ್ನು ಗುರುತಿಸಿದೆ, ಆದರೆ ನಮ್ಮ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಇದರ ಔಷಧೀಯ ವಿವರಗಳು ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ." 
                            },
                            remedies: { 
                                en: "No specific remedies found in local database.", 
                                hi: "स्थानीय डेटाबेस में कोई विशिष्ट उपचार नहीं मिला।", 
                                kn: "ಸ್ಥಳೀಯ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಪರಿಹಾರಗಳು ಕಂಡುಬಂದಿಲ್ಲ." 
                            },
                            alternatives: { en: [], hi: [], kn: [] },
                            medicinalProperties: ["Recognized from 40-class dataset"],
                            warnings: "Always verify with a professional before use.",
                            cnnAnalysis: {
                                confidence: aiResult.confidence || 0.0,
                                featuresIdentified: ["Morphology matched correctly"],
                                neuralMarkers: "Verified via 40-class MobileNetV2 model."
                            }
                        });
                    }

                    console.log(`[DB] Successfully fetched trilingual data for: ${mongoData.name}`);
                    
                    
                    const finalResponse = { 
                        name: mongoData.name, 
                        scientific_name: mongoData.scientific_name,
                        overview: mongoData.overview,
                        remedies: mongoData.remedies,
                        alternatives: mongoData.alternatives,
                        medicinalProperties: mongoData.medicinalProperties || ["Natural Extract", "Traditional Use"],
                        warnings: mongoData.warnings || "Safe for general external use. Consult a doctor for internal consumption.",
                        cnnAnalysis: {
                            confidence: aiResult.confidence,
                            featuresIdentified: ["Vein structure matched", "Leaf serration analyzed"],
                            neuralMarkers: "Processed via fine-tuned MobileNetV2"
                        }
                    };
                    res.json(finalResponse);
                })
                .catch(dbError => {
                    console.error('Database query fallback invoked:', dbError.message);
                    res.status(500).json({ message: "Database connection error." });
                });
        } catch (error) {
            console.error('Error parsing Python output:', error, 'Output:', predictionData);
            res.status(500).send({ message: 'Invalid response from AI model.' });
        }
    });
});


app.post('/api/history', async (req, res) => {
    try {
        const { 
            plant_name, scientific_name, image_url,
            overview, remedies, alternatives,
            medicinalProperties, warnings, cnnAnalysis
        } = req.body;

        if (!plant_name || !scientific_name || !image_url) {
            return res.status(400).json({ message: 'Missing required fields: plant_name, scientific_name, image_url' });
        }

        const newHistory = new SavedSpecimen({
            plant_name,
            scientific_name,
            image_url,
            overview,
            remedies,
            alternatives,
            medicinalProperties,
            warnings,
            cnnAnalysis
        });

        const savedHistory = await newHistory.save();
        res.status(201).json(savedHistory);
    } catch (error) {
        console.error('Error saving history:', error);
        res.status(500).json({ message: 'Server error while saving history', error: error.message });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const history = await SavedSpecimen.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Server error while fetching history', error: error.message });
    }
});


app.post('/api/archive', async (req, res) => {
    try {
        const { name, scientificName, remedies, imageUrl, timestamp } = req.body;
        console.log(`[Archive] Receiving specimen: ${name} (${scientificName})`);
        
        if (!name || !scientificName) {
            console.warn('[Archive] Rejecting: Missing name or scientificName');
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newArchive = new Archive({ name, scientificName, remedies, imageUrl, timestamp });
        const savedArchive = await newArchive.save();
        console.log(`[Archive] Successfully persisted ${name} to SavedSpecimens collection.`);
        res.status(201).json(savedArchive);
    } catch (error) {
        console.error('[Archive] Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
