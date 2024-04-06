// here all socket stuff will be present
const { io, app } = require('../servers');
const Orb = require('./classes/Orb');
const Player = require('./classes/Player');
const Playerconfig = require('./classes/PlayerConfig');
const PlayerData = require('./classes/PlayerData');
const {checkForOrbCollisions, checkForPlayerCollisions} = require('./checkCollisions')
const orbs = [];  // to store orbs
const settings = {
    defaultNumberOfOrbs: 5000,
    defaultSpeed: 6, //player speed, will reduce when playersize increase
    defaultSize: 6, // player size  will increase by consuming orbs
    defaultZoom: 1.5, // as player gets bigger, zoom out will be done
    worldWidth: 5000,
    worldHeight: 5000,
    defaultNonPlayerOrbSize: 5 // will not change
}
const players = []  // to store players 
const playerForUsers = [] // to store the 'playerData' of players , this is needed becuase in the client side we dont want to send whole 'players' array becuase it contains both playerconfig and playerData, on the frontEnd we just need playerData
initGame();

let clearTickEventInterval;


// we send orbs when new socket joins
io.on('connect', (socket) => {
    let player = {};
    socket.on('init', (playerObj, ackCallback) => {
        
        if (players.length === 0) { // as soon as game starts, start running every 33 ms
            clearTickEventInterval = setInterval(() => {
                // send the event to game room, in this room only those clients will receive the data who are playing the game,becuase in socket.on('init') clients who wants to play join 'game' room
                io.to('game').emit('tick', playerForUsers);
            }, 28)
        }

        socket.join('game'); // joined game room
        // make  Playerconfig object-> this data is specific to this player and this data must not be known by any other player
        // make playerData object -> this data is specific to this player that everyone needs to know
        // a player object which contains whole info which is listed above
        const playerName = playerObj.playerName;
        const playerConfig = new Playerconfig(settings);
        const playerData = new PlayerData(playerName, settings);
        player = new Player(socket.id, playerConfig, playerData);
        players.push(player);
        playerForUsers.push({playerData});
        ackCallback({orbs,indexInPlayers:playerForUsers.length-1}) // send orbs array back as acknowledgement
    })

    // client send where he wants to move
    socket.on('tock', (data) => {

        //  this is because client kept sending tock event after disconnect
        if(!player.playerConfig){
            return;
        }
        speed = player.playerConfig.speed;
        // we receive info where player wants to move
        player.playerConfig.xVector = data.xVector;
        player.playerConfig.yVector = data.yVector;

        const xV = player.playerConfig.xVector;
        const yV = player.playerConfig.yVector;

        // we update the player location
        if ((player.playerData.locX > 5 && xV < 0) || (player.playerData.locX < settings.worldWidth) && (xV > 0)) {
            player.playerData.locX += speed * xV;
        }
        if ((player.playerData.locY > 5 && yV > 0) || (player.playerData.locY < settings.worldHeight) && (yV < 0)) {
            player.playerData.locY -= speed * yV;
        }

        // check of collisions  playerToOrb, playerToPlayer  and we will send the scores to the client as well
        const capturedOrbIdx = checkForOrbCollisions(player.playerData,player.playerConfig,orbs,settings);
        if(capturedOrbIdx!==null){
            orbs.splice(capturedOrbIdx,1,new Orb(settings)); // remove the caputred orb and add a new one

            // now update client with just new orb
            const orbData = {
                capturedOrbIdx,
                newOrb: orbs[capturedOrbIdx]
            }
            io.to('game').emit('orbSwitch',orbData);
            io.to('game').emit('updateLeaderBoard',getLeaderBoard());
        }

        // playerToPlayer Collision
        const absorbedPlayerData = checkForPlayerCollisions(player.playerData, player.playerConfig,players,playerForUsers,socket.id);
        if(absorbedPlayerData){
            io.to('game').emit('playerAbsorbed',absorbedPlayerData);
            io.to('game').emit('updateLeaderBoard',getLeaderBoard());
        }

    })

    socket.on('disconnect', () => {

        // loop through playerArray and find the player THIS player's socketID and splice that player out
        // basically remove that player who got disconnect from our arrays
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