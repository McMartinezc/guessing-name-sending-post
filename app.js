//Generate a random number between 1 and 500
let randomNumber = parseInt(Math.random() * 100 + 1);
const submit = document.querySelector("#subt");
const userInput = document.querySelector("#guessField");
const guessSlot = document.querySelector(".guesses");
const remaining = document.querySelector(".lastResult");
const startOver = document.querySelector(".resultParas");
const lowOrHi = document.querySelector(".lowOrHi");
const p = document.createElement("p");
let previousGuesses = [];
let numGuesses = 1;
let playGame = true;
let remainingSeconds = 3600;

document.querySelector("#remaining-time").innerHTML = remainingSeconds;

// Cada segundo (1000ms) quiero que ejecutes la función updateRemainingTime
let timer = setInterval(updateRemainingTime, 1000);

function updateRemainingTime() {
  // 1. Decremntar en 1 la variable de estado remainingSeconds
  remainingSeconds = remainingSeconds - 1;

  // 2. Actualizar el innerHTML de #remaining-time con el valor de la variable remainingSeconds
  document.querySelector("#remaining-time").innerHTML = remainingSeconds;

  // 3. Cuando llegue a 0 ha perdido
  //   3.1 Bloquear el input para que no pueda escribir más. Pensad que está funcionalidad ya se da cuando te equivocas muchas veces, buscad en el código como lo hace el programador
  if (remainingSeconds == 0) {
    endGame();
    displayMessage(`Game Over! Your time is over! Number was ${randomNumber}`);
    submit.disabled = true;
    clearInterval(timer);
    userInput.setAttribute("disabled", "");
    submit.disabled = true;
  }
}

if (playGame) {
  subt.addEventListener("click", function (e) {
    e.preventDefault();
    //Grab guess from user
    const guess = parseInt(userInput.value);
    validateGuess(guess);
  });
}

function validateGuess(guess) {
  if (isNaN(guess)) {
    alert("Please enter a valid number");
  } else if (guess < 1) {
    alert("Please enter a number greater than 1!");
  } else if (guess > 100) {
    alert("Please enter a number less than 500!");
  } else {
    //Keep record of number of attempted guesses
    previousGuesses.push(guess);
    //Check to see if game is over
    if (numGuesses === 11) {
      displayGuesses(guess);
      displayMessage(`Game Over! Number was ${randomNumber}`);
      endGame();
    } else {
      //Display previous guessed numbers
      displayGuesses(guess);
      //Check guess and display if wrong
      checkGuess(guess);
    }
  }
}

// ¿En que punto del código hay que invocar a esta función?
async function sendScoreToServer(elapsedTime, attempts) {
  // TODO: Establecer adecuadamente el valor de las propiedades elapsed_time y attempts
  const score = {
    machine: "MC",
    elapsed_time: elapsedTime,
    attempts: attempts,
  };
  // TODO: CODE ME!! Haz el POST con la función fetch.
  console.log("Enviando los datos al servidor de King.com"); //POST

  // Enviamos los datos al endpoint
  let response = await fetch('https://guessing-name-score-api.onrender.com/add-score', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify(score)
  });

  let result = await response.json();
  console.log(result.message);
}

function checkGuess(guess) {
  //Display clue if guess is too high or too low
  if (guess === randomNumber) {
    displayMessage(
      `You guessed correctly! You can check all the scores at <a href="https://03i74i.csb.app/">https://03i74i.csb.app/</a> (provided that the developer did the work!!)`
    );
    //Capturamos los segundos que hay en ese
    const elapsedTime = +document.querySelector("#remaining-time").textContent;

    sendScoreToServer(elapsedTime, numGuesses);
    endGame();
  } else if (guess < randomNumber) {
    displayMessage(`Too low! Try again!`);
  } else if (guess > randomNumber) {
    displayMessage(`Too High! Try again!`);
  }
}

function displayGuesses(guess) {
  userInput.value = "";
  guessSlot.innerHTML += `${guess}  `;
  numGuesses++;
  remaining.innerHTML = `${11 - numGuesses}  `;
}

function displayMessage(message) {
  lowOrHi.innerHTML = `<h1>${message}</h1>`;
}

function endGame() {
  //Clear user input
  userInput.value = "";
  //Disable user input button
  userInput.setAttribute("disabled", "");
  //Display Start new Game Button
  p.classList.add("button");
  p.innerHTML = `<h1 id="newGame">Start New Game</h1>`;
  startOver.appendChild(p);
  playGame = false;
  newGame();
}

function newGame() {
  const newGameButton = document.querySelector("#newGame");
  newGameButton.addEventListener("click", function () {
    //Pick a new random number
    randomNumber = parseInt(Math.random() * 100 + 1);
    previousGuesses = [];
    numGuesses = 1;
    guessSlot.innerHTML = "";
    lowOrHi.innerHTML = "";
    remaining.innerHTML = `${11 - numGuesses}  `;
    userInput.removeAttribute("disabled");
    startOver.removeChild(p);
    playGame = true;

    // actualizar la variable remainingSeconds a 60
    // volver a lanzar el setInterval
    remainingSeconds = 60;
    timer = setInterval(updateRemainingTime, 1000);
  });
}


//Crear tabla resultados 
async function createTable(){
  const scoreTable = document.querySelector("#scoreTable tbody");

  const response = await fetch("https://guessing-name-score-api.onrender.com/get-scores");
  const result = await response.json();
  result.forEach(element => {
    const row = scoreTable.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    cell1.textContent = element.machine;
    cell2.textContent = element.elapsed_time;
    cell3.textContent = element.attempts;
  });
}
//Allow to restart game with restart button
//Change DIV to a form so it can accept the enter key
createTable();
//NOTES:
//NaN != NaN
