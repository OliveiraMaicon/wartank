var gameEngine = {
    "init" : function () {
        var canvas = document.getElementById('canvas');
        if(canvas && "WebSocket" in window){
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;
            var context = canvas.getContext("2d");
            var socket = new WebSocket("ws://127.0.0.1:1414");
            gameEngine.onload(canvas, context, socket);
        }
        else{
            console.log("Seu navegador não suporta WebSocket");
        }
    },

    "onload" : function (canvas, context, socket) {

        socket.onopen = function()
        {
            // Web Socket is connected, send data using send()
            console.log("Connection is opened...");
            socket.send("Any Message");
            console.log("Message is sent...");
        };

        socket.onmessage = function (evt)
        {
            console.log("Message is received!");
            console.log("MESSAGE: " + evt.data);
        };

        socket.onclose = function()
        {
            // websocket is closed.
            console.log("Connection is closed...");
        };

        var blockSize = 30;

        var player = {
            x:blockSize * 1,
            y:blockSize * 1,
            width:blockSize/1.5,
            height:blockSize/1.5,
            angle: 0,
            color: "#33bb99",
            texture: "/static/file/tank.png",
            live: true
        };

        var playerShot = {
            action: false,
            x:0,
            y:0,
            width:blockSize/10,
            height:blockSize/10,
            angle:0,
            color: "#cc6666",
        };

        var enemy = {
            x:blockSize * 3,
            y:blockSize * 3,
            width:blockSize/1.5,
            height:blockSize/1.5,
            angle: 270,
            color: "#33bb99",
            texture: "/static/file/tank.png",
            live: true
        };

        var enemyShot = {
            action: false,
            x:0,
            y:0,
            width:blockSize/10,
            height:blockSize/10,
            angle:0,
            color: "#cc6666",
        };

        var imageObj = new Image();
        imageObj.src = player.texture;

        var imageBlock = new Image();
        imageBlock.src = "/static/file/block.png";

        var velocity = blockSize/ 10;

        var lvl01 = [
            "bbbbbbbbbbbbbbbbbbbb",
            "b000b00000000000000b",
            "bbbbbbb0bbbbbbbbbb0b",
            "b000000000000000000b",
            "bbb0bbbbb0bb0bbbbbbb",
            "b000000000000000000b",
            "b0bbbbbbbbbbbbbb0b0b",
            "b000000000000000000b",
            "bbbbbbbbb0bbbbbbb0bb",
            "b000000000000000000b",
            "b0b0bbbbbbbbbbbbbb0b",
            "b000000000000000000b",
            "bbb0bbbbb0bbbbbbbbbb",
            "b000000000000000000b",
            "bbbbbbbbb0bbbbbb0bbb",
            "b000000000000000000b",
            "bbbbbbbbb0bbbbbbbbbb",
            "b000000000000000000b",
            "bbbbbbbbbbbbbbbbbbbb"
        ];

        var objTList = [];

        for(var i = 0; i < lvl01.length; i++){
            for(var j = 0; j < lvl01[i].length; j++){
                if(lvl01[i][j] == 'b'){
                    var objTmp = { x:j*blockSize, y:i*blockSize, width:blockSize, height:blockSize, color: "#00ff00"};
                    objTList.push(objTmp);
                }

            }
        };


        var playerAction = {
            "left":false,
            "up":false,
            "right":false,
            "down":false,
            "fire":false
        };

        function keyDownEvent (e) {
            var keyCode = e.keyCode;

            if(keyCode == 37){
                playerAction.left = true;
            }
            if(keyCode == 38){
                playerAction.up = true;
            }
            if(keyCode == 39){
                playerAction.right = true;
            }
            if(keyCode == 40){
                playerAction.down = true;
            }
            if(keyCode == 32){
                playerAction.fire = true;
            }
        };

        function keyUpEvent (e) {
            var keyCode = e.keyCode;

            if(keyCode == 37){
                playerAction.left = false;
            }
            if(keyCode == 38){
                playerAction.up = false;
            }
            if(keyCode == 39){
                playerAction.right = false;
            }
            if(keyCode == 40){
                playerAction.down = false;
            }
            if(keyCode == 32){
                playerAction.fire = false;
            }
        };

        function collisionObjects(obj1, obj2){
            if (obj1.x < obj2.x + obj2.width && obj1.x + obj1.width > obj2.x && obj1.y < obj2.y + obj2.height && obj1.height + obj1.y > obj2.y) {
                return true;
            }
            return false;
        };

        var getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };

        //CHANGE LEVEL BRIGHTNESS COLOR ( -0.9 to 0.9 )
        var colorLuminance = function(hex, lum) {
            hex = String(hex).replace(/[^0-9a-f]/gi, '');
            if (hex.length < 6) {
                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            }
            lum = lum || 0;
            var rgb = "#", c, i;
            for (i = 0; i < 3; i++) {
                c = parseInt(hex.substr(i*2,2), 16);
                c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
                rgb += ("00"+c).substr(c.length);
            }
            return rgb;
        };

        //CLONE OBJECTS IN MEMORY
        var cloneObj = function(obj) {
            if(obj == null || typeof(obj) != 'object')
                return obj;

            var temp = obj.constructor();

            for(var key in obj) {
                if(obj.hasOwnProperty(key)) {
                    temp[key] = cloneObj(obj[key]);
                }
            }
            return temp;
        };

        var TO_RADIANS = Math.PI/180;
        function drawRotatedImage(image, x, y, angle) {
            context.save();
            context.translate(x, y);
            context.rotate(angle * TO_RADIANS);
            context.drawImage(image, -(image.width/2), -(image.height/2));
            context.restore();
        };

        document.addEventListener("keydown", keyDownEvent, false);
        document.addEventListener("keyup", keyUpEvent, false);


        var gameController = {
            //GAME UPDATE
            "update" : function () {

                var playerTmp = cloneObj(player);

                if(playerAction.left){
                    player.x -= velocity;
                    player.angle = 270;
                }
                if(playerAction.up){
                    player.y -= velocity;
                    player.angle = 0;
                }
                if(playerAction.right){
                    player.x += velocity;
                    player.angle = 90;
                }
                if(playerAction.down){
                    player.y += velocity;
                    player.angle = 180;
                }

                if(playerAction.fire){
                    if(!playerShot.action){
                        playerShot.action = true;
                        playerShot.x = player.x + (player.width / 2) - (playerShot.width / 2);
                        playerShot.y = player.y + (player.height / 2) - (playerShot.height / 2);
                        playerShot.angle = player.angle;
                    }
                }

                if(player.x > canvas.width){
                    player.x = canvas.width
                }else if(player.x < 0){
                    player.x = 0;
                }

                if(player.y + player.height > canvas.height){
                    player.y = canvas.height - player.height
                }else if(player.y < 0){
                    player.y = 0;
                }

                if(playerShot.action){
                    if(playerShot.angle == 90){
                        playerShot.x += velocity * 3;
                    } else if(playerShot.angle == 0){
                        playerShot.y -= velocity * 3;
                    } else if(playerShot.angle == 270){
                        playerShot.x -= velocity * 3;
                    } else if(playerShot.angle == 180){
                        playerShot.y += velocity * 3;
                    }
                }

                for(var i = 0; i < objTList.length; i++){
                    if(collisionObjects(playerShot, objTList[i])) {
                        playerShot.action = false;
                    }
                }

                if(!enemyShot.action){
                    enemyShot.action = true;
                    enemyShot.x = enemy.x + (enemy.width / 2) - (enemyShot.width / 2);
                    enemyShot.y = enemy.y + (enemy.height / 2) - (enemyShot.height / 2);
                    enemyShot.angle = enemy.angle;
                }else{
                    if(enemyShot.angle == 90){
                        enemyShot.x += velocity * 3;
                    } else if(enemyShot.angle == 0){
                        enemyShot.y -= velocity * 3;
                    } else if(enemyShot.angle == 270){
                        enemyShot.x -= velocity * 3;
                    } else if(enemyShot.angle == 180){
                        enemyShot.y += velocity * 3;
                    }
                }

                for(var i = 0; i < objTList.length; i++){
                    if(collisionObjects(enemyShot, objTList[i])) {
                        enemyShot.action = false;
                    }
                }


                if(collisionObjects(enemyShot, player)) {
                    player.live = false;
                    console.log("Você morreu");
                    clearInterval(gameLoop);
                    gameEngine.init();
                }

                if(collisionObjects(playerShot, enemy)) {
                    enemy.live = false;
                    console.log("Você ganhou");
                    clearInterval(gameLoop);
                    gameEngine.init();

                }

                var isColliding = false;

                for(var i = 0; i < objTList.length; i++){
                    if(collisionObjects(player, objTList[i])) {
                        isColliding = true;
                    }
                }

                if(!isColliding){
                    gameController.draw();
                }else{
                    player = playerTmp;
                    gameController.draw();
                }


            },
            //GAME DRAW
            "draw" : function () {
                context.clearRect ( 0 , 0 , canvas.width, canvas.height );

                context.fillStyle = "#555555";
                for(var i = 0; i < objTList.length; i++){
                    context.fillRect(objTList[i].x, objTList[i].y, objTList[i].width, objTList[i].height);
                    drawRotatedImage(imageBlock, objTList[i].x + (objTList[i].width / 2), objTList[i].y + (objTList[i].height / 2), 0);
                }

                if(playerShot.action){
                    context.fillStyle = playerShot.color;
                    context.fillRect(playerShot.x, playerShot.y, playerShot.width, playerShot.height);
                }
                context.fillStyle = player.color;
                context.fillRect(player.x, player.y, player.width, player.height);
                drawRotatedImage(imageObj, player.x + (player.width / 2), player.y + (player.height / 2), player.angle);

                if(enemyShot.action){
                    context.fillStyle = enemyShot.color;
                    context.fillRect(enemyShot.x, enemyShot.y, enemyShot.width, enemyShot.height);
                }
                context.fillStyle = enemy.color;
                context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                drawRotatedImage(imageObj, enemy.x + (enemy.width / 2), enemy.y + (enemy.height / 2), enemy.angle);
            }
        };

        var gameLoop = setInterval(gameController.update , 50);
    }
};

window.addEventListener("load", gameEngine.init, false);