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
    // 今回の同時タイミング用
    //----------------------------------

    coolTriggerQueue = [];


    //----------------------------------
    // バトルによる破壊判定
    //----------------------------------

    resolveDestroy();


    //----------------------------------
    // 破壊されたサモンをクールへ
    //----------------------------------

    removeDestroyedSummons();


    //----------------------------------
    // ターンプレイヤー優先に並べる
    //----------------------------------

    sortCoolTriggerQueue();


    //----------------------------------
    // バジリスク能力
    //----------------------------------

    resolveBasiliskBattle();


    //----------------------------------
    // ダメージリセット
    //----------------------------------

    clearDamage();


    //----------------------------------
    // クール時誘発能力解決開始
    //----------------------------------

    startCoolTriggerResolution();

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

        const summon =
            field[i];


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

            }


            //----------------------------------
            // 表示用カードも削除
            //----------------------------------

            if(board){

                if(
                    summon.owner === PLAYER
                ){

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

            if(
                typeof validateAllDoppelgangerAbilities ===
                    "function"
            ){

                validateAllDoppelgangerAbilities();

            }


            //----------------------------------
            // カードプレイ制限を即時更新
            //
            // ジャックフロスト等
            //----------------------------------

            if(
                typeof refreshCardPlayLimitState ===
                    "function"
            ){

                refreshCardPlayLimitState();

            }


            //==================================
            // クールモーダルを再描画
            //
            // ケルベロス等が場を離れた後の
            // 使用可能状態を反映する
            //==================================

            if(
                typeof refreshCoolModal ===
                    "function"
            ){

                refreshCoolModal();

            }


            //----------------------------------
            // サモン能力使用可能状態を即時更新
            //----------------------------------

            if(
                typeof updateAttackHighlight ===
                    "function"
            ){

                updateAttackHighlight();

            }


            if(
                typeof updateButtons ===
                    "function"
            ){

                updateButtons();

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
        field.indexOf(
            target
        );


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
    // カードプレイ制限を即時更新
    //----------------------------------

    if(
        typeof refreshCardPlayLimitState ===
            "function"
    ){

        refreshCardPlayLimitState();

    }


    //==================================
    // クールモーダルを再描画
    //
    // 場から削除した後に行うことが重要
    //==================================

    if(
        typeof refreshCoolModal ===
            "function"
    ){

        refreshCoolModal();

    }


    //----------------------------------
    // サモン能力使用可能状態を即時更新
    //----------------------------------

    if(
        typeof updateAttackHighlight ===
            "function"
    ){

        updateAttackHighlight();

    }


    if(
        typeof updateButtons ===
            "function"
    ){

        updateButtons();

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

//==================================================
// カーススモーク
// ターン終了時解除
//==================================================

function clearCurseSmokeStatus(){

    const fields = [
        playerField,
        enemyField
    ];


    for(const field of fields){

        for(const summon of field){

            if(
                !summon ||
                !Array.isArray(
                    summon.status
                )
            ){

                continue;

            }


            //----------------------------------
            // カーススモーク状態確認
            //----------------------------------

            const hadCurseSmoke =
                summon.status.some(
                    status =>
                        status.type ===
                        "curseSmoke"
                );


            //----------------------------------
            // 状態解除
            //----------------------------------

            summon.status =
                summon.status.filter(
                    status =>
                        status.type !==
                        "curseSmoke"
                );


            //----------------------------------
            // ログ
            //----------------------------------

            if(hadCurseSmoke){

                console.log(
                    "カーススモーク解除",
                    summon.card.name
                );

            }

        }

    }

}

//==================================================
// カーススモーク
// ターン終了時解除
//==================================================

function clearCurseSmokeStatus(){

    const fields = [
        playerField,
        enemyField
    ];


    for(const field of fields){

        for(const summon of field){

            if(
                !summon ||
                !Array.isArray(
                    summon.status
                )
            ){

                continue;

            }


            //----------------------------------
            // カーススモーク確認
            //----------------------------------

            const hadCurseSmoke =
                summon.status.some(
                    status =>
                        status.type ===
                        "curseSmoke"
                );


            //----------------------------------
            // カーススモーク解除
            //----------------------------------

            summon.status =
                summon.status.filter(
                    status =>
                        status.type !==
                        "curseSmoke"
                );


            //----------------------------------
            // ログ
            //----------------------------------

            if(hadCurseSmoke){

                console.log(
                    "カーススモーク解除",
                    summon.card.name
                );

            }

        }

    }

}