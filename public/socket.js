const localUrl='http://localhost:9000'
const baseUrl = 'https://agar-io-socket.onrender.com'
const socket = io.connect(baseUrl);

// init will be called in UIStuff.js when we click to start the game
const init = async () => {
    const initData = await socket.emitWithAck('init', {
        playerName: player.name
    })
    // console.log(nonPlayerOrbs);

    setInterval(() => {
        socket.emit('tock', {
            xVector: player.xVector ? player.xVector : .1,
            yVector: player.yVector ? player.yVector : .1
        })
    }, 28)
    console.log(initData.orbs);
    orbs = initData.orbs;
    player.indexInPlayers = initData.indexInPlayers;
    // console.log(orbs);
    draw();  // inside canvas.js
}

//server sends out the location/data of all players playing
// and we update the location of player based on data given by server
socket.on('tick', (playersArray) => {
    console.log(playersArray);
    players = playersArray;
    player.locX = players[player.indexInPlayers].playerData?.locX;
    player.locY = players[player.indexInPlayers].playerData?.locY;

})

socket.on('orbSwitch', (orbData) => {
    // we get the idx of orb which got absorbed and also a newOrb which we need to add to game
    // client also has orb array so we also need to remove the absorbed orb from here

    orbs.splice(orbData.capturedOrbIdx, 1, orbData.newOrb);
})

socket.on('playerAbsorbed', (absorbedPlayerData) => {
    document.querySelector('#game-message').innerHTML = `${absorbedPlayerData.absorbed} was absorbed by ${absorbedPlayerData.absorbedBy}`
    document.querySelector('#game-message').style.opacity = 1;
    window.setTimeout(() => {
        document.querySelector('#game-message').style.opacity = 0;
    }, 2000);

})


socket.on('updateLeaderBoard', (leaderBoardArray) => {
    // update dom for leader board
    leaderBoardArray.sort((a, b) => {
        return b.score - a.score
    })
    document.querySelector('.leader-board').innerHTML = "";
    leaderBoardArray.forEach((p) => {
        if (!p.name) {
            return;
        }
        document.querySelector('.leader-board').innerHTML += `
    <li class="leaderboard-player">
        ${p.name} - ${p.score}${p.id === socket.id ? '*' : ''}
    </li>
`;


    })
})