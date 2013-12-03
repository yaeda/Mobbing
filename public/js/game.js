"use strict";

var Game = function() {
    var canvas = document.getElementById('game_field');
    this.width = canvas.width = 500;
    this.height = canvas.height = 500;
    this.ctx = canvas.getContext('2d');
}

Game.prototype = {
    _drawCircle: function(x, y, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    },

    render: function(world, playerId) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();
        for (var id in world.players) {
            var p = world.players[id];
            if (p.id !== playerId)
                this._drawCircle(p.x, p.y, '#555555');
            else
                this._drawCircle(p.x, p.y, '#ea157a');
        }
        this.ctx.restore();
    }
}

$(function() {
    var roomId = "1";
    var socket = io.connect('/game');
    var game = new Game();
    var playerId = null;
    socket.on('update', function(world) {
        game.render(world, playerId);
    });
    socket.on('connected', function(msg) {
        socket.emit('join', roomId);
        playerId = msg.id;
    });

    // keycode
    var KEYTABLE = {37: 'left', 38: 'up', 39: 'right', 40: 'down'};
    var sendKey = function(code, status) {
        if (KEYTABLE[code] !== undefined)
            socket.emit('key', {key: KEYTABLE[code], status: status});
    };
    $(window).keydown(function(e) {
        e.preventDefault();
        sendKey(e.keyCode, true);
    });
    $(window).keyup(function(e) {
        sendKey(e.keyCode, false);
    });
});
