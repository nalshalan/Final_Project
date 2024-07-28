// Import express
import express from "express";
import scoreController from "../controllers/score.controller.js";

// Create an express router (not an entire server again)
const router = express.Router();

// ROUTING
// GET (Specific Score)
router.get("/scores/:scoreNum", async (req, res) => {
    try {
        const score = await scoreController.getScore(req.params.scoreNum);
        console.log(score);
        res.json(score);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// GET (All Scores)
router.get('/scores', async (req, res) => {
    try {
        const scores = await scoreController.getScores();
        res.json(scores);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST
router.post("/scores", async (req, res) => {
    try {
        const { initials, score_num } = req.body;
        const result = await scoreController.addScore(initials, score_num);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// PUT
router.put("/scores/:scoreNum", async (req, res) => {
    try {
        const { initials, score_num } = req.body;
        const result = await scoreController.updateScore(req.params.scoreNum, initials, score_num);
        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// DELETE
router.delete("/scores/:scoreNum", async (req, res) => {
    try {
        const result = await scoreController.deleteScore(req.params.scoreNum);
        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Export this router, so that it can be used in other files
// Export default router
export default router;