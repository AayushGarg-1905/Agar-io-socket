const { io, app } = require('../servers');
const Orb = require('./classes/Orb');
const Player = require('./classes/Player');
const Playerconfig = require('./classes/PlayerConfig');
const PlayerData = require('./classes/PlayerData');
const {checkForOrbCollisions, checkForPlayerCollisions} = require('./checkCollisions')
const orbs = [];  // to store orbs
const settings = {
    defaultNumberOfOrbs: 5000,
    defaultSpeed: 6, 
    defaultSize: 6,
    defaultZoom: 1.5, 
    worldWidth: 5000,
    worldHeight: 5000,
    defaultNonPlayerOrbSize: 5 
}
const players = [];   
const playerForUsers = []; 
initGame();

let clearTickEventInterval;

//  send orbs when new socket joins
io.on('connect', (socket) => {
    let player = {};
    socket.on('init', (playerObj, ackCallback) => {
        
        if (players.length === 0) { 
            clearTickEventInterval = setInterval(() => {
                io.to('game').emit('tick', playerForUsers);
            }, 28)
        }

        socket.join('game');
        const playerName = playerObj.playerName;
        const playerConfig = new Playerconfig(settings);
        const playerData = new PlayerData(playerName, settings);
        player = new Player(socket.id, playerConfig, playerData);
        players.push(player);
        playerForUsers.push({playerData});
        ackCallback({orbs,indexInPlayers:playerForUsers.length-1}) 
    })

    // client send where he wants to move
    socket.on('tock', (data) => {

        if(!player.playerConfig){
            return;
        }
        speed = player.playerConfig.speed;
        player.playerConfig.xVector = data.xVector;
        player.playerConfig.yVector = data.yVector;

        const xV = player.playerConfig.xVector;
        const yV = player.playerConfig.yVector;

        // update the player location
        if ((player.playerData.locX > 5 && xV < 0) || (player.playerData.locX < settings.worldWidth) && (xV > 0)) {
            player.playerData.locX += speed * xV;
        }
        if ((player.playerData.locY > 5 && yV > 0) || (player.playerData.locY < settings.worldHeight) && (yV < 0)) {
            player.playerData.locY -= speed * yV;
        }

        // check of collisions
        const capturedOrbIdx = checkForOrbCollisions(player.playerData,player.playerConfig,orbs,settings);
        if(capturedOrbIdx!==null){
            orbs.splice(capturedOrbIdx,1,new Orb(settings)); // remove the caputred orb and add a new one
            const orbData = {
                capturedOrbIdx,
                newOrb: orbs[capturedOrbIdx]
            }
            io.to('game').emit('orbSwitch',orbData);
            io.to('game').emit('updateLeaderBoard',getLeaderBoard());
        }
        const absorbedPlayerData = checkForPlayerCollisions(player.playerData, player.playerConfig,players,playerForUsers,socket.id);
        if(absorbedPlayerData){
            io.to('game').emit('playerAbsorbed',absorbedPlayerData);
            io.to('game').emit('updateLeaderBoard',getLeaderBoard());
        }

    })

    socket.on('disconnect', () => {
        for(let i=0;i<players.length;i++){
            if(players[i].socketId === player.socketId){
                players.splice(i,1,{});
                playerForUsers.splice(i,1,{});
                break;
            }
        }
        if (players.length === 0) {
            clearInterval(clearTickEventInterval);
        }
    })

})



function initGame() {
    for (let i = 0; i < settings.defaultNumberOfOrbs; i++) {
        orbs.push(new Orb(settings));
    }
}

function getLeaderBoard(){
    const leaderBoardArray = players.map((currPlayer)=>{
        if(currPlayer.playerData){
            return {
                name:currPlayer.playerData?.name,
                score:currPlayer.playerData?.score,
                id:currPlayer.socketId//
            }
        }
        return {};
        
    })
    return leaderBoardArray;
}