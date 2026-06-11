const newGameBtn = document.getElementById("newGameBtn");
const homeScreen = document.getElementById("homescreen");
const gameSetup = document.getElementById("gameSetup");

const menu = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");
const startGameBtn = document.getElementById("startGameBtn");
const home = document.getElementById("home")
const quizScreen = document.getElementById("quizScreen");
const scoreboard = document.getElementById("scoreboard");



newGameBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    gameSetup.style.display = "block";
});
home.addEventListener("click", () => {
    homeScreen.style.display = "block";
    gameSetup.style.display = "none";
    quizScreen.style.display = "none";
    scoreboard.style.display = "none";

});


menu.addEventListener("click", () => {
    sidebar.classList.toggle("hide");
});
const playerCountInput = document.getElementById("players");
const playerInputs = document.getElementById("playerInputs");

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

let players = [];

let currentQuestion = 0;

let currentPlayerIndex = 0;

let startTime;

async function fetchQuestions() {
    const count=document.getElementById('questionCount').value

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

    names.forEach(input => {

        players.push({
            name: input.value,
            totalTime: 0,
            score:0
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

       btn.onclick=()=>answerClicked(option);

        optionsContainer.appendChild(btn);

    });



    startTime = Date.now();
}

function answerClicked(selectedOption) {

    const correct = questions[currentQuestion].correct_answer;
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

}