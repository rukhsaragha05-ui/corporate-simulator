// scores.js - Final Unblocked Cloud Sync

// A completely open, public text-bin that allows global editing from any network
const CLOUD_URL = "https://api.rest7.com/v1/text_paste.php?action=get&id=rukhsar_corp_sim_scores_2026";
const SAVE_URL = "https://api.rest7.com/v1/text_paste.php?action=set&id=rukhsar_corp_sim_scores_2026";

function getLocalScores() {
    let scores = localStorage.getItem("teamScores");
    return scores ? JSON.parse(scores) : [];
}

// 1. Fetches global database rankings
async function fetchScoresFromServer() {
    try {
        let response = await fetch(CLOUD_URL);
        if (response.ok) {
            let text = await response.text();
            // If the database is brand new and empty, return empty array
            if (!text || text.trim() === "" || text.includes("error")) return [];
            let data = JSON.parse(text);
            return Array.isArray(data) ? data : [];
        }
    } catch (e) {
        console.error("Cloud database read error:", e);
    }
    return getLocalScores();
}

// Keep synchronous version safe for any background calls
function getScores() {
    return getLocalScores();
}

// 2. Saves score to the global cloud server instantly
async function saveScore(teamName, score) {
    let scores = await fetchScoresFromServer();
    
    let existing = scores.find(t => t.teamName.toLowerCase() === teamName.toLowerCase());
    if (existing) {
        existing.score = Math.max(existing.score, score);
    } else {
        scores.push({ teamName, score });
    }
    
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 15) scores = scores.slice(0, 15);

    // Save locally as backup
    localStorage.setItem("teamScores", JSON.stringify(scores));

    // Force push to public cloud server using URLSearchParams (Form Data)
    try {
        let formData = new URLSearchParams();
        formData.append("text", JSON.stringify(scores));

        await fetch(SAVE_URL, {
            method: "POST",
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log("Global cloud leaderboard synced successfully!");
    } catch (e) {
        console.error("Cloud database write error:", e);
    }
}

function clearScores() {
    localStorage.removeItem("teamScores");
    let formData = new URLSearchParams();
    formData.append("text", JSON.stringify([]));
    fetch(SAVE_URL, { method: "POST", body: formData }).catch(e => console.error(e));
}
