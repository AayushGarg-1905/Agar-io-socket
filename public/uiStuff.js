
// set height and width of canvas = window

let wHeight = window.innerHeight;
let wWidth = window.innerWidth;

const canvas = document.querySelector('#the-canvas');
const context = canvas.getContext('2d'); 
canvas.height = wHeight;
canvas.width = wWidth;
const player = {} 
let orbs = [];
let players =[];  
const loginModal = new bootstrap.Modal(document.querySelector('#loginModal'));
const spwanModal = new bootstrap.Modal(document.querySelector('#spawnModal'));

window.addEventListener('load',()=>{
    loginModal.show();
})

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


const playSoloBtn = document.querySelector('.start-game');
const hiddenStuff = document.querySelectorAll('.hiddenOnStart');
playSoloBtn.addEventListener('click',(e)=>{
    spwanModal.hide();
    Array.from(hiddenStuff).forEach((ele)=>{
        ele.removeAttribute('hidden');
    })
    init() 
})