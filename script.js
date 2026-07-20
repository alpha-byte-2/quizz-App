const newGameBtn = document.getElementById("newGameBtn");
const homeScreen = document.getElementById("homescreen");
const gameSetup = document.getElementById("gameSetup");

const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const startGameBtn = document.getElementById("startGameBtn");
const home = document.getElementById("home")
const quizScreen = document.getElementById("quizScreen");
const scoreboard = document.getElementById("scoreboard");
const history = document.getElementById("history");

const feedbackBtn = document.getElementById("feedbacktn");
const feedbackModal = document.getElementById("feedbackModal");
const closeFeedback = document.getElementById("closeFeedback");
const historyContainer = document.getElementById("history-container");

// new game area
newGameBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    gameSetup.style.display = "block";
});
// back to home
home.addEventListener("click", () => {
    homeScreen.style.display = "block";
    gameSetup.style.display = "none";
    quizScreen.style.display = "none";
    scoreboard.style.display = "none";
    feedbackModal.style.display = "none";
    historyContainer.style.display = "none";
});

// three dot toggling
menu.addEventListener("click", () => {
    sidebar.classList.toggle("hide");
});
const playerCountInput = document.getElementById("players");
const playerInputs = document.getElementById("playerInputs");
// no of players added with details
playerCountInput.addEventListener("change", () => {

    playerInputs.innerHTML = "";

    let n = Number(playerCountInput.value);

    for (let i = 1; i <= n; i++) {

        const input = document.createElement("input");

        input.placeholder = `Player ${i} Name`;

        input.classList.add("playerName");

        playerInputs.appendChild(input);

        playerInputs.appendChild(document.createElement("br"));
    }

});


let questions = [];
let currentSessionDetails = [];

let players = [];

let currentQuestion = 0;

let currentPlayerIndex = 0;

let startTime;
// fetch question from api
async function fetchQuestions() {
    const count = document.getElementById('questionCount').value

    const response = await fetch(
        `https://opentdb.com/api.php?amount=${count}&category=18&type=multiple`
    );

    const data = await response.json();

    questions = data.results;
}

startGameBtn.addEventListener("click", async () => {


    let names =
        document.querySelectorAll(".playerName");

    players = [];
    currentSessionDetails = [];

    names.forEach(input => {

        players.push({
            name: input.value,
            totalTime: 0,
            score: 0
        });

    });

    await fetchQuestions();

    gameSetup.style.display = "none";
    quizScreen.style.display = "block";

    currentQuestion = 0;
    currentPlayerIndex = 0;

    showQuestion();
});

function showQuestion() {


    if (currentQuestion === questions.length) {

        showScoreboard();
        return;
    }

    const q = questions[currentQuestion];

    document.getElementById("questionNumber").textContent =
        currentQuestion + 1;

    document.getElementById("questionText").innerHTML =
        q.question;

    document.getElementById("currentPlayer").textContent =
        players[currentPlayerIndex].name;




    let options = [
        ...q.incorrect_answers,
        q.correct_answer
    ];

    options.sort(() => Math.random() - 0.5);

    const optionsContainer =
        document.getElementById("optionsContainer");

    optionsContainer.innerHTML = "";

    const labels = ["A", "B", "C", "D"];

    options.forEach((option, index) => {

        const btn = document.createElement("button");

        btn.innerHTML = `${labels[index]}. ${option}`;

        btn.onclick = () => answerClicked(option);

        optionsContainer.appendChild(btn);

    });



    startTime = Date.now();
}

function answerClicked(selectedOption) {
    const q = questions[currentQuestion]
    const correct = q.correct_answer;

    currentSessionDetails.push({
        question: q.question,
        selectedAnswer: selectedOption,
        correctAnswer: correct,
        player: players[currentPlayerIndex].name
    });

    if (selectedOption === correct) {
        players[currentPlayerIndex].score += 10;
    } else {
        players[currentPlayerIndex].score -= 2;
    }

    const endTime = Date.now();
    const seconds = (endTime - startTime) / 1000;
    players[currentPlayerIndex].totalTime += seconds;

    currentPlayerIndex++;
    if (currentPlayerIndex === players.length) {
        currentPlayerIndex = 0;
        currentQuestion++;
    }
    showQuestion();
}

