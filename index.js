
startGame()
let currentWord = ""

// pick new word
fetch("./allwordles.json")
    .then(res => res.json())
    .then(data => {
        const randomNum = Math.floor(Math.random() * data.length)
        currentWord = data[randomNum]
        console.log(currentWord)
    })

let allowedWords = []

fetch("./allowedwords.json")
    .then(res => res.json())
    .then(data => {
        allowedWords = data
    })


function startGame() {
    document.addEventListener("keydown", onType)
    document.addEventListener("click", onClick)
}

const alertContainer = document.querySelector(".alert-container")

function endGame() {
    document.removeEventListener("keydown", onType)
    document.removeEventListener("click", onClick)

}

const tile = document.querySelector(".cell")
let row = document.querySelector(".row")

function onClick(e) {
    enterGuess(e.target.dataset.key)
}

function onType(e) {
    enterGuess(e.key)
}

function enterGuess(pressed) {

    // remove shake animation if exists 
    removeAnimation(row, "shakeX")

    // if letter, then display letter on row
    if (isLetter(pressed)) {
        const nextTile = row.querySelector(":not([data-letter])")
        nextTile.dataset.letter = pressed
        nextTile.dataset.status = 'active'
        nextTile.innerText = pressed
        addAnimation(nextTile, "pulse")
    }

    // if backspace, then delete letter from row
    if (pressed === "Backspace") {
        const currentTiles = row.querySelectorAll("[data-status='active']")
        const lastTile = currentTiles[currentTiles.length - 1]
        lastTile.removeAttribute("data-letter")
        lastTile.removeAttribute("data-status")
        lastTile.innerText = ''
        removeAnimation(lastTile, "pulse")

    }

    // if enter, compare user letters to chosen word
    if (pressed === "Enter") {
        let currentGuess = ""

        const guessedLetters = row.querySelectorAll("[data-status='active']")

        guessedLetters.forEach(letter => currentGuess = currentGuess.concat(letter.dataset.letter))

        // check if guess is a viable word
        if (isAllowed(currentGuess)) {

            row.dataset.status = 'guessed'
            row = document.querySelector(".row:not([data-status])")
            checkLetters(guessedLetters)

            // if guess is not complete
        } else if (currentGuess.length !== 5) {
            showAlert("Not enough letters.")
            addAnimation(row, "shakeX")


            // if guess is not a viable word
        } else {
            addAnimation(row, "shakeX")
            showAlert("Word is not allowed.")
        }

    }

    // remove animation
    guessedLetters.forEach(letter => {
        addAnimation(letter, "pulse")
    })

}

const alert = document.querySelector('.alert')

function showAlert(msg) {
    alert.classList.remove("hide")
    alert.innerText = msg
    setTimeout(() => {
        alert.classList.add("hide")
    }, 1000)
}


let keyboard = document.querySelector('.keyboard')

function checkLetters(guessedLetters) {
    for (let i = 0; i < 5; i++) {
        const guessedLetter = guessedLetters[i].dataset.letter

        const guessedKey = keyboard.querySelector(`[data-key="${guessedLetter}"]`)


        // if letter is in correct space
        if (currentWord[i] == guessedLetter) {
            guessedLetters[i].dataset.status = 'correct'
            guessedKey.dataset.status = 'correct'

            // if letter is in word but not in correct space
        } else if (currentWord.includes(guessedLetter)) {
            guessedLetters[i].dataset.status = 'present'
            guessedKey.dataset.status = 'present'

            // if letter is not in word
        } else if (!currentWord.includes(guessedLetter)) {
            guessedLetters[i].dataset.status = 'missed'
            guessedKey.dataset.status = 'missed'
        }
    }

    // check if game was won
    winGame()
}

function isAllowed(word) {
    return allowedWords.includes(word)
}

function addAnimation(src, name) {
    src.classList.add("animate__animated", `animate__${name}`)
}

function removeAnimation(src, name) {
    src.classList.remove("animate__animated", `animate__${name}`)
}

// function to check if a string is a letter
function isLetter(str) {
    return /^[A-Z]$/i.test(str)
}

function winGame() {
    const guessedRows = document.querySelectorAll("[data-status='guessed']")
    const lastRow = guessedRows[guessedRows.length - 1]
    const correctGuess = lastRow.querySelectorAll("[data-status='correct']")

    console.log(guessedRows)


    const newAlert = document.createElement("div")
    newAlert.classList.add("alert")

    if (correctGuess.length === 5) {
        alertContainer.append(newAlert)
        newAlert.innerText = "You win! Refresh to play again."
        endGame()
    } else if (guessedRows.length === 6) {
        alertContainer.append(newAlert)
        newAlert.innerText = `Game over! The word was ${currentWord}. Refresh to play again!`
        endGame()
    }


}
