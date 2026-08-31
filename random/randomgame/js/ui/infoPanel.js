//======================================
// CPU手札表示更新
//======================================

function updateEnemyHandDisplay(){

    //----------------------------------
    // 手札表示
    //----------------------------------

    const cardArea =
        document.getElementById(
            "enemy-hand-cards"
        );


    const countArea =
        document.getElementById(
            "enemy-hand-count"
        );


    if(
        !cardArea ||
        !countArea
    ){

        return;

    }


    //----------------------------------
    // 一度クリア
    //----------------------------------

    cardArea.innerHTML = "";


    //----------------------------------
    // 手札の裏面カードを生成
    //----------------------------------

    enemyHandCards.forEach(
        () => {

            const card =
                document.createElement(
                    "img"
                );


            card.className =
                "enemy-hand-card";


            card.src =
                "../../images/ui/card-back.png";


            card.alt =
                "CPU手札";


            cardArea.appendChild(
                card
            );

        }
    );


    //----------------------------------
    // 枚数表示
    //----------------------------------

    countArea.textContent =
        `手札×${enemyHandCards.length}`;

}