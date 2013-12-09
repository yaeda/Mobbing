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
    });

    // 4. end eventa
    game.on('end', function() {
        btnStart.text('Ended');
        // get score or some other actions
        console.log(game.getMyScore());
    });
});
