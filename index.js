const restart = document.getElementById("replay")
const restartIcon = document.getElementById("replayIcon")
const url = "./data.json"
const body = document.body
const keyboard = document.getElementById("keyboard")
const key = document.querySelectorAll(".key")
const game = document.getElementById("guess")
const hangman = document.getElementById("hangman").children;
const looseTile = document.getElementById("loose")
const winTitle = document.getElementById("win")
const themeSelector = document.getElementById("themeSelector")
const moon = document.getElementById("moon")
const sun = document.getElementById("sun")
const definition = document.getElementById("definition")
const switcher = document.getElementById("switchGameMode")
const langSelector = document.getElementById("langSelect")
const settings = document.getElementById("settings")
const settingsIco = document.getElementById("settingsIco")
const dbInfo = document.getElementById("dbInfo")
const updateDb = document.getElementById("updateDb")
const currentStreak = document.getElementById("currentStreak")
const maxStreak = document.getElementById("maxStreak")
let data = localStorage.getItem("data")
let hasWin = false
let nbKeyUsed = 0
let lang = JSON.parse(localStorage.getItem("lang"))
let hasLost = false
let currentStreakScore = 0
let maxStreakScore = localStorage.getItem("maxStreak")
let debugMode = false
if (maxStreakScore == undefined) {
    maxStreakScore = 0
    localStorage.setItem("maxStreak", maxStreakScore)
}
maxStreak.innerHTML = "Best Streak: " + maxStreakScore
currentStreak.innerHTML = "Current streak: " + currentStreakScore

if (lang == undefined) {
    lang = navigator.language
    if (lang.startsWith("fr")) {
        lang = "fr"
    }
    else if (lang.startsWith("en")) {
        lang = "en"
    }
    else if (lang.startsWith("es")) {
        lang = "es"
    }
    else {
        lang = "en"
    }
    localStorage.setItem("lang", JSON.stringify(lang))
}
langSelector.value = lang
definition.setAttribute("lang", lang)


let keyboardLang = localStorage.getItem("keyboardLang")

if (keyboardLang == undefined || null) {
    keyboardLang = "qwerty"
    localStorage.setItem("keyboardLang", keyboardLang)
}
body.setAttribute("data-keyboard", keyboardLang)
const keyboardSelect = document.getElementById("keyboardSelect")
keyboardSelect.value = keyboardLang


let word
let listenerSet = false
let life = 0
let countThemeChanged = 0

function changeTheme() {
    if (darkMode == true) {
        body.setAttribute("data-theme", "light")
    }
    else {
        body.setAttribute("data-theme", "dark")
    }
}

let darkMode = JSON.parse(localStorage.getItem("darkMode"))
if (darkMode == undefined) {
    darkMode = true
    localStorage.setItem("darkMode", darkMode)
}
changeTheme()

let actualTimeStamp = Date.now()
const lastUpdate = JSON.parse(localStorage.getItem("lastUpdate"))
const timeElapsed = (actualTimeStamp - lastUpdate) / 1000 / 60 / 60
const updateFreq = 24
console.log("Update", Math.floor(timeElapsed * 100) / 100, "hours ago");
let UpdateTime = "Last update: " + Math.floor(timeElapsed * 10) / 10 + "h"
dbInfo.innerHTML = UpdateTime
if (data == undefined) {
    getData(url, 0)
}

else if (actualTimeStamp == undefined) {
    getData(url, 0)
}

else if (Math.floor(timeElapsed) >= (updateFreq)) {
    getData(url, 0)
}

else if (Math.floor(timeElapsed) <= (updateFreq)) {
    data = JSON.parse(data)
    console.log("Already saved");
    init(false)
}

//get a file
//inputs: url and the mode (look the function to learn more about the mode)
async function getData(urlSet, mode) {
    localStorage.setItem("lastUpdate", JSON.stringify(actualTimeStamp))
    console.log("Has just been saved");
    console.log(urlSet);
    const result = await fetch(urlSet)
    data = await result.json();
    console.log(data);

    if (mode == 0) { //mode 0: save the response in localStorage and init game
        saveToLs(data) //ls = localstorage
        init(false)
    }

    if (mode == 1) { //mode 1 : save response in localStorage 
        saveToLs(data) //ls = localstorage
    }
}

function saveToLs(data) {
    localStorage.setItem("data", JSON.stringify(data))
}

