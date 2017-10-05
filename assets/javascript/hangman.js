var hangmanGame = {
	Settings: {
		// constant game settings
		Alphabet: [
			["A","B","C","D","E","F","G"],
			["H","I","J","K","L","M","N"],
			["O","P","Q","R","S","T","U"],
			["V","W","X","Y","Z"]
		],
		MaxGuesses: 6,
		WordElement: document.getElementById("wordToGuess"),
		AlphabetDiv: document.getElementById("alphabet")
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
		correctGuess: {
			char: "",
			positions: [],
			previous: []
		}
	},

	init: function() {
		// freeze Settings obj so no changes can be made
		Object.freeze(this.Settings);

		// get the game type
		this.gameType();

		// get a word
		this.curr.wordToGuess = this.chooseWord();
		console.log(`wordToGuess: ${this.curr.wordToGuess}`);

		// build the initial display word
		this.curr.displayWord = this.initDisplayWord(this.curr.wordToGuess);

		// build the alphabet display
		this.buildAlphaDisplay(this.Settings.Alphabet);

		// add click event listener to alphabet letter elements
		this.createClickListeners();

		document.onkeyup = this.letterPressed;
	},

	gameType: function() {
		// determines whether the game is vs computer or human
		// let typePrompt = confirm("Are you playing with another person?");
		var typePrompt = false; // <-------------------------------------- Just false for testing purposes
		if(typePrompt) {
			this.curr.gameType = "vsHuman"
		} else {
			this.curr.gameType = "vsComputer";
		}
	},

	chooseWord: function() {
		// function to get word. Random if vs comp, input if pvp.
		if(this.curr.gameType === "vsComputer") {
			// get random word
			var randomWord = this.getRandomWord();
			return randomWord;

		} else {
			// ask player for input word
			var playerWord = this.getPlayerWord();
			return playerWord;
		}
	},

	getPlayerWord: function() {
		var input = "";
		do {
			input = prompt("Enter a word between 4 and 12 characters for the next game.");
		} while (input.length < 4 || input.length > 12)
		return input.toUpperCase();
	},

	getRandomWord: function() {
		// set random word length betweeen 4 and 12
		var ranWordLen = (Math.floor(Math.random() * 9) + 4);
		// initialize new http request variable
		var xhttpReq = new XMLHttpRequest();
		// configure GET request from random word generator.
		xhttpReq.open("GET", `http://randomword.setgetgo.com/randomword/get.php?len=${ranWordLen.toString()}`, false);
		// make web service call
		xhttpReq.send();

		return xhttpReq.responseText.toUpperCase();
	},

	initDisplayWord: function(word) {
		var tempWord = "";

		for (var i = 0; i < word.length; i += 1) {
			tempWord += "_";
		}

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
				cell.id = `char-${cellData}`;
				// append td element to the row
				row.appendChild(cell);
			});
			// append the row to the table
			table.appendChild(row);
		});

		// append fully constructed table to alphabet div
		this.Settings.AlphabetDiv.appendChild(table);
	},

	createClickListeners: function() {
		var letterElements = document.getElementsByClassName("letter");
		for(var i = 0; i < letterElements.length; i += 1) {
			letterElements[i].addEventListener("click", hangmanGame.letterClicked);
		}
	},

	letterClicked: function(event) {
		var keyClicked = event.target.innerHTML.toUpperCase();

		// set current guess to value of clicked letter
		hangmanGame.curr.currentGuess = keyClicked;
		//remove character's click listener
		hangmanGame.removeClickListener(keyClicked);

		// if guess is correct
		if(hangmanGame.checkGuess(keyClicked)) {
			hangmanGame.updateCorrectGuess(keyClicked);
		} else {
			hangmanGame.updateWrongGuess(keyClicked);
		}
		return;
	},

	letterPressed: function(event) {
		var keyPressed = event.key.toUpperCase();

		var alphaKeys = /^[a-z]+$/i;
		if(!alphaKeys.test(keyPressed)) {
			return;
		}

		// set current guess to value of pressed character
		hangmanGame.curr.currentGuess = keyPressed;
		//remove character's click listener
		hangmanGame.removeClickListener(keyPressed);

		// if guess is correct
		if(hangmanGame.checkGuess(keyPressed)) {
			hangmanGame.updateCorrectGuess(keyPressed);
		} else {
			hangmanGame.updateWrongGuess(keyPressed);
		}
	},

	removeClickListener: function(char) {
		// get DOM element of guessed letter
		var charElement = this.getCharElement(char);
		// remove click listener from element
		charElement.removeEventListener("click", this.letterClicked);
	},

	getCharElement: function(char) {
		// 
		return document.getElementById(`char-${char}`);
	},

	checkGuess: function(guess) {
		if(this.curr.wordToGuess.indexOf(guess) !== -1) {
			return true;
		} else {
			return false;
		}
	},

	checkNumGuesses: function() {
		if(this.curr.numGuesses >= 6) {
			this.lostGame();
		}
	},

	checkWin: function() {
		if(this.curr.displayWord.indexOf("_") === -1) {
			this.wonGame();
		}
	},

	updateWrongGuess: function(char){
		// incorrect guess, increment incorrect guesses by 1
		this.curr.numGuesses += 1;

		// change letter element class to wrong
		var charElement = this.getCharElement(char);
		charElement.className = "wrong";

		if(this.updateDisplay()) {
			this.checkNumGuesses();
		}
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

		var charElement = this.getCharElement(char);
		charElement.className = "correct";

		if(this.updateDisplay()) {
			this.checkWin();
		}
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

	updateDisplay: function() {
		// function to update display based on any changes

		// update displayed image
		//code;
		// update display word with correctly guessed character
		this.updateDisplayWord(this.curr.correctGuess);
		// update displayed word
		this.Settings.WordElement.innerHTML = this.curr.displayWord;
		// update alphabet
		//code;

		return true;
	}, 

	lostGame: function() {
		// display game over, ask if they want to restart
		this.curr.losses += 1;
		alert("lost");
	},

	wonGame: function() {
		// display won game, start new level
		this.curr.wins += 1;
		alert("won");
	}, 

	nextLevel() {
		// reset game
	}
};


window.onload = function() {

	hangmanGame.init();

}



