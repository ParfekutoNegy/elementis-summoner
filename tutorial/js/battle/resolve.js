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
    // 攻撃側が
    // coolAfterBattle能力を持つ
    //----------------------------------

    if(
        attacker?.ability?.type ===
        "coolAfterBattle"
    ){

        basiliskBattleTarget =
            defender;

        console.log(
            "バジリスク系能力：攻撃側として戦闘相手を記録",
            attacker?.card?.name,
            "→",
            defender?.card?.name
        );

        return;

    }


    //----------------------------------
    // 防御側が
    // coolAfterBattle能力を持つ
    //----------------------------------

    if(
        defender?.ability?.type ===
        "coolAfterBattle"
    ){

        basiliskBattleTarget =
            attacker;

        console.log(
            "バジリスク系能力：防御側として戦闘相手を記録",
            defender?.card?.name,
            "→",
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
    // 今回の同時タイミング用に
    // クール時誘発キューを初期化
    //----------------------------------

    coolTriggerQueue = [];


    //----------------------------------
    // バトルによる破壊判定
    //----------------------------------

    resolveDestroy();


    //----------------------------------
    // 破壊されたサモンをクールへ
    //
    // この処理中に
    // ヴァンパイア・マンドラゴラ等の
    // 誘発能力がキューへ登録される
    //----------------------------------

    removeDestroyedSummons();


    //----------------------------------
    // クール時誘発能力を
    // ターンプレイヤー優先で並べる
    //----------------------------------

    sortCoolTriggerQueue();


    //----------------------------------
    // 今回はまだ能力を解決しない
    //
    // 次段階で
    // resolveCoolTriggerQueue()
    // をここへ接続する
    //----------------------------------


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
            // 場を離れる直前の能力を保存
            //----------------------------------
            // ドッペルゲンガーの場合も
            // 現在コピーしている能力を保持する
            //----------------------------------

            const abilityBeforeLeaving =
                summon.ability;


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
                    summon.owner,
                    abilityBeforeLeaving
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
            // ドッペルゲンガー能力の再確認
            //----------------------------------
            // 今離れたサモンをコピー元にしている
            // ドッペルゲンガーがいれば能力を失わせる
            //----------------------------------

            if(
                typeof validateAllDoppelgangerAbilities ===
                "function"
            ){

                validateAllDoppelgangerAbilities();

            }


//----------------------------------
// 場のコスト関連能力が変化したので
// PLAYER手札の現在コストを再表示
//
// サラマンダー等：自分のコスト軽減
// セイレーン等　：相手のマギアコスト増加
// ハーピー等　　：相手のレジストコスト増加
//----------------------------------

if(
    typeof updateHandCostDisplay ===
        "function"
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
    // 場を離れる直前の能力を保存
    //----------------------------------

    const abilityBeforeLeaving =
        target.ability;


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


    //----------------------------------
    // サモン状態リセット
    //----------------------------------

    resetSummonState(
        target
    );


    //----------------------------------
    // クールゾーンへ追加
    //----------------------------------

    board.addCoolCard(
        target.card,
        target.owner,
        abilityBeforeLeaving
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
    // ドッペルゲンガー能力を即時確認
    //----------------------------------

    if(
        typeof validateAllDoppelgangerAbilities ===
        "function"
    ){

        validateAllDoppelgangerAbilities();

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