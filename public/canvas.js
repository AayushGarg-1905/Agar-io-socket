

// player.locX = Math.floor(500 * Math.random() + 10);
// player.locY = Math.floor(500 * Math.random() + 10);
const draw = () => {

    //reset the context 'translate' back to default
    context.setTransform(1, 0, 0, 1, 0, 0);

    // clear canvas 
    context.clearRect(0, 0, canvas.width, canvas.height);

    // clamp the screen to player location

    const camX = -player.locX + canvas.width / 2;
    const camY = -player.locY + canvas.height / 2;
    context.translate(camX, camY);   // this basically moves the context

    // drawing all players
    players.forEach((p) => {
        if(!p.playerData){ // this means this player is absorbed
            return;
        }
        context.beginPath();
        context.fillStyle = p.playerData.color;
        context.arc(p.playerData.locX, p.playerData.locY, p.playerData.radius, 0, 2 * Math.PI); // draw a circle
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = "white"
        context.stroke();
    })


    // drawing non player orbs
    orbs.forEach((orb) => {
        context.beginPath();
        context.fillStyle = orb.color;
        context.arc(orb.locX, orb.locY, orb.radius, 0, 2 * Math.PI);
        context.fill();
    })

    requestAnimationFrame(draw); // this is like a controlled loop, it runs the draw function , every fram , if frame is 30fps then it will run 30 times per second
}


// move palyer acc to mouse direction -> moving means we redraw the the player again and again and it seems to be moving
canvas.addEventListener('mousemove', (event) => {
    console.log(event); // it gives us the curr position in terms of x,y

    const mousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    const angleDeg = Math.atan2(mousePosition.y - (canvas.height / 2), mousePosition.x - (canvas.width / 2)) * 180 / Math.PI;
    if (angleDeg >= 0 && angleDeg < 90) {
        xVector = 1 - (angleDeg / 90);
        yVector = -(angleDeg / 90);
    } else if (angleDeg >= 90 && angleDeg <= 180) {
        xVector = -(angleDeg - 90) / 90;
        yVector = -(1 - ((angleDeg - 90) / 90));
    } else if (angleDeg >= -180 && angleDeg < -90) {
        xVector = (angleDeg + 90) / 90;
        yVector = (1 + ((angleDeg + 90) / 90));
    } else if (angleDeg < 0 && angleDeg >= -90) {
        xVector = (angleDeg + 90) / 90;
        yVector = (1 - ((angleDeg + 90) / 90));
    }


    player.xVector = xVector ? xVector : .1;
    player.yVector = yVector ? yVector : .1;
})