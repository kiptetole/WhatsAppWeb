var expres = require('express')
var app = expres();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var siofu = require("socketio-file-upload");

app.use(siofu.router).use(expres.static(__dirname + '/public/'))

io.on('connection', function(socket){
  socket.on('usuario', function(usuario){

    var uploader = new siofu();
    uploader.dir = "./public/files";
    uploader.on("complete", function(e){
      io.emit('archivoEnviado', e)
    })
    uploader.listen(socket);

    console.log('a user connected');
    io.emit('conectado', usuario);
    
    if (typeof(users) === 'undefined'){
      var users = [];
    }
    users.push(usuario);
    io.emit('listado usuarios', users);

    // Entrada y envio de mensaje del chat.
    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
      
      variable = {
        nickname: usuario,
        msg: msg
      }

      io.emit('chat message', variable);
    });

    // Cuando el usuario se desconecta lo recibe y lo envia a los demas conectados.
    socket.on('disconnect', function(){
      console.log('user disconnected');
      io.emit('desconectado', usuario);
    });

    // Manda un mensaje cuando alguien esta escribiendo.
    socket.on('escribiendo', function(usuario){
      io.emit('esta escribiendo', usuario)
    });

    // Cambia el mensaje anterior para que este no aparezca.
    socket.on('no escribiendo', function(usuario){
      io.emit('sin escribir', usuario)
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});