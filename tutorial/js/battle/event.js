//======================================
// event.js
// ゲームイベント管理
// Step7-1
//======================================

//======================================
// イベント種類
//======================================

const GAME_EVENT = {

    BEFORE_PLAYER_DAMAGE:
        "beforePlayerDamage",

    BEFORE_SUMMON_DAMAGE:
        "beforeSummonDamage",

    AFTER_PLAYER_DAMAGE:
        "afterPlayerDamage",

    PLAY_CARD:
        "playCard",

    TURN_END:
        "turnEnd",

    ENEMY_PLAY_CARD:"enemyPlayCard"    

};
//======================================
// イベント発行
//======================================

function emitGameEvent(event){


    if(resistMode){

        console.log(
            "レジスト処理中 新規イベント停止",
            event.type
        );

        return;

    }


    console.log(
        "Game Event:",
        event.type,
        event
    );


    return triggerResist(event);

}
//======================================
// レジスト確認
//======================================

function triggerResist(event){

    //----------------------------------
    // 自分のターンでは使えない
    //----------------------------------

    if(
        event.player === game.currentPlayer
    ){

        return false;

    }


    //----------------------------------
    // 最終ダメージが0以下なら
    // 「ダメージを受けた」とはみなさない
    //----------------------------------

    if(
        Number(event.damage) <= 0
    ){

        console.log(
            "レジスト発動なし：最終ダメージ0",
            "damage=",
            event.damage
        );

        return false;

    }



    //----------------------------------
    // CPUがダメージを受ける場合
    //----------------------------------

    if(
        event.player === ENEMY
    ){

        console.log(
            "CPUへのレジスト判定"
        );


        //----------------------------------
        // CPUレジスト候補検索
        //----------------------------------

        const cpuResistCards =
        findCpuResistCards(event);


        //----------------------------------
        // 使用可能なレジストなし
        //----------------------------------

        if(
            cpuResistCards.length === 0
        ){

            console.log(
                "CPUレジスト使用可能カードなし"
            );

            return false;

        }


        //----------------------------------
        // イベント保存
        //----------------------------------

        currentResistEvent = event;


//----------------------------------
// CPUが使うレジストを選択
//----------------------------------

const cpuResist =
selectBestCpuResist(
    cpuResistCards,
    event.damage,
    event
);


if(!cpuResist){

    console.log(
        "CPUレジスト：使用カードを選択できません"
    );

    currentResistEvent = null;

    return false;

}


console.log(
    "CPUレジスト自動使用",
    cpuResist.name
);


        //----------------------------------
        // CPUレジスト使用
        //----------------------------------

        const result =
        useCpuResist(
            cpuResist
        );


        //----------------------------------
        // 使用成功
        //----------------------------------

        if(result){

    setTimeout(()=>{

        finishResist();

    },2000);


    return true;

}


        //----------------------------------
        // 使用失敗
        //----------------------------------

        currentResistEvent = null;

        return false;

    }


    //----------------------------------
    // プレイヤーがダメージを受ける場合
    //----------------------------------

    const resistCards =
    findResistCards(event);


    //----------------------------------
    // 発動可能カードなし
    //----------------------------------

    if(
        resistCards.length === 0
    ){

        return false;

    }


    //----------------------------------
    // 発動イベントを保存
    //----------------------------------

    currentResistEvent = event;


    //----------------------------------
    // プレイヤーのレジスト選択開始
    //----------------------------------

    showResistSelection(
        resistCards,
        event
    );


    //----------------------------------
    // ゲームを一時停止
    //----------------------------------

    return true;

}


//======================================
// 発動可能レジスト検索
//======================================
function findResistCards(event){

    //----------------------------------
    // CPUがダメージを受ける場合
    //----------------------------------

    if(event.player === ENEMY){

        return findCpuResistCards(event);

    }


    //----------------------------------
    // プレイヤーがダメージを受ける場合
    //----------------------------------

if(event.player !== PLAYER){

    return [];

}

const result = [];

    console.log(
        "レジスト判定イベント",
        event
    );



    for(const card of board.handCards){



        //----------------------------------
        // レジストのみ
        //----------------------------------

        if(card.type !== "レジスト"){

            continue;

        }



        //----------------------------------
        // このイベントで使用済み
        //----------------------------------

        if(card.usedThisEvent){

            console.log(
                card.name,
                "使用済み"
            );

            continue;

        }



        //----------------------------------
        // 発動タイミング確認
        //----------------------------------

        if(Array.isArray(card.trigger)){

            if(!card.trigger.includes(event.type)){

                continue;

            }

        }else{

            if(card.trigger !== event.type){

                continue;

            }

        }



        //----------------------------------
        // コスト支払い可能か確認
        //----------------------------------

        if(!canPayCost(card)){

            console.log(
                card.name,
                "コスト不足"
            );

            continue;

        }



        //----------------------------------
        // 個別条件確認
        //----------------------------------

        console.log(
            card.name,
            "condition =",
            card.condition
        );


        if(card.condition){

            const canUse =
            card.condition(event);


            if(!canUse){

                console.log(
                    card.name,
                    "条件不一致"
                );

                continue;

            }

        }



        //----------------------------------
        // 使用可能
        //----------------------------------

        console.log(
            card.name,
            "使用可能"
        );


        result.push(card);

    }



    console.log(
        "使用可能レジスト",
        result.map(card=>card.name)
    );



    return result;

}


//======================================
// レジスト選択表示
//======================================

function showResistSelection(

    resistCards,
    event

){

    console.log(
    "発光比較"
);

selectableResistCards.forEach(card=>{

    console.log(
        card.name,
        "selectable",
        card === board.handCards.find(
            c=>c.id === card.id
        )
    );

});





    console.log(
        "resistMode ON"
    );


    //----------------------------------
    // レジスト状態開始
    //----------------------------------

    resistMode = true;

    //---------------------------------
    // 行動案内
    //----------------------------------

    showActionGuide(
        "レジストをプレイしますか？"
    );

    //----------------------------------
    // 現在処理中イベント保存
    //----------------------------------

    currentResistEvent = event;


    //----------------------------------
    // 選択可能レジスト保存
    //----------------------------------
    selectableResistCards = resistCards;

    updateHandHighlight();
    console.log(
    "レジスト発光対象",
    selectableResistCards.map(c=>c.name)
);


    console.log(
        "======== レジスト ========"
    );


    console.log(
        "イベント：",
        event.type
    );


    console.log(
        "使用可能枚数：",
        resistCards.length
    );


    for(const card of resistCards){

        console.log(
            "・",
            card.name
        );

    }



    //----------------------------------
    // レジスト選択開始
    //----------------------------------

    startResistSelection();



    //----------------------------------
    // ボタン更新
    //----------------------------------

    updateButtons();


    //----------------------------------
// レジスト発光復帰
//----------------------------------

selectableResistCards.forEach(card=>{

    card.setHighlight(true);

});




}

//======================================
// レジスト選択開始
//======================================

function startResistSelection(){


    if(!resistMode){

        return;

    }


    console.log(
        "レジスト選択開始"
    );


    //----------------------------------
    // レジスト発光
    //----------------------------------

    board.handCards.forEach(card=>{

        card.setHighlight(false);

    });


    selectableResistCards.forEach(card=>{

        card.setHighlight(true);

    });



    console.log(
        "レジスト発光完了",
        selectableResistCards.map(c=>c.name)
    );

}