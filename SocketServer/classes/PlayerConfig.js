class Playerconfig{
    constructor(settings){
        this.xVector = 0;
        this.yVector = 0;
        this.speed = settings.defaultSpeed
        this.zoom = settings.defaultZoom;
    }
}

module.exports = Playerconfig;