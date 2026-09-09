const player = {

    name: "プレイヤー",

    hp: 5,

    maxHp: 5,

    icon: "images/ui/player-icon.png"

};

const enemy = {

    name: "相手",

    hp: 5,

    maxHp: 5,

    icon: "images/ui/enemy-icon.png"

};


function updatePlayerIcons(){

    document.getElementById("player-icon").src =
        player.icon;

    document.getElementById("enemy-player-icon").src =
        enemy.icon;

}