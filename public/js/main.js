(function($) {
  $(function() {

    var socket = new io.connect("/mobbing");

    socket.on('connect', function(){
        //The following should be rewrited with cookie session access to get username
        //socket.emit('join', {username : prompt("What's your name: "),
        socket.emit('join', {username : null,
                            player_id: player_id,
                            event_id: event_id});
    });

    socket.on("playerin", function(data) {
      var element = $("<div>");
      var player =data;

      element.text(player.name).attr("id",player.id).attr("class","player").appendTo($("#jsPlayerBox > ul")).click(function(event){
      });
     $("<div>").append("<img src='/images/img_user_anonymous.gif'><div><div><h3>Name:</h3></div><div class='clear' /><div><h3>Score:</h3></div><div>").attr("class","profile_pop_box").appendTo(element);

     if(player.status == "notready" )
        $("<div>").append("...").attr("class","notready_status").appendTo(element);
     else if(player.status == "ready")
        $("<div>").append("Go!!!").attr("class","ready_status").appendTo(element);

      //list最下へScroll
      $("#jsPlayerBox").scrollTop($("#jsPlayerBox")[0].scrollHeight);
    });

    socket.on("playerout", function(data) {
      $("#jsPlayerBox > ul > div").remove(":contains('" + data.name + "')");

    });


    socket.on("status", function(data) {
      if(data.msg == "ready")
          $("#"+data.from+" .notready_status").text("Go!!!").attr("class","ready_status");
      else if(data.msg == "notready")
        $("#"+data.from+" .ready_status").text("...").attr("class","notready_status");

    });

    socket.on("currentplayer", function(data) {

      //change attr & add click Handler
      $("#"+data.id).attr("class","player me").toggle(
         function(event){
            $("#"+this.id+" .notready_status").text("Go!!!").attr("class","ready_status");
            socket.emit("status", { message: "ready" });
         }
         ,
         function(event){
            $("#"+this.id+" .ready_status").text("Ready?").attr("class","notready_status");
            socket.emit("status", { message: "notready" });
         }
      );

      //change status text
      $("#"+data.id+" .notready_status").text("Ready?");

      //save to socket
      socket.myid = data.id;


    });

    socket.on("playersupdate", function(data) {
      $("#jsPlayerBox > ul > div").remove();
      var i;
      for (i = 0; i < data.length; i++) {
          var element = $("<div>")
          var player = data[i];

          element.text(player.name).attr("id",player.id).attr("class","player").appendTo($("#jsPlayerBox > ul")).click(function(event){
          });
          $("<div>").append("<img src='/images/img_user_anonymous.gif'><div><div><h3>Name:</h3></div><div class='clear' /><div><h3>Score:</h3></div><div>").attr("class","profile_pop_box").appendTo(element);

          if(player.status == "notready" )
            $("<div>").append("...").attr("class","notready_status").appendTo(element);
          else if(player.status == "ready")
            $("<div>").append("Go!!!").attr("class","ready_status").appendTo(element);
      };
      //list最下へScroll
      $("#jsPlayerBox").scrollTop($("#jsPlayerBox")[0].scrollHeight);
    });

    socket.on("push", function(data) {

      if(data.from=="server")
        $("<p>").append(data.msg).attr("class","server_notify").appendTo($("#jsMessageBox"));
      else if(data.from==data.to)
        $("<p>").append(data.msg).attr("class","arrow_box_right").appendTo($("#jsMessageBox"));
      else
        $("<p>").append(data.msg).attr("class","arrow_box_left").appendTo($("#jsMessageBox"));

      //list最下へScroll
      $("#jsMessageBox").scrollTop($("#jsMessageBox")[0].scrollHeight);
    });

    ////Message 送信
    $("#jsMessageForm").on('submit', function() {
      var str = $("#jsMessageInput").val();
      if (str != "") {
        socket.emit("send", { message: str });
        $("#jsMessageInput").val("");
      }
      return false;
    });

  });
})(window.jQuery);
