var Player = require('./player');

var World = function(id) {
    this.id = id;
    this.players = {};
    this.FPS = 15;
    this.INVINCIBLE_FRAME = 2 * this.FPS; // 5 sec
    this._intervalId = null;
}

World.prototype = {
    add: function(id) {
        var player = new Player(id);
        this.players[id] = player;
        if (Object.keys(this.players).length === 1)
            player.role = 1;
        return player;
    },

    remove: function(id) {
        var player = this.players[id];
        if (player === undefined) {
            stop();
            return;
        }
        var role = player.role;
        delete this.players[id];
        var numPlayers = Object.keys(this.players).length;
        if (numPlayers !== 0 && role === 1) {
            var nextEvilId = Math.floor(Math.random() * numPlayers);
            this.players[nextEvilId].role = 1;
        }
    },

    start: function(callback) {
        if (this._intervalId !== null) return;
        var self = this;
        this._intervalId = setInterval(
            function() {
                self._logic();
                callback(self);
            }, 1000 / this.FPS);
    },

    stop: function() {
        if (this._intervalId === null) return;
        clearInterval(this._intervalId);
        this._intervalId = null;
    },

    _logic: function() {
        // move
        var devil = null;
        for (var id in this.players) {
            this.players[id].move();
            if (this.players[id].role == 1) devil = this.players[id];
        }

        // role update
        for (var id in this.players) {
            var player = this.players[id];
            if (player.role == 0) {
                var dx = player.x - devil.x;
                var dy = player.y - devil.y;
                if (dx * dx + dy * dy < 100) {
                    player.role = 1;
                    devil.role = -1 * this.INVINCIBLE_FRAME;
                    break;
                }
            } else if (player.role < 0) {
                player.role++;
            }
        }
    }
}

module.exports = World;