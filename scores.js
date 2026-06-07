// scores.js
// This file handles storing and retrieving team scores in localStorage

function getScores() {
    let scores = localStorage.getItem("teamScores");
    return scores ? JSON.parse(scores) : [];
}

function saveScore(teamName, score) {
    let scores = getScores();
    // Check if team already exists
    let existing = scores.find(t => t.teamName === teamName);
    if (existing) {
        existing.score = score; // Update score
    } else {
        scores.push({teamName, score});
    }
    // Sort descending
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem("teamScores", JSON.stringify(scores));
}

function clearScores() {
    localStorage.removeItem("teamScores");
}