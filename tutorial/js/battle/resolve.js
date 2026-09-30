//======================================
// バジリスク：バトル相手
//======================================

let basiliskBattleTarget = null;

//======================================
// バジリスク：バトル相手を記録
//======================================

function setBasiliskBattleTarget(
    attacker,
    defender
){

    //----------------------------------
    // 攻撃側がバジリスク
    //----------------------------------

    if(
        attacker?.card?.ability?.type ===
        "coolAfterBattle"
    ){

        basiliskBattleTarget =
            defender;

        console.log(
            "バジリスク：攻撃側として戦闘相手を記録",
            defender?.card?.name
        );

        return;
    }


    //----------------------------------
    // 防御側がバジリスク
    //----------------------------------

    if(
        defender?.card?.ability?.type ===
        "coolAfterBattle"
    ){

        basiliskBattleTarget =
            attacker;

        console.log(
            "バジリスク：防御側として戦闘相手を記録",
            attacker?.card?.name
        );

        return;
    }

}


//==================================================
// resolve.js
// ダメージ・撃破解決
//==================================================

function resolveBattle(){

    //----------------------------------
    // バトルによる破壊判定
    //----------------------------------

    resolveDestroy();


    //----------------------------------
    // 破壊されたサモンをクールへ
    //----------------------------------

    removeDestroyedSummons();


    //----------------------------------
    // バジリスク能力
    //----------------------------------

    resolveBasiliskBattle();


    //----------------------------------
    // ダメージリセット
    //----------------------------------

    clearDamage();

}

function resolveDestroy(){

    const fields = [

        playerField,

        enemyField

    ];


    for(const field of fields){

        for(const summon of field){

            console.log(
                summon.card.name,
                "damage",
                summon.damage,
                "power",
                getPower(summon)
            );


            if(

                summon.damage >=
                getPower(summon)

            ){

                summon.destroyed = true;


                //----------------------------------
                // バトルログ
                //----------------------------------

                const owner =
                    summon.owner === PLAYER
                    ?
                    "PLAYER"
                    :
                    "CPU";


                addBattleLog(
                    `${owner}：${summon.card.name}が破壊された`
                );

            }

        }

    }

}

function removeDestroyedSummons(){

    removeDestroyedFromField(
        playerField
    );

    removeDestroyedFromField(
        enemyField
    );

}
function removeDestroyedFromField(field){

    for(

        let i = field.length - 1;

        i >= 0;

        i--

    ){

        const summon = field[i];


        if(summon.destroyed){

            //----------------------------------
            // クールゾーンへ送る前に状態リセット
            //----------------------------------

            resetSummonState(
                summon
            );


            //----------------------------------
            // クールゾーンへ送る
            //----------------------------------

            if(board){

                board.addCoolCard(
                    summon.card,
                    summon.owner
                );

                refreshCoolModal();

            }


            //----------------------------------
            // 表示用カードも削除
            //----------------------------------

            if(board){

                if(summon.owner === PLAYER){

                    board.removePlayerCard(
                        summon.view
                    );

                }
                else{

                    board.removeEnemyCard(
                        summon.view
                    );

                }

            }


            //----------------------------------
            // 戦闘データから削除
            //----------------------------------

            field.splice(
                i,
                1
            );


            //----------------------------------
            // プレイヤー側の場が変化したので
            // 手札コスト表示を更新
            //----------------------------------

            if(
                summon.owner === PLAYER
            ){

                updateHandCostDisplay();

            }

        }

    }

}

function clearDamage(){

    const fields = [

        playerField,

        enemyField

    ];

    for(const field of fields){

        for(const summon of field){

            summon.damage = 0;

        }

    }

}

//======================================
// バジリスク：バトル後効果
//======================================

function resolveBasiliskBattle(){

    if(
        !basiliskBattleTarget
    ){

        return;

    }


    const target =
        basiliskBattleTarget;


    //----------------------------------
    // すでに破壊されている場合
    //----------------------------------

    if(
        target.destroyed
    ){

        basiliskBattleTarget = null;

        return;

    }


    //----------------------------------
    // まだ場に存在するか確認
    //----------------------------------

    const field =
        target.owner === PLAYER
        ?
        playerField
        :
        enemyField;


    if(
        !field.includes(target)
    ){

        basiliskBattleTarget = null;

        return;

    }


    //----------------------------------
    // クールゾーンへ
    //----------------------------------

    console.log(
        "バジリスク能力発動",
        target.card.name,
        "→ クールゾーン"
    );

    //----------------------------------
// バトルログ
//----------------------------------

const owner =
    target.owner === PLAYER
    ?
    "PLAYER"
    :
    "CPU";


addBattleLog(
    `${owner}：${target.card.name}が破壊された`
);


    resetSummonState(
        target
    );


    board.addCoolCard(
        target.card,
        target.owner
    );


    refreshCoolModal();


    //----------------------------------
    // 表示から削除
    //----------------------------------

    if(
        target.owner === PLAYER
    ){

        board.removePlayerCard(
            target.view
        );

    }
    else{

        board.removeEnemyCard(
            target.view
        );

    }


    //----------------------------------
    // 場から削除
    //----------------------------------

    const index =
        field.indexOf(target);


    if(
        index !== -1
    ){

        field.splice(
            index,
            1
        );

    }


    //----------------------------------
    // 手札コスト表示更新
    //----------------------------------

    if(
        target.owner === PLAYER
    ){

        updateHandCostDisplay();

    }


    //----------------------------------
    // 記録解除
    //----------------------------------

    basiliskBattleTarget = null;

}