var Player = require('./player');

var World = function(id) {
    this.id = id;
    this.players = {};
    this.FPS = 15;
    this.INVINCIBLE_FRAME = 2 * this.FPS; // 5 sec
    this.GAME_TIME = 1 * 60 * this.FPS; // 1 min
    this._intervalId = null;
    this._remainTime = null; // [frames]
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
            this.stop();
            return;
        }
        var role = player.role;
        delete this.players[id];
        var numPlayers = Object.keys(this.players).length;
        if (numPlayers === 0) {
            this.stop();
        } else if (role === 1) {
            var nextEvilId = Math.floor(Math.random() * numPlayers);
            this.players[nextEvilId].role = 1;
        }
    },

    start: function(callback, endCallback) {
        if (this._intervalId !== null) return;
        this._remainTime = this.GAME_TIME;
        var self = this;
        this._intervalId = setInterval(
            function() {
                self._logic();
                self._remainTime--;
                callback(self);
                if (self._remainTime < 0) {
                    endCallback();
                    self.stop();
                }
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