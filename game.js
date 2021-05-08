var canvas;
var ctx;
var interval;
var food;
var started;

var smooth;
var walls;
var inputbuffer;
var relativ;
var height;
var width;
var thicc;

var startPos;
var startLen;
var fieldSize = 20;





function Setup()
{
    // smooth auslesen
    smooth = document.getElementById("smooth").checked;

    // walls auslesen
    walls = document.getElementById("walls").checked;

    // Relativ/Absolut auslesen
    var perspective = document.getElementsByName("perspective");

    for(let i = 0; i < perspective.length; i++)
    {
        if(perspective[i].checked == true)
        {
            // unterschiedlicher Umgang mit Richtungen
            if (perspective[i].value == "absolut")
            {
                relativ = false;
            }
            else if (perspective[i].value == "relativ")
            {
                relativ = true;
            }

        }
    }

    // Größe auslesen
    var widthEntry = document.getElementById("sizeX");
    width = parseInt(widthEntry.value);
    var heightEntry = document.getElementById("sizeY");
    height = parseInt(heightEntry.value);

    // Thiccness auslesen
    var thiccEntry = document.getElementById("thicc");
    thicc = parseInt(thiccEntry.value);


    // Startposition relativ zur Größe berechnen
    startPos = {x: Math.floor(width / 5), y: Math.floor(height / 2)};

    // Startlänge
    startLen = 2;


    HideMenu();


    // KeyListener setzen
    document.addEventListener('keydown', Handler);

    // Canvas festlegen
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = width * fieldSize;
    canvas.height = height * fieldSize;

    Start();
}

function Start()
{
    // canvas clearen
    ctx.clearRect(0, 0, width * fieldSize, height * fieldSize);

    // Beim ersten Tastendruck noch nicht starten
    started = false;


    // Schlange am Anfang
    snake = [];

    
    // Inputbuffer
    inputbuffer = [];

    //NewBox('white', startPos, thicc);
    for (let i = 0; i < startLen; i++)
    {
        let coord = {x: startPos.x + i, y: startPos.y, d: 'r', temp: false};
        DrawFront(coord);
    }

    // Erstes Essen
    GenerateFood();
}


function ShowMenu()
{
    // Intervall unterbrechen
    clearInterval(interval);

    // Menuelemente anzeigen
    var menu = document.getElementById("Menu");
    menu.style.display = "block";

    // Spielelemente entfernen
    var game = document.getElementById("Game");
    game.style.display = "none";
}

function HideMenu()
{
    // Menuelemente entfernen
    var menu = document.getElementById("Menu");
    menu.style.display = "none";

    // Spielelemente anzeigen
    var game = document.getElementById("Game");
    game.style.display = "block";
}


function Loop() 
{
    // Variable für die zu berechnende Koordinate
    let newCoord;

    let newDirection;

    if (inputbuffer.length == 0)
    {
        newDirection = snake[0].d;
    } else
    {
        newDirection = inputbuffer.pop();
    }
    
    // Neue Position => Richtungen l-left, r-right, u-up, d-down
    switch (newDirection)
    {
        case 'l': 
            newCoord = {x: snake[0].x - 1, y: snake[0].y, d: 'l', temp: false};
            break;
        case 'u':
            newCoord = {x: snake[0].x, y: snake[0].y - 1, d: 'u', temp: false};
            break;
        case 'r':
            newCoord = {x: snake[0].x + 1, y: snake[0].y, d: 'r', temp: false};
            break;
        case 'd':
            newCoord = {x: snake[0].x, y: snake[0].y + 1, d: 'd', temp: false};
            break;
    }
    
    

    if (newCoord.x == food.x && newCoord.y == food.y)
    {
        // Wenn Essen aufgenommen wird, das Ende der Schlange nicht wegmachen
        DrawFront(newCoord);
        // Neues Essen generieren
        GenerateFood();
    } else if (OnSnake(newCoord))
    {
        // Wenn Schlange getroffen wird, Intervall stoppen, alert senden und neu starten
        DrawFront(newCoord);
        clearInterval(interval);
        setTimeout(function(){  alert("Game Over");
                                Start(); }, 300);
    } else if (OutOfBounds(newCoord))
    {
        

        if (walls)
        {
            // Wenn Rand getroffen wird, Intervall stoppen, alert senden und neu starten
            DrawFront(newCoord);
            clearInterval(interval);
            setTimeout(function(){  alert("Game Over");
                                    Start(); }, 300);
        } else
        {
            tempOut = {x: newCoord.x, y: newCoord.y, d: newCoord.d, temp: true};
            DrawFront(tempOut);

            
            // Loop back around
            if (newCoord.x < 0)
            {
                newCoord.x = width - 1;
            } else if (newCoord.x > (width - 1))
            {
                newCoord.x = 0;
            } else if (newCoord.y < 0)
            {
                newCoord.y = height - 1;
            } else if (newCoord.y > (height - 1))
            {
                newCoord.y = 0;
            }

            // normal weiter
            EraseBack(snake.pop());
            DrawFront(newCoord);
            
        }
    } else 
    {
        // normaler Fall
        EraseBack(snake.pop());
        DrawFront(newCoord);
    }
    

}

