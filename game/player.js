var Player = function(id, userId, fieldWidth, fieldHeight) {
    this.SPEED_TRANSLATE = 3; // [pixel]
    this.SPEED_ROTATION = 6 * Math.PI / 180; // [radian]
    this.FOV_RADIUS = 100; // [pixel]
    this.FOV_ANGLE = 100 * Math.PI / 180; // [radian]
    this.id = id;
    this.userId = userId;

    // geometory
    this._fieldWidth = fieldWidth;
    this._fieldHeight = fieldHeight;
    this.x = Math.floor(Math.random() * fieldWidth); // [pixel]
    this.y = Math.floor(Math.random() * fieldHeight); // [pixel]
    this.r = Math.random() * Math.PI * 2; // [degree]
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
        if (this.x < 0)                      this.x = 0;
        else if (this.x > this._fieldWidth)  this.x = this._fieldWidth;
        if (this.y < 0)                      this.y = 0;
        else if (this.y > this._fieldHeight) this.y = this._fieldHeight;
        if (this.r < 0)                      this.r += Math.PI * 2;
        else if (this.r > Math.PI * 2)       this.r -= Math.PI * 2;
    }
}

module.exports = Player;
