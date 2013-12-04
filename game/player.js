var Player = function(id) {
    this.SPEED_TRANSLATE = 3; // [pixel]
    this.SPEED_ROTATION = 6 * Math.PI / 180; // [radian]
    this.FOV_RADIUS = 100; // [pixel]
    this.FOV_ANGLE = 100 * Math.PI / 180; // [radian]
    this.id = id;
    this.x = 0; // [pixel]
    this.y = 0; // [pixel]
    this.r = 0; // [degree]
    this.fovRadius = this.FOV_RADIUS;
    this.fovAngle = this.FOV_ANGLE;
    this.role = 0; // 0 is normal, 1 is evil
    this.keys = {
        up: false,
        down: false,
        right: false,
        left: false,
        cw: false,
        ccw: false
    };
};

Player.prototype = {
    updateKey: function(key, status) {
        this.keys[key] = status;
    },

    move: function() {
        if (this.keys.up)    this.y -= this.SPEED_TRANSLATE;
        if (this.keys.down)  this.y += this.SPEED_TRANSLATE;
        if (this.keys.right) this.x += this.SPEED_TRANSLATE;
        if (this.keys.left)  this.x -= this.SPEED_TRANSLATE;
        if (this.keys.cw)    this.r += this.SPEED_ROTATION;
        if (this.keys.ccw)   this.r -= this.SPEED_ROTATION;
        // adjust
        if (this.r < 0)           this.r += Math.PI * 2;
        if (this.r > Math.PI * 2) this.r -= Math.PI * 2;
    }
}

module.exports = Player;
