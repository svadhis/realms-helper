import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		activePlayer: 1,
		damage: 0,
		money: 0,
		players: 2,
		initialHealth: 50,
		maxTime: 0,
		optionBoard: false
	}
});

navigator.wakeLock.request('screen');

window.addEventListener('contextmenu', function (e) {
	e.preventDefault();
}, false);

export default app;