
//==================================================
// カード効果発動
//==================================================

function activateCardEffect(card,target){

    if(!card.effect){

        return;

    }

    switch(card.effect.type){

case "damage":


console.log(
    "===== マギアダメージ処理 =====",
    "card=",
    card.name,
    "type=",
    card.type,
    "element=",
    card.element,
    "owner=",
    card.owner,
    "baseDamage=",
    card.effect.value
);


    //----------------------------------
    // 基本ダメージ
    //----------------------------------

    let damage =
        card.effect.value;


    //----------------------------------
    // 火属性マギアか確認
    //----------------------------------

    if(
        card.type === "マギア" &&
        card.elementType === "火"
    ){

        //----------------------------------
        // 使用者の場を取得
        //----------------------------------

        const field =
            card.owner === ENEMY
                ? enemyField
                : playerField;


        //----------------------------------
        // ウィルオウィスプによる
        // 火マギアダメージ上昇
        //----------------------------------

        field.forEach(summon => {

            if(
                !summon ||
                !summon.card ||
                !summon.card.ability
            ){

                return;

            }


            const ability =
                summon.card.ability;


            if(
                ability.type ===
                "fireMagiaDamageUp"
            ){

                damage +=
                    ability.value;


                console.log(
                    "火マギアダメージ上昇",
                    summon.card.name,
                    "+",
                    ability.value
                );

            }

        });

    }


    console.log(
        "最終マギアダメージ",
        card.name,
        damage
    );


    //----------------------------------
    // プレイヤーへのダメージ
    //----------------------------------

    if(
        target === PLAYER ||
        target === ENEMY
    ){

        damagePlayer(
            target,
            damage,
            false,
            card
        );

    }


    //----------------------------------
    // サモンへのダメージ
    //----------------------------------

    else if(target){

        dealDamage(
            target,
            damage,
            card
        );

    }


    break;

        case "addHand":

            addHandCard(
                card.effect.card
            );

            break;

        case "summon":

            summonCard(
                card.effect.card
            );

            break;

        case "play":

            playCard(
                card.effect.card
            );

            break;

        case "damageUp":

            addTemporaryDamage(
                target,
                card.effect.value
            );

            break;

        case "powerUp":

            addTemporaryPower(
                target,
                card.effect.value
            );

            break;

        //----------------------------------
        // サモンをヨコ向きにする
        //----------------------------------

        case "horizontal":

            if(target){

                target.view.setHorizontal(
                    true
                );
                target.isRest = true;

            }

            break;


        case "returnToHand": 
        board.removeCoolCard(
 
            target, 
            PLAYER 
        );
 
        target.setFaceDown(false);
        target.area = "hand";  
        board.addHandCard(  
            target 
        );
  
        break;


        case "attackReady":

        target.attackReady = true;

        console.log(
            "このターン攻撃可能",
            target.card.name
        );

        break;

        case "forceCost":
        startForceCostSelect(  
            target  
        );
  
        break;

    }

}

//======================================
// ダメージ数字表示
//======================================

function showDamageNumber(target, damage){


    if(!target || !target.view){

        return;

    }


    const element =
        target.view.getElement();



    if(!element){

        return;

    }


    const rect =
        element.getBoundingClientRect();



    const number =
        document.createElement("div");


    number.className =
        "damage-number";


    number.textContent =
        damage;



    number.style.left =
        (
            rect.left +
            rect.width / 2
        )
        + "px";


    number.style.top =
        rect.top
        + "px";


    document.body.appendChild(number);



    setTimeout(()=>{

        number.remove();

    },800);

}

//======================================
// プレイヤーダメージ表示
//======================================

function showPlayerDamageNumber(target, damage){


    const icon =
        document.getElementById(
            target === "enemy"
            ? "enemy-player-icon"
            : "player-icon"
        );


    if(!icon){

        console.log(
            "プレイヤーアイコンなし"
        );

        return;

    }



    const rect =
        icon.getBoundingClientRect();



    const number =
        document.createElement("div");



    number.className =
        "damage-number";


    number.textContent =
        damage;



    number.style.left =
        (
            rect.left +
            rect.width / 2
        )
        + "px";


    number.style.top =
        rect.top
        + "px";



    document.body.appendChild(number);



    setTimeout(()=>{

        number.remove();

    },1500);


}


//======================================
// カード使用可能判定
//======================================

