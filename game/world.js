var Player = require('./player');

var World = function(id) {
    this.id = id;
    this.width = 500;
    this.height = 500;
    this.players = {};

    this.FPS = 15;
    this.INVINCIBLE_FRAME = 2 * this.FPS; // 5 sec
    this.GAME_TIME = 1 * 60 * this.FPS; // 1 min
    this._intervalId = null;
    this._remainTime = null; // [frames]
}

World.prototype = {
    add: function(id, userId) {
        var player = new Player(id, userId, this.width, this.height);
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
        console.log("#players = " + numPlayers);
        if (numPlayers === 0) {
            this.stop();
        } else if (role === 1) {
            var nextEvilId = Math.floor(Math.random() * numPlayers);
            this.players[nextEvilId].role = 1;
        }
    },

    start: function(callback, endCallback) {
        if (this._intervalId !== null) return;
        // reset score
        for (var id in this.players)
            this.players[id].resetScore();
        // set time
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

    isPlaying: function() {
        return this._intervalId !== null;
    },

    getRemainTimeSec: function() {
        return this._remainTime / this.FPS;
    },

    _logic: function() {
        // move
        var devil = null;
        var players = [];
        var invinsibles = [];
        for (var id in this.players) {
            var player = this.players[id];
            player.move();
            if (player.role == 1) devil = player;
            else if (player.role == 0) players.push(player);
            else if (player.role < 0) invinsibles.push(player);
        }

        // role & score update for player
        var score = 1 / this.FPS;
        var roleChanged = false;
        for (var pid in players) {
            var player = players[pid];
            player.addScore(score);
            if (!roleChanged) {
                var dx = player.x - devil.x;
                var dy = player.y - devil.y;
                if (dx * dx + dy * dy < 100) {
                    player.role = 1;
                    devil.role = -1 * this.INVINCIBLE_FRAME;
                    roleChanged = true;
                    player.addScore(-1 * score);
                    devil.addScore(score * this.INVINCIBLE_FRAME);
                }
            }
        }

        // role update for invinsible
        for (var vid in invinsibles) {
            invinsibles[vid].role++;
        }

    }
}

module.exports = World;