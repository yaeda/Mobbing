"use strict";

var DEBUG_MODE = false;

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

    _drawFOV: function(x, y, r, angle, radius, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.arc(x, y, radius, r - angle / 2, r + angle / 2);
        this.ctx.closePath();
        this.ctx.fillStyle = color;
        this.ctx.fill();
    },

    _canSee: function(me, other) {
        var dx = other.x - me.x;
        var dy = other.y - me.y;
        var dd = Math.sqrt(dx * dx + dy * dy);
        if (dd >= me.fovRadius) return false;

        var sx = Math.cos(me.r - me.fovAngle / 2);
        var sy = Math.sin(me.r - me.fovAngle / 2);
        var ex = Math.cos(me.r + me.fovAngle / 2);
        var ey = Math.sin(me.r + me.fovAngle / 2);
        if (sx * ey - ex * sy > 0) {
            if (sx * dy - dx * sy < 0) return false;
            if (ex * dy - dx * ey > 0) return false;
            return true;
        } else {
            if (sx * dy - dx * sy > 0) return true;
            if (ex * dy - dx * ey < 0) return true;
            return false;
        }
    },

    render: function(world, playerId) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.save();
        var me = world.players[playerId];
        for (var id in world.players) {
            var p = world.players[id];
            if (p.id !== me.id) {
                if (this._canSee(me, p)) {
                    this._drawFOV(p.x, p.y, p.r, p.fovAngle, p.fovRadius, 'rgba(85, 85, 85, 0.3)');
                    this._drawCircle(p.x, p.y, '#555555');
                } else if (DEBUG_MODE) {
                    this._drawFOV(p.x, p.y, p.r, p.fovAngle, p.fovRadius, 'rgba(176, 176, 176, 0.3)');
                    this._drawCircle(p.x, p.y, '#aaaaaa');
                }
            } else {
                this._drawCircle(p.x, p.y, '#ea157a');
                this._drawFOV(p.x, p.y, p.r, p.fovAngle, p.fovRadius, 'rgba(234, 21, 122, 0.3)');
            }
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
    var DEBUG_KEY = 68; // 'd'
    var KEYTABLE = {32: 'cw', 37: 'left', 38: 'up', 39: 'right', 40: 'down', 67: 'ccw', 86: 'cw'};
    var sendKey = function(code, shiftStatus, status) {
        if (KEYTABLE[code] !== undefined)
            socket.emit('key', {key: KEYTABLE[code], status: status});
    };
    $(window).keydown(function(e) {
        e.preventDefault();
        sendKey(e.keyCode, e.shiftkey, true);
        if (e.keyCode == DEBUG_KEY) DEBUG_MODE = true;
    });
    $(window).keyup(function(e) {
        sendKey(e.keyCode, e.shiftKey, false);
        if (e.keyCode == DEBUG_KEY) DEBUG_MODE = false;
    });
});
