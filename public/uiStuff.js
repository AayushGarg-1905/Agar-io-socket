
// set height and width of canvas = window

let wHeight = window.innerHeight;
let wWidth = window.innerWidth;

const canvas = document.querySelector('#the-canvas');
const context = canvas.getContext('2d'); // using this we draw on the canvas
canvas.height = wHeight;
canvas.width = wWidth;
const player = {} // here will store info of a player like name,score etc;
let orbs = [];
let players =[];  // here we will store all players
// modals from bootstrap , we can open and close them programatically
const loginModal = new bootstrap.Modal(document.querySelector('#loginModal'));
const spwanModal = new bootstrap.Modal(document.querySelector('#spawnModal'));


// load the login modal on pageLoad
window.addEventListener('load',()=>{
    loginModal.show();
})


// listener on play as guest form
const playAsGuestForm = document.querySelector('.name-form');
const playerNameInput = document.querySelector('#name-input');
const playerName = document.querySelector('.player-name');
playAsGuestForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    player.name = playerNameInput.value;
    playerName.innerHTML = player.name;
    loginModal.hide();
    spwanModal.show();
    console.log('player is ',player);
})


// starting game 
const playSoloBtn = document.querySelector('.start-game');
const hiddenStuff = document.querySelectorAll('.hiddenOnStart');
playSoloBtn.addEventListener('click',(e)=>{
    // hide spawn modal
    // show leaderboard and scoreboard , we will target the ele and remove the 'hidden' attribute
    spwanModal.hide();
    Array.from(hiddenStuff).forEach((ele)=>{
        ele.removeAttribute('hidden');
    })
    init()  // inside socket.js
})