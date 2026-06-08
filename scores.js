// scores.js - Google Sheets Mobile-Carrier Approved Sync

const FORM_ID = "1FAIpQLSfkFNo7jHj9NmLJFxQqLFBOVHcWf6cjzpx66QThhGB-ZQyifA"; 
const ENTRY_NAME = "entry.699016978"; 
const ENTRY_SCORE = "entry.461324448"; 

// Your live published Google Sheet CSV link
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_UlL2RTVft7akWtoQeaXkTXyPKlcaryoHOqHp5CuOCydHzFH-aN-FV9MoJMM4PG5ZBFtSVw437p98/pub?output=csv";

function getScores() {
    let scores = localStorage.getItem("teamScores");
    return scores ? JSON.parse(scores) : [];
}

// Fetches all team submissions directly from the live Google Sheet CSV
async function fetchScoresFromServer() {
    try {
        let response = await fetch(SHEET_CSV_URL + (SHEET_CSV_URL.includes("?") ? "&" : "?") + "cachebust=" + new Date().getTime());
        if (response.ok) {
            let csvText = await response.text();
            let lines = csvText.split("\n");
            let scoresMap = {};

            // Parse lines (Skip row 0 because it contains the spreadsheet headers)
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                let columns = lines[i].split(",");
                if (columns.length >= 3) {
                    let teamName = columns[1].replace(/["']/g, "").trim();
                    let scoreVal = parseInt(columns[2].replace(/["']/g, "").trim()) || 0;
                    
                    if (teamName) {
                        scoresMap[teamName.toLowerCase()] = {
                            teamName: teamName,
                            score: Math.max(scoresMap[teamName.toLowerCase()]?.score || 0, scoreVal)
                        };
                    }
                }
            }
            
            let sortedScores = Object.values(scoresMap);
            sortedScores.sort((a, b) => b.score - a.score);
            return sortedScores;
        }
    } catch (e) {
        console.error("Google Sheets read error:", e);
    }
    return getScores();
}

// Secret background submit directly to Google Forms database without closing the game
async function saveScore(teamName, score) {
    let localScores = getScores();
    localScores.push({ teamName, score });
    localStorage.setItem("teamScores", JSON.stringify(localScores));

    let submitUrl = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;
    let formData = new URLSearchParams();
    formData.append(ENTRY_NAME, teamName);
    formData.append(ENTRY_SCORE, score);

    try {
        await fetch(submitUrl, {
            method: "POST",
            mode: "no-cors",
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log("Score safely archived in Google Cloud database.");
    } catch (e) {
        console.error("Google Form background dispatch dropped:", e);
    }
}

function clearScores() {
    localStorage.removeItem("teamScores");
    alert("To reset the leaderboard, simply clear the rows inside your linked Google Sheet browser window directly!");
}
