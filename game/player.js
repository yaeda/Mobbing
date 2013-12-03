var Player = function(id) {
    this.SPEED = 2;
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.keys = {
        up: false,
        down: false,
        right: false,
        left: false
    };
};

Player.prototype = {
    updateKey: function(key, status) {
        this.keys[key] = status;
    },

    move: function() {
        if (this.keys.up)    this.y -= this.SPEED;
        if (this.keys.down)  this.y += this.SPEED;
        if (this.keys.right) this.x += this.SPEED;
        if (this.keys.left)  this.x -= this.SPEED;
    }
}

module.exports = Player;