function showScoreboard() {
    quizScreen.style.display = "none";
    scoreboard.style.display = "block";

    players.sort((a, b) => b.score - a.score);

    const tbody = document.querySelector("#scoreTable tbody");
    tbody.innerHTML = "";

    const rankClass = ["rank-1", "rank-2", "rank-3"];

    players.forEach((player, index) => {
        const rc = index < 3 ? rankClass[index] : "rank-other";
        const scoreClass = player.score >= 0 ? "score-pos" : "score-neg";

        tbody.innerHTML += `
            <tr>
                <td><span class="rank-badge ${rc}">${index + 1}</span></td>
                <td>${player.name}</td>
                <td><span class="${scoreClass}">${player.score} pts</span></td>
                <td>${player.totalTime.toFixed(2)}s</td>
            </tr>
        `;
    });

    saveDetailQuizResult(players[0].score, questions.length, currentSessionDetails);

}




feedbackBtn.addEventListener("click", () => {
    feedbackModal.style.display = "flex";
});


closeFeedback.addEventListener("click", () => {
    feedbackModal.style.display = "none";
});

function saveDetailQuizResult(score, total, questionsArray) {
    const existingHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
    const gameRecord = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        score: score,
        total: total,

        details: questionsArray
    };

    existingHistory.push(gameRecord);
    localStorage.setItem('quizHistory', JSON.stringify(existingHistory));
}

function displayClickableHistory() {
    const historyList = document.getElementById('history-list');
    const quizHistoryData = JSON.parse(localStorage.getItem('quizHistory')) || [];

    if (quizHistoryData.length === 0) {
        historyList.innerHTML = "<div class='empty-state'>No games played yet. Time to test your knowledge!</div>";
        return;
    }

    historyList.innerHTML = "";
    quizHistoryData.reverse();

    quizHistoryData.forEach(game => {
        const gameBlock = document.createElement('div');
        gameBlock.className = "history-card";


        gameBlock.innerHTML = `
            <div class="card-info">
                <span class="card-title">Quiz Session</span>
                <span class="card-date">${game.date}</span>
            </div>
            <div class="card-score">
                <span class="score-badge">${game.score} <small>/ ${game.total}</small></span>
            </div>
        `;

        gameBlock.addEventListener('click', () => {

            document.querySelectorAll('.history-card').forEach(c => c.classList.remove('active-card'));
            gameBlock.classList.add('active-card');
            openScoreCard(game.id);
        });

        historyList.appendChild(gameBlock);
    });
}

function openScoreCard(gameId) {
    const quizHistoryData = JSON.parse(localStorage.getItem('quizHistory')) || [];
    const game = quizHistoryData.find(g => g.id === gameId);

    if (!game) return;


    document.getElementById('scorecard-title').innerHTML = `Game Recap <span class="recap-date">${game.date}</span>`;

    const detailsContainer = document.getElementById('scorecard-details');
    detailsContainer.innerHTML = "";

    game.details.forEach((item, index) => {
        const isCorrect = item.selectedAnswer == item.correctAnswer;


        const statusClass = isCorrect ? "answer-correct" : "answer-wrong";
        const icon = isCorrect ? "✓" : "✗";

        detailsContainer.innerHTML += `
          <div class="detail-card ${statusClass}">
            <div class="question-text"><strong>Q${index + 1}:</strong> ${item.question}</div>
            <div class="answer-row">
                <span class="user-answer"><span class="icon">${icon}</span> You answered: <strong>${item.selectedAnswer}</strong></span>
                ${!isCorrect ? `<span class="correct-answer">Correct answer: <strong>${item.correctAnswer}</strong></span>` : ''}
            </div>
          </div>
        `;
    });


    const modal = document.getElementById('scorecard-modal');
    modal.style.display = 'block';
    modal.classList.add('slide-in');
}

history.addEventListener("click", () => {

    homeScreen.style.display = "none";
    gameSetup.style.display = "none";
    quizScreen.style.display = "none";
    scoreboard.style.display = "none";
    feedbackModal.style.display = "none";


    historyContainer.style.display = "flex";


    displayClickableHistory();
});

document.getElementById("sidebarHistory").addEventListener("click", () => {
    history.click();
    sidebar.classList.add("hide");
});


document.getElementById('close-scorecard').addEventListener('click', () => {

    document.getElementById('scorecard-modal').style.display = 'none';


    document.querySelectorAll('.history-card').forEach(card => {
        card.classList.remove('active-card');
    });
});