function chooseWord() { //return a random word from the list
    let dbLength = 10 ** (data[lang].length.toString().length)
    var random
    while (random <= data[lang].length == false) {
        random = Math.round(Math.random() * dbLength)

    }
    // console.log(random);
    const word = data[lang][random]

    return word
}

function createDefinition(def) {
    if (def.title == undefined) {
        const definitionsContainer = document.createElement("div")
        for (let i = 0; i < def[0].meanings.length; i++) {
            const meaningBlock = document.createElement("div")
            meaningBlock.setAttribute("class", "meanings")
            const meaningNumber = document.createElement("p")
            meaningNumber.setAttribute("class", "meaningNumber")
            const meaningNumberText = document.createTextNode(" Meaning " + (i + 1) + ": " + def[0].meanings[0].partOfSpeech)
            meaningNumber.appendChild(meaningNumberText)
            meaningBlock.appendChild(meaningNumber)
            for (let j = 0; j < def[0].meanings[i].definitions.length; j++) {
                const meaningPara = document.createElement("p")
                if (j % 2 == 0) {
                    meaningPara.setAttribute("class", "even defPara")
                }
                else if (j % 2 == 1) {
                    meaningPara.setAttribute("class", "odd defPara")
                }
                const text = j + 1 + ": " + def[0].meanings[i].definitions[j].definition
                const meaningText = document.createTextNode(text)
                meaningPara.appendChild(meaningText)
                meaningBlock.appendChild(meaningPara)
                definitionsContainer.appendChild(meaningBlock)
                definition.setAttribute("data-found", "true")
            }
        }
        definitionsContainer.setAttribute("id", "definitionsContainer")
        const parentDiv = document.getElementById("meanings")
        parentDiv.appendChild(definitionsContainer)
    }
}

function fetchDefinition(word) {
    console.log(lang);
    if (lang == "en") {
        console.log(word);
        const urlDef = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word
        console.log(urlDef);
        fetch(urlDef)
            .then((response) => response.json())
            .then((json) => createDefinition(json))

    }
}

function write(wordToWrite) {
    // console.log(wordToWrite.length);
    for (let i = 0; i < wordToWrite.length; i++) {
        var newP = document.createElement("p")
        newP.setAttribute("class", "letter")
        var newText = document.createTextNode(wordToWrite[i].toUpperCase())
        newP.appendChild(newText)
        game.appendChild(newP)
    }
}

function restartAll(shifted) {
    if (shifted == true) {
        body.setAttribute("data-gameMode", "v2")
    }
    else {
        shifted = false
    }
    const gameMode = body.getAttribute("data-gameMode")
    const word = JSON.parse(localStorage.getItem("word"))

    if (gameMode == "classic") {
        if (hasWin == true || hasLost == true) {
            restartGame()
            reset(word)
            init(false)
        }
        else if (nbKeyUsed >= 1 && confirm("Dou you realy want to restart. That will reset your streak of " + currentStreakScore)) {
            currentStreakScore = 0
            currentStreak.innerHTML = "Current streak: " + currentStreakScore
            restartGame()
            reset(word)
            init(false)
        }
    }

    else if (gameMode == "v2") {
        if (hasWin == true || hasLost == true) {
            restartGame()
            reset(word)
            init(true)
        }
        else if (nbKeyUsed >= 1 && confirm("Dou you realy want to restart. That will reset your streak of " + currentStreakScore)) {
            currentStreakScore = 0
            currentStreak.innerHTML = "Current streak: " + currentStreakScore
            restartGame()
            reset(word)
            init(true)
        }
    }
}


