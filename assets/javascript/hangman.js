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

		// build the initial display word
		this.curr.displayWord = this.initDisplayWord(this.curr.wordToGuess);

		// build the alphabet display
		this.buildAlphaDisplay(this.Settings.Alphabet);

		// add click event listener to alphabet letter elements
		this.createClickListeners();
		

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
		// set current guess to value of clicked letter
		hangmanGame.curr.currentGuess = event.target.innerHTML;

		// if guess is correct
		if(hangmanGame.checkGuess(hangmanGame.curr.currentGuess)) {
			// remove click event listener from element
			event.target.removeEventListener("click", hangmanGame.letterClicked);
			// set class of clicked element to correct
			event.target.className = "correct";
			// update display word with correctly guessed character
			hangmanGame.updateDisplayWord(hangmanGame.curr.correctGuess);
			// update display elements
			hangmanGame.updateDisplay();

			console.log(hangmanGame.curr.numGuesses);

		} else {
			// remove click event listener from element
			event.target.removeEventListener("click", hangmanGame.letterClicked);
			// set class of clicked element to wrong
			event.target.className = "wrong";
			// update display elements
			hangmanGame.updateDisplay();

			console.log(hangmanGame.curr.numGuesses);
		}
		return;
	},

	letterPressed: function(event) {
		var keyPressed = event.key
		// set current guess to value of pressed character
		hangmanGame.curr.currentGuess = keyPressed;
		//remove character's click listener
		removeClickListener(keyPressed);

		// if guess is correct
		if(hangmanGame.checkGuess(hangmanGame.curr.currentGuess)) {
			// remove click event listener from element
			event.target.removeEventListener("click", hangmanGame.letterClicked);
			// set class of clicked element to correct
			event.target.className = "correct";
			// update display word with correctly guessed character
			hangmanGame.updateDisplayWord(hangmanGame.curr.correctGuess);
			// update display elements
			hangmanGame.updateDisplay();

			console.log(hangmanGame.curr.numGuesses);

		} else {
			// remove click event listener from element
			event.target.removeEventListener("click", hangmanGame.letterClicked);
			// set class of clicked element to wrong
			event.target.className = "wrong";
			// update display elements
			hangmanGame.updateDisplay();

			console.log(hangmanGame.curr.numGuesses);
		}
		return;
	},

	removeClickListener: function(char) {
		// get DOM element of guessed letter
		charElement = document.getElementById(`char-${char}`);
		// remove click listener from element
		charElement.removeEventListener("click", hangmanGame.letterClicked);
	}

	checkGuess: function(guess) {
		// function that's called when a user makes a guess
		if(this.curr.wordToGuess.indexOf(guess) === -1) {
			// incorrect guess, increment incorrect guesses by 1
			this.curr.numGuesses += 1;
			return false;
		} else {
			this.updateCorrectGuess(guess);
			return true;
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
	}, 

	updateDisplayWord: function(obj) {
		//function gets passed this.curr.correctGuess obj
		var tempWord = hangmanGame.curr.displayWord;
		// go through each correct position
		obj.positions.forEach(function(index) {
			// update display word with correct character
			tempWord = tempWord.substring(0, index) + obj.char + tempWord.substring(index+1);
		});

		hangmanGame.curr.displayWord = tempWord;
	},

	updateDisplay: function() {
		// function to update display based on any changes

		// update displayed image
		//code;
		// update displayed word
		this.Settings.WordElement.innerHTML = this.curr.displayWord;
		// update alphabet
		//code;
	}
};


window.onload = function() {

	hangmanGame.init();

	document.onkeyup = hangmanGame.letterPressed();

	console.log(hangmanGame.curr.wordToGuess);


}