function canUseCard(card){

    //----------------------------------
    // 相手ターン
    //----------------------------------

    if(game.currentPlayer !== PLAYER){

        // レジスト以外は使用不可
        if(card.type !== "レジスト"){

            return false;

        }

    }

    //----------------------------------
    // サモン
    //----------------------------------

    if(card.type === "サモン"){


        // 1ターン1体制限

        if(summonUsedThisTurn){

            return false;

        }


        // コスト確認

        if(!canPayCost(card)){

            return false;

        }


        return true;

    }



    //----------------------------------
    // マギア
    //----------------------------------

    if(card.type === "マギア"){


        // 対象確認

        if(!hasMagiaTarget(card)){

            return false;

        }


        // コスト確認

        if(!canPayCost(card)){

            return false;

        }


        return true;

    }



//----------------------------------
// レジスト
//----------------------------------

if(card.type === "レジスト"){


    if(!canUseResist(card)){

        return false;

    }


    if(!canPayCost(card)){

        return false;

    }


    return true;

}


    return false;

}

//======================================
// 手札使用可能発光
//======================================

function updateHandHighlight(){
        console.log(
        "updateHandHighlight",
        "resistMode=",
        resistMode,
        "selectable=",
        selectableResistCards.map(c=>c.name)
    );


    //----------------------------------
    // レジスト選択中
    //----------------------------------

    if(resistMode){

        board.handCards.forEach(card=>{

            card.setHighlight(false);

        });


        selectableResistCards.forEach(card=>{

            card.setHighlight(true);

        });


        return;

    }



    //----------------------------------
    // 全解除
    //----------------------------------

    board.handCards.forEach(card=>{

        card.setHighlight(false);

    });



    //----------------------------------
    // レジスト選択中
    //----------------------------------

    if(resistMode){

        selectableResistCards.forEach(card=>{

            card.setHighlight(true);

        });


        return;

    }



    //----------------------------------
    // 通常使用可能カード
    //----------------------------------

    board.handCards.forEach(card=>{


        if(canUseCard(card)){

            card.setHighlight(true);

        }

    });

}

//======================================
// マギア対象存在判定
//======================================

function hasMagiaTarget(card){


    if(!card.effect){

        return false;

    }


    const targets =
    card.effect.target;


    //----------------------------------
    // 対象なし
    //----------------------------------

    if(!targets || targets.length === 0){

        return true;

    }



    //----------------------------------
    // 敵サモン対象
    //----------------------------------

    if(
        targets.includes("enemySummon")
    ){

        if(enemyField.length > 0){

            return true;

        }

    }



    //----------------------------------
    // 敵プレイヤー対象
    //----------------------------------

    if(
        targets.includes("enemy")
    ){

        return true;

    }



    //----------------------------------
    // 自分サモン対象
    //----------------------------------

    if(
        targets.includes("selfSummon")
    ){

        if(playerField.length > 0){

            return true;

        }

    }



    //----------------------------------
    // 自分対象
    //----------------------------------

    if(
        targets.includes("self")
    ){

        return true;

    }


    return false;

}


//======================================
// レジスト使用可能判定
//======================================

function canUseResist(card){


    //----------------------------------
    // 発動イベントなし
    //----------------------------------

    if(!currentResistEvent){

        return false;

    }


    //----------------------------------
    // 発動可能カード検索
    //----------------------------------

    const resistCards =
    findResistCards(
        currentResistEvent
    );


    //----------------------------------
    // 対象カードか
    //----------------------------------

    return resistCards.includes(card);


}

//======================================
// サモン行動可能判定
//======================================

function canActionSummon(summon){


    //----------------------------------
    // 自分の場のみ
    //----------------------------------

    if(summon.owner !== PLAYER){

        return false;

    }


    //----------------------------------
    // 攻撃可能
    //----------------------------------

    if(
        summon.attackReady &&
        !summon.isRest
    ){

        return true;

    }


    return false;

}

function addPower(target, value){

    if(!target){
        return;
    }


    console.log(
        "パワー変化",
        target.card.name,
        value
    );


    target.powerBonus += value;


    // 表示更新
    if(target.view){

        target.view.refresh();

    }

}


function resetTemporaryPower(owner){

    const field =
    owner === PLAYER
    ? playerField
    : enemyField;


    field.forEach(summon=>{


        //----------------------------------
        // パワー補正解除
        //----------------------------------

        summon.powerBonus = 0;


        //----------------------------------
        // ダメージ補正解除
        //----------------------------------

        summon.damageBonus = 0;


        //----------------------------------
        // 表示更新
        //----------------------------------

        summon.view.updateCurrentPower(
            summon
        );


        console.log(
            "一時効果解除",
            summon.card.name
        );


    });

}

//======================================
// サモンが場を離れるときの一時効果解除
//======================================

function clearSummonTemporaryEffects(summon){

    if(!summon){

        return;

    }


    //----------------------------------
    // パワー強化
    //----------------------------------

    summon.powerBonus = 0;


    //----------------------------------
    // ダメージ強化
    //----------------------------------

    summon.damageBonus = 0;


    console.log(
        "場を離れるため一時強化解除",
        summon.card?.name
    );

}