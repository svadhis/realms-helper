import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		activePlayer: 1,
		attack: 0,
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

/*Only needed for the controls*/
var phone = document.getElementById("phone_1"),
  iframe = document.getElementById("frame_1");

/*View*/
function updateView(view) {
  if (view) {
    phone.className = "phone view_" + view;
  }
}

export default app;