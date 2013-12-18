$(function() {
    // event id and user id
    var EVENT_ID = 1;
    var USER_ID = Math.floor(Math.random() * 100);

    // 1. create game core instance with event id and usre id
    var game = new Game(EVENT_ID, USER_ID);

    // 2. button event handling
    var btnStart = $('#btn_start')
                   .on('click', function() {
                       game.start();
                   });

    // 3. start event
    game.on('start', function() {
        btnStart.text('Playing');
        btnStart.addClass('disabled');
        notify('START');
    });

    // 4. end event
    game.on('end', function() {
        btnStart.text('Start');
        btnStart.removeClass('disabled');
        $('#countdown').text("0");
        notify('END');
        // get score or some other actions
        console.log(game.getMyScore());
    });

    // 5. join event (option)
    game.on('joined', function(msg) {
        //
        // msg {
        //   joined: <userId>,
        //   all: [
        //     <userId>,
        //     <userId>
        //   ]
        // }
        //
        notify(msg.joined + ' is joined', true);
        updateParticipant(msg.all);
    });

    // 6. leave event (option)
    game.on('leaved', function(msg) {
        //
        // msg {
        //   leaved: <userId>,
        //   all: [
        //     <userId>,
        //     <userId>
        //   ]
        // }
        //
        notify(msg.leaved + ' is leaved', true);
        updateParticipant(msg.all);
    });

    // 7. update event
    game.on('update', function(msg) {
        //
        // msg {
        //   scores: {
        //     <userId>: <score:float>,
        //     <userId>: <score:float>
        //   },
        //   remainTime: <time:int>
        // }
        //
        $('#countdown').text(Math.round(msg.remainTime));
    });

    var updateParticipant = function(players) {
        var $players = $('#players').empty();
        for (var i = 0, l = players.length; i < l; i++) {
            var $li = $('<li>').text(players[i]);
            if (players[i] == USER_ID)
                $players.prepend($li.addClass('me'));
            else
                $players.append($li);
        }
    }

    var notify = function(msg, isSmall) {
        var $notify = $('.notify');
        if (isSmall) $notify.addClass('small');
        else $notify.removeClass('small');

        $notify.text(msg).removeClass('fadeinout');
        setTimeout(function() {
            $notify.addClass('fadeinout');
        }, 0);
    }
});
