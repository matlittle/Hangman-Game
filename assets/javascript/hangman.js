
var hangmanGame = {
	Settings: {
		// constant game settings
		Alphabet: [
		["A","B","C","D","E","F","G"],
		["H","I","J","K","L","M","N"],
		["O","P","Q","R","S","T","U"],
		[" ","V","W","X","Y","Z"," "]
		],
		MaxGuesses: 6,
		WordElement: document.getElementById("wordToGuess"),
		AlphabetDiv: document.getElementById("alphabet"),
		ImgElement: document.getElementById("gameImg"),
		ModalElement: document.getElementById("myModal"),
		ModalTextElement: document.getElementById("modalText"),
		LossCountElement: document.getElementById("lossCount"),
		WinCountElement: document.getElementById("winCount")
	},

	curr: {
		// object that keeps track of the game's state. 
		gameType: "",
		wins: 0,
		losses: 0,
		wordToGuess: "",
		displayWord: "",
		numGuesses: 0,
		currentGuess: "",
		prevGuesses: [],
		correctGuess: {
			char: "",
			positions: [],
			previous: []
		}
	},

	init: function() {
		// freeze Settings obj so no changes can be made
		Object.freeze(this.Settings);

		this.buildAlphaDisplay(this.Settings.Alphabet);

		this.toggleModal(true);

		document.onkeyup = function() {
			hangmanGame.toggleModal(false);
			hangmanGame.gameTypePrompt();
		}
	},

	startGame: function() {

		console.log(`wordToGuess: ${this.curr.wordToGuess}`);

		// build the initial display word
		this.curr.displayWord = this.initDisplayWord(this.curr.wordToGuess);

		// add click event listener to alphabet letter elements
		this.createClickListeners();

		document.onkeyup = function() {
			hangmanGame.letterPressed(event);
		};
	},

	gameTypePrompt: function() {
		document.onkeyup = function() {};
		this.changeModalContent("type");
		this.createTypeListeners();
		this.toggleModal(true);
	},

	setGameType: function(bool) {
		// determines whether the game is vs computer or human
		if(bool) {
			this.curr.gameType = "vsHuman"
		} else {
			this.curr.gameType = "vsComputer";
		}

		this.toggleModal(false);
		this.chooseWord();
	},

	toggleModal: function(bool) {
		var modalDisplay;

		if(bool) {
			modalDisplay = "block";
		} else {
			modalDisplay = "none";
		}

		this.Settings.ModalElement.style.display = modalDisplay;
	},

	changeModalContent: function(state) {
		var newText = "";

		if(state === "win") {
			newText = "<p>You won!!!<br>Press any key to start the next round</p>";
		} else if(state === "loss") {
			newText = "<p>You lost...<br>Press any key to start the next round</p>";
		} else if(state === "type") {
			newText = "<p>Which game type would you like to play?</p>"+
				"<button id='playerBtn'>vs Player</button>"+
				"<button id='compBtn'>vs Computer</button>";
		} else if(state === "word") {
			newText = "<p>Enter a word between 4 and 10 characters for the next game.</p>"+
				"<input id='playerWord' type='text' maxlength='10' autofocus required>"+
				"<button id='submitWord'>Submit</button>";
		} else if(state === "wait") {
			newText = "<p>Generating a random word...</p><br>"+
				"<img src='assets/images/loading.gif'>";
		}

		this.Settings.ModalTextElement.innerHTML = newText;
	},

	createTypeListeners: function() {
		var playerBtn = document.getElementById("playerBtn");
		var computerBtn = document.getElementById("compBtn");

		playerBtn.addEventListener("click", function() {
			hangmanGame.setGameType(true);
		});

		compBtn.addEventListener("click", function() {
			hangmanGame.setGameType(false);
		});
	},

	createWordListeners: function() {
		var submitWord = document.getElementById("submitWord");

		submitWord.addEventListener("click", function() {
			hangmanGame.getPlayerWord();
		});

		document.onkeyup = function(event) {
			if(event.keyCode === 13) {
				hangmanGame.getPlayerWord();
			}
		}
	},

	chooseWord: function() {
		// function to get word. Random if vs comp, input if pvp.
		if(this.curr.gameType === "vsComputer") {
			// get random word
			this.promptGeneratingWord();
		} else {
			// ask player for input word
			this.promptPlayerWord();
		}
	},

	promptPlayerWord: function() {
		this.changeModalContent("word");
		this.createWordListeners();
		this.toggleModal(true);
		document.getElementById("playerWord").focus();
	},

	getPlayerWord: function() {
		var inputWord = document.getElementById("playerWord").value;

		if(inputWord.length < 4) {
			this.toggleModal(true);
			this.promptPlayerWord();
			return;
		}

		this.curr.wordToGuess = inputWord.toUpperCase();
		this.toggleModal(false);
		this.startGame();
	},

	promptGeneratingWord: function() {
		this.changeModalContent("wait");
		this.toggleModal(true);
		this.getRandomWordArr();
	},

	getRandomWordArr: function() {
		var endURL = "https://wordsapiv1.p.mashape.com/words/";
		var randChar = String.fromCharCode(Math.floor(Math.random() * 27) + 97);
		var randLen = Math.floor(Math.random() * 6) + 4;

		// initialize new http request variable
		var xhttpReq = new XMLHttpRequest();
		// configure GET request from random word generator.
		xhttpReq.open("GET", 
			`${endURL}?letterPattern=^${randChar}.{${randLen}}$&frequencyMin=3&limit=200`, 
			true);
		// set HTTP headers for request
		xhttpReq.setRequestHeader("X-Mashape-Key",
				"q4bESNa4dTmshLAQx5GNA4i2csGGp1AhjyUjsnMucLl8HYfsRp");
		xhttpReq.setRequestHeader("Accept","application/json");
		// make web service call
		xhttpReq.send();

		// function that's run on a request state change
		xhttpReq.onreadystatechange = function() {
			if(this.readyState === 4 && this.status === 200) {
				hangmanGame.chooseRandomWord(this.response);
			}
		}
	},

	chooseRandomWord: function(str) {
		var obj = JSON.parse(str);
		var randArr = obj.results.data;

		if(!randArr){
			this.getRandomWordArr();
			return;
		}

		var randNum = Math.floor(Math.random() * randArr.length);
		var randWord = randArr[randNum];

		this.curr.wordToGuess = randWord.toUpperCase();
		this.toggleModal(false);
		this.startGame();
	},

	initDisplayWord: function(word) {
		var tempWord = "";

		for (var i = 0; i < word.length; i += 1) {
			tempWord += "_";
		}

		this.Settings.WordElement.innerHTML = "";
		// append the display word to its html element
		this.Settings.WordElement.appendChild(document.createTextNode(tempWord));

		return tempWord;
	},

	buildAlphaDisplay: function(alphaArr) {
		var table = document.createElement("table");

		// loop through each main element in alphabet array
		alphaArr.forEach( function(rowData) {
			var row = document.createElement("tr");
			// loop through each sub array of alphabet array
			rowData.forEach(function(cellData) {
				var cell = document.createElement("td");
				// assign element of sub array to individual td element
				cell.appendChild(document.createTextNode(cellData));
				// set class and id of td elements
				cell.className = "letter";
				if(cellData !== " ") {
					cell.id = `char-${cellData}`;
				};
				// append td element to the row
				row.appendChild(cell);
			});
			// append the row to the table
			table.appendChild(row);
		});

		// append fully constructed table to alphabet div
		this.Settings.AlphabetDiv.appendChild(table);
	},

	resetAlphaDisplay: function() {
		this.Settings.AlphabetDiv.innerHTML = "";

		this.buildAlphaDisplay(this.Settings.Alphabet);
	},

	createClickListeners: function() {
		var letterElements = document.getElementsByClassName("letter");
		for(var i = 0; i < letterElements.length; i += 1) {
			letterElements[i].addEventListener("click", function() {
				hangmanGame.letterClicked(event);
			});
		}
	},

	letterClicked: function(event) {
		var keyClicked = event.target.innerHTML.toUpperCase();

		if(keyClicked === " ") {
			return;
		}

		this.handleGuess(keyClicked);
	},

	letterPressed: function(event) {
		var keyPressed = event.key.toUpperCase();

		var alphaKeys = /^[a-z]/i;

		if(alphaKeys.test(keyPressed) && keyPressed.length === 1){
			if(hangmanGame.curr.prevGuesses.indexOf(keyPressed) === -1) {
				hangmanGame.handleGuess(keyPressed);
			} 
		}
	},

	handleGuess: function(char) {
		// set current guess to value of clicked letter
		this.curr.currentGuess = char;
		//remove character's click listener
		this.removeClickListener(char);
		// add to previous guesses array
		this.addPrevGuess(char);

		// if guess is correct
		if(this.checkGuess(char)) {
			this.updateCorrectGuess(char);
		} else {
			this.updateWrongGuess(char);
		}
	},

	removeClickListener: function(char) {
		// get DOM element of guessed letter
		var charElement = document.getElementById(`char-${char}`);
		// remove click listener from element
		charElement.removeEventListener("click", this.letterClicked);
	},

	addPrevGuess: function(char) {
		// add character to prev guess array
		this.curr.prevGuesses.push(char);
	},

	checkGuess: function(guess) {
		if(this.curr.wordToGuess.indexOf(guess) !== -1) {
			return true;
		} else {
			return false;
		}
	},

	updateWrongGuess: function(char){
		// incorrect guess, increment incorrect guesses by 1
		if(this.curr.numGuesses < 6){
			this.curr.numGuesses += 1;
		}
		
		this.updateDisplay(false);
	},

	updateCorrectGuess: function(char) {
		// add correct character to correct guess obj
		this.curr.correctGuess.char = char;

		// set return obj array to empty array
		this.curr.correctGuess.positions = [];
		// loop through correct word, building array of correct index locations
		for(var i = 0; i < this.curr.wordToGuess.length; i += 1){
			if(char === this.curr.wordToGuess[i]){
				// add location of correct guess to obj index array
				this.curr.correctGuess.positions.push(i);
			}
		}

		this.updateDisplay(true);
	}, 

	updateDisplayWord: function(obj) {
		//function gets passed this.curr.correctGuess obj
		var tempWord = this.curr.displayWord;
		// go through each correct position
		obj.positions.forEach(function(index) {
			// update display word with correct character
			tempWord = tempWord.substring(0, index) + obj.char + tempWord.substring(index+1);
		});

		this.curr.displayWord = tempWord;
	},

	updateDisplayImg: function() {
		gameState = this.curr.numGuesses;
		this.Settings.ImgElement.src = `assets/images/game_state_${gameState}.png`
	},

	updateCharElement: function(bool, char) {
		// get DOM element of guessed letter
		var charElement = document.getElementById(`char-${char}`);

		if(bool) {
			charElement.style.backgroundColor = "green";
		} else {
			charElement.style.backgroundColor = "red";
		}

		charElement.style.color = "white";
	},

	updateDisplay: function(bool) {
		// function to update display based on any changes
		// if bool is true - correct guess, false - wrong guess

		if(bool) {
			// update display word with correctly guessed character
			this.updateDisplayWord(this.curr.correctGuess);
			// update displayed word
			this.Settings.WordElement.innerHTML = this.curr.displayWord;
			// update alphabet
			this.updateCharElement(true, this.curr.currentGuess);
		} else {
			// update alphabet
			this.updateCharElement(false, this.curr.currentGuess);
			// update displayed image
			this.updateDisplayImg();
		}

		this.checkWinOrLoss();
	}, 

	checkWinOrLoss: function() {
		if(hangmanGame.curr.displayWord.indexOf("_") === -1) {
			document.onkeyup = function() {};
			hangmanGame.wonGame();
		}
		if(hangmanGame.curr.numGuesses === 6) {
			document.onkeyup = function() {};
			hangmanGame.lostGame();
		}
	},

	lostGame: function() {
		// display game over, ask if they want to restart
		this.curr.losses += 1;

		this.updateScore();

		this.changeModalContent("loss");
		this.toggleModal(true);

		document.onkeyup = function() {
			hangmanGame.newRound();
		}
	},

	wonGame: function() {
		// display won game, start new level
		this.curr.wins += 1;

		this.updateScore();
		
		this.changeModalContent("win");
		this.toggleModal(true);

		document.onkeyup = function() {
			hangmanGame.newRound();
		}
	}, 

	updateScore: function() {
		this.Settings.LossCountElement.innerHTML = this.curr.losses;
		this.Settings.WinCountElement.innerHTML = this.curr.wins;
	},

	newRound: function() {
		// reset game
		this.curr.prevGuesses = [];

		this.curr.numGuesses = 0;

		this.updateDisplayImg();

		this.resetAlphaDisplay();

		this.toggleModal(true);

		// get a word
		this.chooseWord();
	}
};


window.onload = function() {

	hangmanGame.init();

}