function Handler(event) {
    // Anfänglicher Tastendruck startet die Schleife
    if (!started)
    {
        clearInterval(interval);
        interval = window.setInterval(Loop, 150);
        started = true;
        return;
    }
    
    // Wenn im Buffer was drin ist, mit dem letzten Buffer, sonst mit snake[0] vergleichen
    let direction;
    if (inputbuffer.length > 0)
    {
        direction = inputbuffer[0];
    } else
    {
        direction = snake[0].d;
    }
    
    if (relativ)
    {
        if(event.keyCode === 37) 
        {
            // Pfeil nach links

            
            // entsprechende relative Richtung zum Buffer hinzufügen
            switch (direction)
            {
                case 'l': 
                    inputbuffer.unshift('d');
                    break;
                case 'u':
                    inputbuffer.unshift('l');
                    break;
                case 'r':
                    inputbuffer.unshift('u');
                    break;
                case 'd':
                    inputbuffer.unshift('r');
                    break;
            }
            

        } else if(event.keyCode === 39) 
        {
            // Pfeil nach rechts

            // entsprechende relative Richtung zum Buffer hinzufügen
            switch (direction)
            {
                case 'l': 
                    inputbuffer.unshift('u');
                    break;
                case 'u':
                    inputbuffer.unshift('r');
                    break;
                case 'r':
                    inputbuffer.unshift('d');
                    break;
                case 'd':
                    inputbuffer.unshift('l');
                    break;
            }
        }
    } else
    {
        // Richtungsänderung, nur wenn es nicht die entgegengesetzte oder die gleiche ist
        if (event.keyCode === 65 && direction != 'r' && direction != 'l')
        {
            inputbuffer.unshift('l');
        } else if(event.keyCode === 68 && direction != 'l' && direction != 'r') 
        {
            inputbuffer.unshift('r');
        } else if(event.keyCode === 83 && direction != 'u' && direction != 'd') 
        {
            inputbuffer.unshift('d');
        } else if(event.keyCode === 87 && direction != 'd' && direction != 'u') 
        {
            inputbuffer.unshift('u');
        }
    }
    
}





function GenerateFood()
{
    // so lange neue Positionen generieren, bis es auf einem freien Feld ist
    do {
        let randX = Math.floor(Math.random() * width);
        let randY = Math.floor(Math.random() * height);
        food = {x: randX, y: randY};
    }
    while (OnSnake(food));

    // Essen anzeigen
    let size = thicc + 2;
    if (size > (fieldSize / 2))
    {
        size = (fieldSize / 2);
    }

    ctx.fillStyle = 'blue';
    ctx.fillRect((food.x * fieldSize) + (0.5 * fieldSize) - size, (food.y * fieldSize) + (0.5 * fieldSize) - size, size * 2, size * 2);
}



function OnSnake(pCoord)
{   
    // Überprüfen, ob eine Koordinate auf der Schlange ist
    return snake.some(coord => coord.x === pCoord.x && coord.y === pCoord.y);
}

function OutOfBounds(coord)
{
    // Überprüfen, ob Koordinate außerhalb des Spielbereiches ist
    return (coord.x < 0 || coord.x > (width - 1) || coord.y < 0 || coord.y > (height - 1));
}

function DrawFront(coord)
{
    // Alles davor wegmachen
    ctx.clearRect(coord.x * fieldSize, coord.y * fieldSize, fieldSize, fieldSize);

    ctx.fillStyle = 'white';

    if (smooth)
    {
        
        // abhängig von der aktuellen Richtung Schlangenteil malen
        switch (coord.d)
        {
            case 'l': 
                ctx.fillRect((coord.x * fieldSize) + (0.5 * fieldSize) - thicc, (coord.y * fieldSize)  + (0.5 * fieldSize) - thicc, fieldSize, thicc * 2);
                break;
            case 'u':
                ctx.fillRect((coord.x * fieldSize) + (0.5 * fieldSize) - thicc, (coord.y * fieldSize)  + (0.5 * fieldSize) - thicc, thicc * 2, fieldSize);
                break;
            case 'r':
                ctx.fillRect((coord.x * fieldSize) - (0.5 * fieldSize) + thicc, (coord.y * fieldSize)  + (0.5 * fieldSize) - thicc, fieldSize, thicc * 2);
                break;
            case 'd':
                ctx.fillRect((coord.x * fieldSize) + (0.5 * fieldSize) - thicc, (coord.y * fieldSize)  - (0.5 * fieldSize) + thicc, thicc * 2, fieldSize);
                break;
        }

    } else
    {
        ctx.fillRect((coord.x * fieldSize) + (0.5 * fieldSize) - thicc, (coord.y * fieldSize)  + (0.5 * fieldSize) - thicc, thicc * 2, thicc * 2);
    }

    
    
    snake.unshift(coord);
    
    
}

function EraseBack(coord)
{

    if (smooth)
    {
        
        switch (coord.d)
        {
            case 'l': 
                ctx.clearRect((coord.x * fieldSize) + (0.5 * fieldSize) - thicc, (coord.y * fieldSize)  + (0.5 * fieldSize) - thicc, fieldSize, thicc * 2);
                break;
            case 'u':
                ctx.clearRect((coord.x * fieldSize) + (0.5 * fieldSize) - thicc, (coord.y * fieldSize)  + (0.5 * fieldSize) - thicc, thicc * 2, fieldSize);
                break;
            case 'r':
                ctx.clearRect((coord.x * fieldSize) - (0.5 * fieldSize) + thicc, (coord.y * fieldSize)  + (0.5 * fieldSize) - thicc, fieldSize, thicc * 2);
                break;
            case 'd':
                ctx.clearRect((coord.x * fieldSize) + (0.5 * fieldSize) - thicc, (coord.y * fieldSize)  - (0.5 * fieldSize) + thicc, thicc * 2, fieldSize);
                break;
        }

               

    } else
    {
        ctx.clearRect((coord.x * fieldSize) + (0.5 * fieldSize) - thicc, (coord.y * fieldSize)  + (0.5 * fieldSize) - thicc, thicc * 2, thicc * 2);
    }

    if (coord.temp)
    {
        EraseBack(snake.pop());
    }
}