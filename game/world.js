var Player = require('./player');

var World = function(id) {
    this.id = id;
    this.players = {};
    this.FPS = 15;
    this._intervalId = null;
}

World.prototype = {
    add: function(id) {
        var player = new Player(id);
        this.players[id] = player;
        return player;
    },

    remove: function(id) {
        delete this.players[id];
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
        // just move
        for (var id in this.players)
            this.players[id].move();
    }
}

module.exports = World;