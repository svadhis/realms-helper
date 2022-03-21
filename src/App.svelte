<script>
	import {dndzone} from "svelte-dnd-action";

	export let activePlayer, initialHealth, damage, money, maxTime, players, optionBoard;

	let color = getColor();

	let time = maxTime;

	let p1health = initialHealth;
	let p2health = initialHealth;
	let p3health = initialHealth;
	let p4health = initialHealth;

	let showAttackScale = false;
	let showMoneyScale = false;

	let highlightedAttackScale = 0;
	let highlightedMoneyScale = 0;

	timer();

	let counts = document.querySelectorAll('.count');

	document.addEventListener('long-press', function(e) {
		switch (e.target.dataset.player) {
			case '1':
				p1health -= damage;
				damage = 0;
				break;

			case '2':
				p2health -= damage;
				damage = 0;
				break;

			case '3':
				p3health -= damage;
				damage = 0;
				break;

			case '4':
				p4health -= damage;
				damage = 0;
				break;

			default:
				break;
		}
	})

	function resetGame() {
		p1health = initialHealth;
		p2health = initialHealth;
		p3health = initialHealth;
		p4health = initialHealth;

		damage = 0;
		money = 0;

		toggleOptionBoard();
	}

	function setPlayerNumber(number) {
		players = number;
	}

	function toggleOptionBoard() {
		optionBoard = !optionBoard;
	}

	function incrementP1() {
		p1health += 1;
	}

	function decrementP1() {
		p1health -= 1;
	}

	function incrementP2() {
		p2health += 1;
	}

	function decrementP2() {
		p2health -= 1;
	}

	function incrementP3() {
		p3health += 1;
	}

	function decrementP3() {
		p3health -= 1;
	}

	function incrementP4() {
		p4health += 1;
	}

	function decrementP4() {
		p4health -= 1;
	}

	function incrementDamage() {
		damage += 1;
	}

	function decrementDamage() {
		damage -= 1;
	}

	function incrementMoney() {
		money += 1;
	}

	function decrementMoney() {
		money -= 1;
	}

	function endTurn() {
		money = 0;
		damage = 0;

		activePlayer = getActivePlayer(activePlayer);
		color = getColor();
		time = maxTime;
	}

	function getActivePlayer(currentAP) {
		let aP = currentAP == players ? 1 : currentAP + 1;
		switch (currentAP) {
			case 4:
				if (p1health <= 0) return getActivePlayer(aP)
				break;
			case 1:
				if (p2health <= 0) return getActivePlayer(aP)
				break;
			case 2:
				if (p3health <= 0) return getActivePlayer(aP)
				break;
			case 3:
				if (p4health <= 0) return getActivePlayer(aP)
				break;

			default:
				break;
		}

		return aP;
	}

	function getColor() {
		return activePlayer == 1 ? 'blue' : activePlayer == 2 ? 'pink' : activePlayer == 3 ? 'orange' : 'green';
	}

	function timer() {
		setTimeout(() => {
			if (maxTime > 0) time--;
			timer();
		}, 1000);
	}

	function showScale(type) {
		if (type == 'attack') {
			showAttackScale = true
		}
		else {
			showMoneyScale = true;
		}
	}

	function hideScale(type) {
		if (type == 'attack') {
			showAttackScale = false
		}
		else {
			showMoneyScale = false;
		}	}

	function highlightScale(type, value) {
		if (type == 'attack') {
			highlightedAttackScale = value;
		}
		else {
			highlightedMoneyScale = value;
		}
	}

	function saveAttack(value) {
		damage += +value;
		highlightedAttackScale = 0;
	}

	function saveMoney(value) {
		money += +value;
		highlightedMoneyScale = 0;
	}
</script>

