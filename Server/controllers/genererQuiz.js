const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const Lesson = require('../models/lessonModel');


const genererQuiz = async (req, res) => {
    const lessonId = req.body.lessonId;
    console.log(lessonId);

    if (!lessonId) {
        return res.status(400).json({ error: "ID de la leçon manquant." });
    }

    try {
        // Chercher la leçon par son _id
        const lesson = await Lesson.findById(lessonId).exec();
      console.log(lesson);
        if (!lesson) {
            return res.status(404).json({ error: "Leçon introuvable." });
        }

        // Vérifier que la leçon a un PDF
        if (!lesson.content || lesson.content.type !== 'pdf' || !lesson.content.url) {
            return res.status(400).json({ error: "La leçon ne contient pas de PDF valide." });
        }

        const pdfUrl = lesson.content.url;
        const requestedCount = Number(req.body.count);
        const questionCount = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 5;

        // Le reste de ton code actuel, pour télécharger et traiter le PDF
        const response = await axios.get(pdfUrl, { responseType: "stream" });

        const uploadsDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        const filename = `upload_${Date.now()}.pdf`;
        const localFilePath = path.join(uploadsDir, filename);

        const writer = fs.createWriteStream(localFilePath);
        response.data.pipe(writer);

        writer.on("finish", () => {
            const scriptPath = path.join(__dirname, "../IA_model/generate.py");
            const venvPython = path.join(__dirname, "../../.venv/Scripts/python.exe");
            const pythonCmd = process.env.PYTHON_EXECUTABLE || (fs.existsSync(venvPython) ? venvPython : "python");

            const scriptArgs = [
                scriptPath,
                "--pdf",
                localFilePath,
                "--count",
                String(questionCount),
                "--mode",
                "hybrid",
                "--max-model-sentences",
                String(Math.max(questionCount, 4)),
            ];

            execFile(pythonCmd, scriptArgs, (error, stdout, stderr) => {
                if (error) {
                    console.error("Erreur lors de l'exécution :", error);
                    if (stderr) {
                        console.error("STDERR Python :", stderr);
                    }
                    fs.unlink(localFilePath, () => {});
                    return res.status(500).json({ error: "Erreur interne lors de la génération" });
                }

                try {
                    const result = JSON.parse(stdout);
                    res.json({ data: result });

                    // Suppression du fichier après usage
                    fs.unlink(localFilePath, (err) => {
                        if (err) console.error("Erreur lors de la suppression du fichier :", err);
                    });

                } catch (parseError) {
                    console.error("Erreur de parsing :", parseError, "STDOUT:", stdout);
                    if (stderr) {
                        console.error("STDERR Python :", stderr);
                    }
                    fs.unlink(localFilePath, () => {});
                    res.status(500).json({ error: "Réponse invalide du script Python" });
                }
            });
        });

        writer.on("error", (err) => {
            console.error("Erreur lors de l'enregistrement du fichier :", err);
            res.status(500).json({ error: "Erreur lors de l'enregistrement du fichier" });
        });

    } catch (err) {
        console.error("Erreur lors du traitement :", err.message);
        res.status(500).json({ error: "Erreur serveur interne" });
    }
};
module.exports = { genererQuiz };