//different style of keys
let spaceAlreadyPressed = false
function setListerners() {
    document.addEventListener("keydown", (e) => {
        if (e.code == "Space") {
            spaceAlreadyPressed = true
            if (e.shiftKey == false) {
                restartAll()
            }
            else {
                restartAll(true)
            }
        }
        else {
            try {
                keyPress(e.key, e.key.charCodeAt(0) - 97)
            }
            catch (e) {
            }
        }
    })

    body.addEventListener("click", (e) => {
        
        console.log(e.target);
        if(definition.getAttribute("data-space") == "deployed" && e.target == body){
            definition.setAttribute("data-space", "collapsed")
            body.setAttribute("data-space", "collapsed")
        }
        if(settings.getAttribute("data-space") == "deployed" && e.target == body){
            settings.setAttribute("data-space", "collapsed")
        }
        console.log("click");
    })

    key.forEach((element, index) => {
        element.addEventListener('click', () => {
            keyPress(element.id, index)
            nbKeyUsed++
        })
    })

    const link = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab"

    themeSelector.addEventListener("click", () => {
        countThemeChanged++
        if (countThemeChanged >= 15) {
            window.location.href = link
        }
        darkMode = !darkMode
        localStorage.setItem("darkMode", JSON.stringify(darkMode))
        changeTheme()
    })

    themeSelector.addEventListener("mouseleave", () => {
        countThemeChanged = 0
    })

    restart.addEventListener('click', () => {
        if (spaceAlreadyPressed == true) {
            spaceAlreadyPressed = false
        }
        else {
            restartAll()
        }
    })

    definition.addEventListener("click", () => {
        const dataSpace = definition.getAttribute("data-Space")
        if (dataSpace == "collapsed") {
            body.setAttribute("data-space", "deployed")
            definition.setAttribute("data-space", "deployed")
            definition.setAttribute("data-alreadyDeployed", "true")
        }
        else if (dataSpace == "deployed") {
            definition.setAttribute("data-space", "collapsed")
            body.setAttribute("data-space", "collapsed")
        }
    })

    switcher.addEventListener("click", () => {
        const gameMode = body.getAttribute("data-gameMode")
        const word = JSON.parse(localStorage.getItem("word"))

        if (gameMode == "v2") {
            restartGame()
            reset(word)
            body.setAttribute("data-gameMode", "classic")
            init(false)
        }
        else if (gameMode == "classic") {
            init(true)
        }
    })

    document.addEventListener("change", (e) => {
        if (e.target == langSelector) {
            const word = JSON.parse(localStorage.getItem("word"))
            const selectedLang = e.target.value
            lang = selectedLang
            localStorage.setItem("lang", JSON.stringify(lang))
            definition.setAttribute("lang", lang)
            restartGame()
            reset(word)
            init(false)
        }
        else {
            keyboardLang = document.getElementById("keyboardSelect").value
            body.setAttribute("data-keyboard", keyboardLang)
            body.setAttribute("data-keyboard", keyboardLang)
            localStorage.setItem("keyboardLang", keyboardLang)
        }
    })

    settingsIco.addEventListener("click", () => {
        const space = settings.getAttribute("data-space")
        if (space == "collapsed") {
            settings.setAttribute("data-space", "deployed")
        }
        else {
            settings.setAttribute("data-space", "collapsed")
            settings.setAttribute("data-alreadyDeployed", "true")
        }
    })


    updateDb.addEventListener("click", () => {
        getData(url, 1)
        const lastUpdate = localStorage.getItem("lastUpdate")
        actualTimeStamp = Date.now()
        const timeElapsed = (actualTimeStamp - lastUpdate) / 1000 / 60 / 60
        const UpdateTime = "Last update: " + Math.floor(timeElapsed * 10) / 10 + "h"
        dbInfo.innerHTML = UpdateTime
    })

    

    listenerSet = true
}

function removeListeners(keyName, index) {
    var usedLetters = JSON.parse(localStorage.getItem("usedLetters"))
    usedLetters[index] = keyName[index].id
    localStorage.setItem("usedLetters", JSON.stringify(usedLetters))
}

function restartGame() {
    for (const element of hangman) {
        element.style.display = "none"
    }
    life = 0
    body.setAttribute("data-end", "none")
    const definitionContainer = document.getElementById("definitionsContainer")
    if (lang == "en" && definitionContainer != null) {
        definitionContainer.remove()
    }
    definition.setAttribute("data-gameStatue", "unFinished")
    const guess = document.getElementById("guess")
    guess.setAttribute("data-justLoaded", "false")
    for (const element of key) {
        element.setAttribute("data-state", "playble")
    }

    definition.setAttribute("data-alreadyDeployed", "false")
    definition.setAttribute("data-space", "collapsed")
    hasWin = false
    hasLost = false
}