<main class="h-screen overflow-hidden flex flex-col border-blue-800 border-pink-800 border-orange-800 border-green-800">
	<div class="flex-1 flex">
		<div class="{activePlayer == 2 || activePlayer == 4 ? 'rotate-180' : ''} {players >= 2 ? 'flex' : 'hidden'} {players <= 3 ? 'w-full' : 'w-1/2'} player bg-pink-800 text-white relative flex justify-center items-center">
			<div class="pointer-events-none count text-5xl font-black  p-3 z-10 flex justify-center items-center">
				{p2health}
			</div>
			<div class="{p2health <= 0 ? 'flex' : 'hidden'} justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]">X</div>
			<div data-player="2" on:click={incrementP2} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
			<div data-player="2" on:click={decrementP2} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
		</div>
		<div class="{activePlayer == 2 || activePlayer == 4 ? 'rotate-180' : ''} {players >= 4 ? 'flex' : 'hidden'} player bg-green-800 text-white w-1/2 relative justify-center items-center">
			<div class="pointer-events-none count text-5xl font-black p-3 z-10 flex justify-center items-center">
				{p4health}
			</div>
			<div class="{p4health <= 0 ? 'flex' : 'hidden'} justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]">X</div>
			<div data-player="4" on:click={incrementP4} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
			<div data-player="4" on:click={decrementP4} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
		</div>
	</div>

	<div class="bg-red-500 border-b border-t border-black flex-col {activePlayer == 2 || activePlayer == 4 ? 'rotate-180' : ''}">
		<div class="flex">
			<div class="dmg-counter flex justify-center w-1/2 h-56 p-2">
				<div class="counter relative flex flex-1 justify-center items-center">
					<div class="pointer-events-none count text-5xl font-black p-3 my-10 z-10">
						{damage}
					</div>
					<div on:click={incrementDamage} class=" absolute top-0 bottom-1/2 left-0 right-0"></div>
					<div on:click={decrementDamage} class=" absolute top-1/2 bottom-0 left-0 right-0"></div>
				</div>
			</div>
			<div class="money-counter flex justify-center w-1/2 p-2 h-56 bg-yellow-300">
				<div class="counter relative flex flex-1 justify-center items-center">
					<div class="pointer-events-none count text-5xl font-black p-3 z-10">
						{money}
					</div>
					<div on:click={incrementMoney} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
					<div on:click={decrementMoney} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
				</div>
			</div>
		</div>
		<div class="flex justify-between items-center bg-{color}-800 text-3xl font-black px-4 text-white">
			<div on:click={toggleOptionBoard} class="config w-1/5 text-xl p-3">⚙️</div>
			<div on:click={endTurn} class="end-button flex justify-center items-center py-4">
				END TURN
			</div>
			<div class="timer w-1/5 text-xl text-right p-3 {time < 0 && 'text-red-300'}">{maxTime > 0 ? time : ''}</div>
		</div>
	</div>
	<div class="flex-1 flex">
		<div class="{activePlayer == 2 || activePlayer == 4 ? 'rotate-180' : ''} {players <= 2 ? 'w-full' : 'w-1/2'} player bg-blue-800 text-white relative flex justify-center items-center">
			<div class="pointer-events-none count text-5xl font-black p-3 z-10 flex justify-center items-center">
				{p1health}
			</div>
			<div class="{p1health <= 0 ? 'flex' : 'hidden'} justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]">X</div>
			<div data-player="1" on:click={incrementP1} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
			<div data-player="1" on:click={decrementP1} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
		</div>
		<div class="{activePlayer == 2 || activePlayer == 4 ? 'rotate-180' : ''} {players >= 3 ? 'flex' : 'hidden'} player bg-orange-800 text-white w-1/2 relative justify-center items-center">
			<div class="pointer-events-none count text-5xl font-black p-3 z-10 flex justify-center items-center">
				{p3health}
			</div>
			<div class="{p3health <= 0 ? 'flex' : 'hidden'} justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]">X</div>
			<div data-player="3" on:click={incrementP3} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
			<div data-player="3" on:click={decrementP3} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
		</div>
	</div>

	<div class="option-board {activePlayer == 2 || activePlayer == 4 ? 'rotate-180' : ''} {optionBoard ? 'block' : 'hidden'} z-50 text-white absolute top-0 bottom-0 left-0 right-0 bg-black p-5 flex flex-col justify-center">
		<div on:click={toggleOptionBoard} class="absolute top-3 right-3 p-4 text-3xl">X</div>
		<div class="player-number flex flex-col space-y-2">
			<div on:click={() => setPlayerNumber(2)} class="players-2 {players == 2 ? 'bg-gray-800' : 'bg-black'} p-3 border rounded text-center">2 PLAYERS</div>
			<div on:click={() => setPlayerNumber(3)} class="players-3 {players == 3 ? 'bg-gray-800' : 'bg-black'} p-3 border rounded text-center">3 PLAYERS</div>
			<div on:click={() => setPlayerNumber(4)} class="players-4 {players == 4 ? 'bg-gray-800' : 'bg-black'} p-3 border rounded text-center">4 PLAYERS</div>
		</div>
		<div class="timer-option my-10">
			CHRONO :
			<input bind:value={maxTime} class="bg-black w-32">
		</div>
		<div on:click={resetGame} class="reset-game p-3 border rounded text-center">RESET GAME</div>
	</div>

	<div class="absolute top-1/2 left-0 right-0 h-1 {activePlayer == 2 || activePlayer == 4 ? 'rotate-180' : ''}">
		<input
			type="range"
			class="form-range {showAttackScale ? 'touching' : ''} absolute left-1/2 attack -rotate-90 translate-y-[-13px] translate-x-[-330px] appearance-none w-[600px] h-6 p-0 bg-transparent focus:outline-none focus:ring-0 focus:shadow-none"
			min="-10"
			max="10"
			value="{highlightedAttackScale}"
			step="1"
			id="attack-range"
			on:touchstart={_ => showScale('attack')}
			on:touchend={_ => hideScale('attack')}
			on:input={e => highlightScale('attack', e.target.value)}
			on:change={e => saveAttack(e.target.value)}
		/>
		<div class="attack-scale scale absolute left-0 flex-col w-10 h-[600px] translate-y-[-300px] justify-between items-end {showAttackScale ? 'flex' : 'hidden'}">
			<div data-scale="10" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 10 ? 'bg-white' : 'bg-red-300'} font-bold">10</div>
			<div data-scale="9" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 9 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="8" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 8 ? 'bg-white' : 'bg-red-300'}  font-bold">8</div>
			<div data-scale="7" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 7 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="6" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 6 ? 'bg-white' : 'bg-red-300'}  font-bold">6</div>
			<div data-scale="5" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 5 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="4" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 4 ? 'bg-white' : 'bg-red-300'}  font-bold">4</div>
			<div data-scale="3" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 3 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="2" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 2 ? 'bg-white' : 'bg-red-300'}  font-bold">2</div>
			<div data-scale="1" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 1 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="0" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 0 ? 'bg-white' : 'bg-red-300'}  font-bold">0</div>
			<div data-scale="-1" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -1 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-2" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -2 ? 'bg-white' : 'bg-red-300'}  font-bold">-2</div>
			<div data-scale="-3" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -3 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-4" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -4 ? 'bg-white' : 'bg-red-300'}  font-bold">-4</div>
			<div data-scale="-5" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -5 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-6" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -6 ? 'bg-white' : 'bg-red-300'}  font-bold">-6</div>
			<div data-scale="-7" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -7 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-8" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -8 ? 'bg-white' : 'bg-red-300'}  font-bold">-8</div>
			<div data-scale="-9" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -9 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-10" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -10 ? 'bg-white' : 'bg-red-300'}  font-bold">-10</div>
		</div>

		<div class="attack-scale scale absolute right-2 flex-col w-10 h-[600px] translate-y-[-300px] justify-between items-end {showAttackScale ? 'flex' : 'hidden'}">
			<div data-scale="10" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 10 ? 'bg-white' : 'bg-red-300'} font-bold">10</div>
			<div data-scale="9" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 9 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="8" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 8 ? 'bg-white' : 'bg-red-300'}  font-bold">8</div>
			<div data-scale="7" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 7 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="6" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 6 ? 'bg-white' : 'bg-red-300'}  font-bold">6</div>
			<div data-scale="5" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 5 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="4" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 4 ? 'bg-white' : 'bg-red-300'}  font-bold">4</div>
			<div data-scale="3" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 3 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="2" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 2 ? 'bg-white' : 'bg-red-300'}  font-bold">2</div>
			<div data-scale="1" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == 1 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="0" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == 0 ? 'bg-white' : 'bg-red-300'}  font-bold">0</div>
			<div data-scale="-1" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -1 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-2" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -2 ? 'bg-white' : 'bg-red-300'}  font-bold">-2</div>
			<div data-scale="-3" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -3 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-4" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -4 ? 'bg-white' : 'bg-red-300'}  font-bold">-4</div>
			<div data-scale="-5" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -5 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-6" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -6 ? 'bg-white' : 'bg-red-300'}  font-bold">-6</div>
			<div data-scale="-7" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -7 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-8" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -8 ? 'bg-white' : 'bg-red-300'}  font-bold">-8</div>
			<div data-scale="-9" class="rounded-full w-2 h-2 mr-3 {highlightedAttackScale == -9 ? 'bg-white' : 'bg-red-300'} "></div>
			<div data-scale="-10" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedAttackScale == -10 ? 'bg-white' : 'bg-red-300'}  font-bold">-10</div>
		</div>

		<input
			type="range"
			class="form-range {showAttackScale ? 'touching' : ''} absolute right-1/2 attack -rotate-90 translate-y-[-13px] translate-x-[330px] appearance-none w-[600px] h-6 p-0 bg-transparent focus:outline-none focus:ring-0 focus:shadow-none"
			min="-10"
			max="10"
			value="{highlightedMoneyScale}"
			step="1"
			id="attack-range"
			on:touchstart={_ => showScale('money')}
			on:touchend={_ => hideScale('money')}
			on:input={e => highlightScale('money', e.target.value)}
			on:change={e => saveMoney(e.target.value)}
		/>
		<div class="money-scale scale absolute left-0 flex-col w-10 h-[600px] translate-y-[-300px] justify-between items-end {showMoneyScale ? 'flex' : 'hidden'}">
			<div data-scale="10" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 10 ? 'bg-white' : 'bg-yellow-200'} font-bold">10</div>
			<div data-scale="9" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 9 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="8" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 8 ? 'bg-white' : 'bg-yellow-200'}  font-bold">8</div>
			<div data-scale="7" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 7 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="6" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 6 ? 'bg-white' : 'bg-yellow-200'}  font-bold">6</div>
			<div data-scale="5" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 5 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="4" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 4 ? 'bg-white' : 'bg-yellow-200'}  font-bold">4</div>
			<div data-scale="3" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 3 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="2" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 2 ? 'bg-white' : 'bg-yellow-200'}  font-bold">2</div>
			<div data-scale="1" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 1 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="0" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 0 ? 'bg-white' : 'bg-yellow-200'}  font-bold">0</div>
			<div data-scale="-1" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -1 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-2" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -2 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-2</div>
			<div data-scale="-3" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -3 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-4" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -4 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-4</div>
			<div data-scale="-5" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -5 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-6" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -6 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-6</div>
			<div data-scale="-7" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -7 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-8" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -8 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-8</div>
			<div data-scale="-9" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -9 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-10" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -10 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-10</div>
		</div>

		<div class="money-scale scale absolute right-2 flex-col w-10 h-[600px] translate-y-[-300px] justify-between items-end {showMoneyScale ? 'flex' : 'hidden'}">
			<div data-scale="10" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 10 ? 'bg-white' : 'bg-yellow-200'} font-bold">10</div>
			<div data-scale="9" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 9 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="8" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 8 ? 'bg-white' : 'bg-yellow-200'}  font-bold">8</div>
			<div data-scale="7" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 7 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="6" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 6 ? 'bg-white' : 'bg-yellow-200'}  font-bold">6</div>
			<div data-scale="5" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 5 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="4" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 4 ? 'bg-white' : 'bg-yellow-200'}  font-bold">4</div>
			<div data-scale="3" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 3 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="2" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 2 ? 'bg-white' : 'bg-yellow-200'}  font-bold">2</div>
			<div data-scale="1" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == 1 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="0" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == 0 ? 'bg-white' : 'bg-yellow-200'}  font-bold">0</div>
			<div data-scale="-1" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -1 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-2" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -2 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-2</div>
			<div data-scale="-3" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -3 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-4" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -4 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-4</div>
			<div data-scale="-5" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -5 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-6" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -6 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-6</div>
			<div data-scale="-7" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -7 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-8" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -8 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-8</div>
			<div data-scale="-9" class="rounded-full w-2 h-2 mr-3 {highlightedMoneyScale == -9 ? 'bg-white' : 'bg-yellow-200'} "></div>
			<div data-scale="-10" class="rounded-full w-8 h-8 flex justify-center items-center {highlightedMoneyScale == -10 ? 'bg-white' : 'bg-yellow-200'}  font-bold">-10</div>
		</div>
	</div>
</main>


