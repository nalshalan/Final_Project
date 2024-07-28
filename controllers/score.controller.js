// Import query to communiate with the database
import query from "../config/connection.js";

// async/await syntax is used to handle the promise
async function getScore(scoreNum) {
    // The question marks are placeholders where the query will insert each value within the corresponding array
    // This is known as the "parameterized query"
    return await query("SELECT * FROM scores WHERE score_num = ?", [scoreNum]);
}

async function getScores() {
    return await query("SELECT * FROM scores ORDER BY score_num DESC");
}

async function addScore(initials, score) {
    return await query("INSERT INTO scores (initials, score_num) VALUES (?, ?)", [initials, score]);
}

async function updateScore(scoreNum, initials, score) {
    return await query("UPDATE scores SET initials = ?, score_num = ? WHERE score_num = ?", [initials, score, scoreNum]);
}

async function deleteScore(scoreNum) {
    return await query("DELETE FROM scores WHERE score_num = ?", [scoreNum]);
}

// List all of the different controller functions
export default { getScore, getScores, addScore, updateScore, deleteScore };