function init(isV2, initiator) {
    let word
    if (listenerSet == false) {
        setListerners()
    }
    var foundLetters = []
    if (isV2 == false) {
        word = chooseWord().split("")
        fetchDefinition(word.join(""))
    }
    else if (isV2 == true) {
        word = prompt("Choose a word (english alphabet letters only)").toLocaleLowerCase()
        let validCharFound
        if (word != null && word != "") {
            const validChars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
            for (const letter of word.split("")) {
                validCharFound = false
                for (const validLetter of validChars) {
                    if (letter == validLetter) {
                        validCharFound = true
                    }
                }
                if (validCharFound == false) {
                    break;
                }
            }
        }
        else {
            validCharFound = false
        }


        const gameMode = body.getAttribute("data-gameMode")
        if (validCharFound == false) {
            alert("Please choose a valid word")
            console.log("Please choose a valid word")
            if (gameMode == "classic") {
                body.setAttribute("data-gameMode", "classic")
            }
            else {
                body.setAttribute("data-gameMode", "v2")
            }
            return
        }

        else {
            const lastWord = JSON.parse(localStorage.getItem("word"))
            restartGame()
            reset(lastWord)
            if (gameMode == "classic") {
                body.setAttribute("data-gameMode", "v2")
            }
            else {
                if (initiator == "chooseWord") {
                    body.setAttribute("data-gameMode", "v2")
                }
                else {
                    body.setAttribute("data-gameMode", "classic")
                }
            }
            word = word.toLocaleLowerCase()
            word = word.split("")
            if (debugMode == true) {
                console.log(word);
            }
        }

    }

    localStorage.setItem("word", JSON.stringify(word))
    if (debugMode == true) {
        console.log(word);
    }
    for (let i = 0; i < word.length; i++) {
        foundLetters.push(" ")
    }
    write(foundLetters)
    localStorage.setItem("foundLetters", JSON.stringify(foundLetters))
    localStorage.setItem("numberOfFoundLetters", JSON.stringify(0))
    localStorage.setItem("usedLetters", JSON.stringify(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]))
    if (debugMode == true) {
        console.log(word.join(""))
    }


    let wordLength = game.offsetWidth - 20

    if (wordLength >= window.innerWidth) {
        game.setAttribute("style", "transform: scale(calc(" + window.innerWidth + "/" + wordLength + "));")
        body.setAttribute("data-word", "long")
    }
    else {
        game.removeAttribute("style")
        body.setAttribute("data-word", "long")
    }

}


function looseLife() {
    hangman[life].style.display = "block"
    life++

}

function keyPress(keyName, number) {
    if (life <= 9 && hasWin == false) {
        key[number].setAttribute("data-state", "used")
        var usedLetters = JSON.parse(localStorage.getItem("usedLetters"))
        var found = false
        var foundLetters = JSON.parse(localStorage.getItem("foundLetters"))
        var numberOfFoundLetters = JSON.parse(localStorage.getItem("numberOfFoundLetters"))
        const word = JSON.parse(localStorage.getItem("word"))
        if (usedLetters[number] == "") {
            for (let i = 0; i < word.length; i++) {
                const letter = word[i];
                if (keyName == letter) {
                    foundLetters[i] = keyName
                    found = true
                    numberOfFoundLetters++
                }
            }
            if (found == false) {
                looseLife()
            }

            if (numberOfFoundLetters == word.length) {
                body.setAttribute("data-end", "win")
                definition.setAttribute("data-gameStatue", "finished")
                hasWin = !hasWin
                const gameMode = body.getAttribute("data-gamemode")
                if (gameMode == "classic") {
                    currentStreakScore++
                }
                if (currentStreakScore > maxStreakScore) {
                    maxStreakScore = currentStreakScore
                    localStorage.setItem("maxStreak", maxStreakScore)
                    maxStreak.innerHTML = "Best Streak: " + maxStreakScore
                }
                currentStreak.innerHTML = "Current streak: " + currentStreakScore
            }
        }
        if (life == 10) {
            reset(word)
            write(word)
            hasLost = true
            body.setAttribute("data-end", "lost")
            definition.setAttribute("data-gameStatue", "finished")
            currentStreakScore = 0
            currentStreak.innerHTML = "Current streak: " + currentStreakScore
        }
        else {
            reset(foundLetters)
            write(foundLetters)
        }

        localStorage.setItem("foundLetters", JSON.stringify(foundLetters))
        localStorage.setItem("numberOfFoundLetters", JSON.stringify(numberOfFoundLetters))
        localStorage.setItem("usedLetters", JSON.stringify(usedLetters))
        removeListeners(key, number)
        nbKeyUsed++
    }

}

function reset(word) {
    for (let i = 0; i < word.length; i++) {
        game.removeChild(game.lastElementChild)
    }
}