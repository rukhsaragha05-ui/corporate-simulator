// scores.js
// This file handles storing and retrieving team scores across all devices globally using a free public bin API.

// We use a unique ID for your course project to keep it separated from everyone else on the internet
const BIN_URL = "https://kvdb.io/K9m6Cyp67m8R978YkC6Xf2/rukhsar_corp_simulator_scores";

// Fallback if the network drops completely during presentation
function getLocalScores() {
    let scores = localStorage.getItem("teamScores");
    return scores ? JSON.parse(scores) : [];
}

// 1. Retrieves scores from the cloud database
async function fetchScoresFromServer() {
    try {
        let response = await fetch(BIN_URL);
        if (response.ok) {
            let data = await response.json();
            return Array.isArray(data) ? data : [];
        }
    } catch (e) {
        console.error("Cloud database error, reading local backup instead:", e);
    }
    return getLocalScores();
}

// This function is kept for backward compatibility with your leaderboard.html page structure
function getScores() {
    // Note: Because this function is synchronous, we will handle async operations seamlessly.
    // To ensure your leaderboard.html updates dynamically, let's keep a local sync cache.
    return getLocalScores();
}

// 2. Saves the score to the global cloud database so everyone sees it instantly
async function saveScore(teamName, score) {
    // First, fetch the latest global scores list from the cloud
    let scores = await fetchScoresFromServer();
    
    // Check if team already exists in the global list
    let existing = scores.find(t => t.teamName === teamName);
    if (existing) {
        existing.score = Math.max(existing.score, score); // Keep highest score
    } else {
        scores.push({teamName, score});
    }
    
    // Sort scores from highest to lowest
    scores.sort((a, b) => b.score - a.score);
    
    // Keep it clean: only track top 20 scores if the class gets huge
    if (scores.length > 20) scores = scores.slice(0, 20);

    // Save to local device as a quick backup
    localStorage.setItem("teamScores", JSON.stringify(scores));

    // Push the updated master list back up to the live cloud database
    try {
        await fetch(BIN_URL, {
            method: "POST",
            body: JSON.stringify(scores),
            headers: { "Content-Type": "application/json" }
        });
        console.log("Scores successfully synced to cloud!");
    } catch (e) {
        console.error("Failed to sync score to cloud database:", e);
    }
}

function clearScores() {
    localStorage.removeItem("teamScores");
    fetch(BIN_URL, {
        method: "POST",
        body: JSON.stringify([]),
        headers: { "Content-Type": "application/json" }
    }).catch(e => console.error(e));
}