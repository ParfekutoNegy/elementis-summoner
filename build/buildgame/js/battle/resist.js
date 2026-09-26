//======================================
// 発動中イベント
//======================================

let currentResistEvent = null;



//======================================
// レジスト発動開始
//======================================

function startResist(card){

    //----------------------------------
    // 他カードの使用可能表示解除
    //----------------------------------

    board.handCards.forEach(c=>{

        c.setHighlight(false);

    });

    console.log(
        "レジスト発動開始",
        card
    );

    resistUsingCard = card;

    selectedResistCostCards = [];

    resistCostConfirm = false;

    startResistCost();

}


//======================================
// レジスト コスト開始
//======================================

function startResistCost(){

    console.log(
        "レジスト コスト開始",
        resistUsingCard
    );

    //----------------------------------
    // 初期化
    //----------------------------------

    selectedResistCostCards = [];

    resistCostConfirm = false;


    //----------------------------------
    // 現在のコスト取得
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            resistUsingCard
        );


    //----------------------------------
    // 行動案内
    //----------------------------------

    if(currentCost > 0){

        showActionGuide(
            `コストゾーンに置くカードを<br>${currentCost}枚選んでください`
        );

    }


    //----------------------------------
    // 0コストなら選択不要
    //----------------------------------

    if(currentCost === 0){

        resistCostConfirm = true;

    }


    //----------------------------------
    // ボタン表示
    //----------------------------------

    document.getElementById(
        "cost-action-area"
    ).style.display = "flex";


    updateButtons();

}


//======================================
// レジスト コストカード選択
//======================================

function selectResistCostCard(card){

    //----------------------------------
    // レジスト自身は選択不可
    //----------------------------------

    if(card === resistUsingCard){

        return;

    }


    //----------------------------------
    // 現在のコスト取得
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            resistUsingCard
        );


    //----------------------------------
    // 0コストなら選択不要
    //----------------------------------

    if(currentCost === 0){

        resistCostConfirm = true;

        updateButtons();

        return;

    }


    //----------------------------------
    // 選択解除
    //----------------------------------

    if(
        selectedResistCostCards.includes(card)
    ){

        selectedResistCostCards =
        selectedResistCostCards.filter(
            c => c !== card
        );


        card.setCostSelected(false);

        resistCostConfirm = false;

        updateButtons();

        return;

    }


    //----------------------------------
    // 必要枚数以上
    //----------------------------------

    if(
        selectedResistCostCards.length >=
        currentCost
    ){

        return;

    }


    //----------------------------------
    // コスト追加
    //----------------------------------

    selectedResistCostCards.push(card);

    card.setCostSelected(true);


    //----------------------------------
    // 必要枚数到達
    //----------------------------------

    if(
        selectedResistCostCards.length ===
        currentCost
    ){

        resistCostConfirm = true;

    }


    console.log(
        "選択枚数",
        selectedResistCostCards.length,
        "/",
        currentCost
    );


    console.log(
        "updateButtons呼び出し"
    );


    updateButtons();

}


//======================================
// レジストボタン更新
//======================================

function updateResistButtons(){

    const actionArea =
    document.getElementById(
        "cost-action-area"
    );

    const confirmButton =
    document.getElementById(
        "confirm-button"
    );

    const cancelButton =
    document.getElementById(
        "cancel-button"
    );


    actionArea.style.display =
    "flex";


    //----------------------------------
    // キャンセル
    //----------------------------------

    cancelButton.style.display =
    "inline-block";


    cancelButton.onclick =
    cancelResist;



    //----------------------------------
    // 確定ボタン
    //----------------------------------

    confirmButton.textContent =
    "決定";


    confirmButton.onclick =
    payResistCost;



    if(resistCostConfirm){

        confirmButton.style.display =
        "inline-block";

    }
    else{

        confirmButton.style.display =
        "none";

    }

}

//======================================
// レジスト コスト支払い
//======================================

function payResistCost(){

    console.log(
        "payResistCost"
    );


    //==================================
    // カードプレイ成立
    //
    // ジャックフロスト等の
    // プレイ枚数管理
    //==================================

    registerCardPlay(
        PLAYER,
        resistUsingCard
    );


    //----------------------------------
    // コスト支払い
    //----------------------------------

    selectedResistCostCards.forEach(card=>{

        card.setCostSelected(false);

        moveToCost(card);

    });


    //----------------------------------
    // 表示状態解除
    //----------------------------------

    resistUsingCard.setSelected(false);
    resistUsingCard.setTarget(false);


    //----------------------------------
    // レジストを手札から除去
    //----------------------------------

    board.removeHandCard(
        resistUsingCard
    );


    //----------------------------------
    // クールへ送る
    // サンドプロテクトは手札へ戻るため除外
    //----------------------------------

    if(
        resistUsingCard.name !==
        "サンドプロテクト"
    ){

        board.addCoolCard(
            resistUsingCard,
            PLAYER
        );

    }


    //----------------------------------
    // このイベントでは再使用不可
    //----------------------------------

    resistUsingCard.usedThisEvent = true;


    //----------------------------------
    // 効果発動
    //----------------------------------

    activateResist(
        resistUsingCard
    );


    //----------------------------------
    // 状態リセット
    //----------------------------------

    selectedResistCostCards = [];


    //----------------------------------
    // レジスト表示解除
    //----------------------------------

    board.handCards.forEach(card=>{

        if(card.type === "レジスト"){

            card.setHighlight(false);

        }

    });


    if(resistUsingCard){

        resistUsingCard.setHighlight(false);
        resistUsingCard.setSelected(false);
        resistUsingCard.setCostSelected(false);

    }


    resistUsingCard = null;

    resistCostConfirm = false;

    resistMode = false;

    selectableResistCards = [];


    //----------------------------------
    // ボタンを通常状態へ戻す
    //----------------------------------

    document.getElementById(
        "confirm-button"
    ).onclick =
        payCost;


    finishResist();

    updateButtons();

}


//======================================
// レジスト効果一覧
//======================================

const resistEffects = {

    stoneGuard,
    groundwall,
    waterBarrier,
    liquidVeil,
    rapidMove,
    sandProtect

};


//======================================
// レジスト効果
//======================================

function activateResist(card){

    console.log(
        "レジスト発動",
        card.name
    );

     //----------------------------------
    // 行動案内を消す
    //----------------------------------

    hideActionGuide();

    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `PLAYER：${card.name}を使用`
    );

    const effect =
    resistEffects[card.effect];

    if(effect){

        effect(
            card,
            currentResistEvent
        );

    }

    //----------------------------------
    // 軽減後ダメージ処理へ
    //----------------------------------

    setTimeout(()=>{

        finishResist();

    },2000);


}


function passResist(){

    console.log(
        "レジストをプレイしない"
    );


    //----------------------------------
    // 行動案内を消す
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // 現在のイベント
    //----------------------------------

    const event =
        currentResistEvent;


    if(!event){

        console.log(
            "レジストイベントなし"
        );

        return;

    }


    //----------------------------------
    // 手札モーダルを閉じる
    //----------------------------------

    closeHandModal();


    //----------------------------------
    // レジスト表示解除
    //----------------------------------

    selectableResistCards.forEach(
        card => {

            card.setSelected(false);

            card.setHighlight(false);

        }
    );


    selectableResistCards =
        [];


    //----------------------------------
    // レジストモード解除
    //----------------------------------

    resistMode =
        false;


    //----------------------------------
    // ダメージを正規化
    //----------------------------------

    event.damage =
        Math.max(
            0,
            event.damage
        );


    //----------------------------------
    // サモンへのダメージ
    //----------------------------------

    if(
        event.type ===
        GAME_EVENT.BEFORE_SUMMON_DAMAGE
    ){

        console.log(
            "レジストなし：サモンへダメージ",
            event.target?.card?.name,
            event.damage
        );


        if(
            event.target &&
            event.damage > 0
        ){

            dealDamage(
                event.target,
                event.damage
            );

        }

    }


    //----------------------------------
    // プレイヤーへのダメージ
    //----------------------------------

    else if(
        event.type ===
        GAME_EVENT.BEFORE_PLAYER_DAMAGE
    ){

        console.log(
            "レジストなし：プレイヤーへダメージ",
            event.player,
            event.damage
        );


        //----------------------------------
        // ガーゴイル軽減は
        // すでに終了している
        //----------------------------------

        const finalDamage =
            event.damage;


        console.log(
            "レジストなし：確定ダメージ",
            finalDamage
        );


        //==================================
        // ネレイド
        //
        // レジストを使用しなかった場合でも
        // 最終ダメージに対して
        // ネレイド能力を使用できる
        //==================================

        if(
            finalDamage > 0 &&
            checkNereidDamagePrevent(
                event.player,
                finalDamage,
                event
            )
        ){

            console.log(
                "レジストなし：",
                "ネレイド能力選択待機"
            );


            //----------------------------------
            // 使用済みフラグ解除
            //----------------------------------

            for(const card of board.handCards){

                card.usedThisEvent =
                    false;

            }


            //----------------------------------
            // 手札状態解除
            //----------------------------------

            clearHandSelection();


            for(const card of board.handCards){

                card.setSelected(false);

                card.setCostSelected(false);

                card.setHighlight(false);

            }


            //----------------------------------
            // 表示更新
            //----------------------------------

            updateGameState();

            updateButtons();


//----------------------------------
// updateGameState() 後に
// ネレイド発光を再設定
//----------------------------------

updateNereidDamagePreventHighlight();

            return;

        }


        //----------------------------------
        // バトルログ
        //----------------------------------

        if(finalDamage > 0){

            const damageTarget =
                event.player === PLAYER
                    ?
                    "PLAYER"
                    :
                    "CPU";


            addBattleLog(
                `${damageTarget}：${finalDamage}ダメージ`
            );

        }


        //----------------------------------
        // 確定ダメージを直接適用
        //----------------------------------

        applyPlayerDamage(
            event.player,
            finalDamage
        );

    }


    //----------------------------------
    // 使用済みフラグ解除
    //----------------------------------

    for(const card of board.handCards){

        card.usedThisEvent =
            false;

    }


    //----------------------------------
    // イベント終了
    //----------------------------------

    currentResistEvent =
        null;


    //----------------------------------
    // 戦闘解決
    //----------------------------------

    resolveBattle();


    finishAttack();


    //----------------------------------
    // 手札状態解除
    //----------------------------------

    clearHandSelection();


    for(const card of board.handCards){

        card.setSelected(false);

        card.setCostSelected(false);

        card.setHighlight(false);

    }


    //----------------------------------
    // 通常状態へ更新
    //----------------------------------

    updateGameState();


    //----------------------------------
    // CPU攻撃中なら再開
    //----------------------------------

    if(
        game.currentPlayer === ENEMY &&
        game.state === TURN_STATE.PLAYING
    ){

        console.log(
            "レジストなし CPU攻撃再開"
        );


        cpuWaiting =
            false;


        //----------------------------------
        // 今回の攻撃完了
        //----------------------------------

        cpuAttackIndex++;


        //----------------------------------
        // 次の攻撃へ
        //----------------------------------

        setTimeout(
            () => {

                cpuNextAttack();

            },
            2000
        );

    }

}

//======================================
// レジスト選択開始
//======================================

function openResistSelect(){

    console.log(
        "レジスト選択開始"
    );

    //----------------------------------
    // レジストモード
    //----------------------------------

    resistMode = true;


    selectableResistCards =
        board.handCards.filter(
            card =>
            card.type === "レジスト"
        );


    console.log(
        "選択可能レジスト",
        selectableResistCards
    );

}


//======================================
// ストーンガード
//======================================

function stoneGuard(card){

    currentResistEvent.damage -= 3;

    if(currentResistEvent.damage < 0){

        currentResistEvent.damage = 0;

    }

}

//======================================
// グラウンドウォール
//======================================

function groundwall(card){

    currentResistEvent.damage -= 5;

    if(currentResistEvent.damage < 0){

        currentResistEvent.damage = 0;

    }

}

//======================================
// ウォーターバリア
//======================================
function waterBarrier(card){


    console.log(
        "ウォーターバリア発動"
    );


    currentResistEvent.damage = 0;


    console.log(
        "変更後ダメージ",
        currentResistEvent.damage
    );


}

//======================================
// リキッドヴェール
//======================================

function liquidVeil(card){

    console.log(
        "リキッドヴェール発動"
    );


    currentResistEvent.damage -= 2;


    if(currentResistEvent.damage < 0){

        currentResistEvent.damage = 0;

    }


    console.log(
        "変更後ダメージ",
        currentResistEvent.damage
    );

}
//======================================
// ラピッドムーヴ
//======================================

function rapidMove(card){


    console.log(
        "ラピッドムーヴ発動"
    );


    currentResistEvent.damage = 0;


}

//======================================
// サンドプロテクト
//======================================

function sandProtect(card){

    console.log(
        "サンドプロテクト発動",
        currentResistEvent
    );

    console.log(
        "サンドプロテクト owner:",
        card.owner
    );

    console.log(
        "ENEMY:",
        ENEMY
    );

    console.log(
        "CPU判定:",
        card.owner === ENEMY
    );


    if(
        currentResistEvent.damage === 1
    ){

        console.log(
            "条件一致 → ダメージ0"
        );

        currentResistEvent.damage = 0;


        //----------------------------------
        // CPUの場合
        //----------------------------------

        if(
            card.owner === ENEMY
        ){

            console.log(
                "★ CPUサンドプロテクト処理"
            );

            if(
                !enemyHandCards.includes(card)
            ){

                enemyHandCards.push(card);

            }

            card.area = "hand";


        }

        //----------------------------------
        // プレイヤーの場合
        //----------------------------------

        else{

            console.log(
                "★ PLAYERサンドプロテクト処理"
            );

            returnResistToHand(card);

        }

    }else{

        console.log(
            "条件不一致"
        );

    }


    console.log(
        "変更後ダメージ",
        currentResistEvent.damage
    );
}


//======================================
// レジスト終了
//======================================

function finishResist(){

    //----------------------------------
    // イベントなし
    //----------------------------------

    if(!currentResistEvent){

        console.log(
            "finishResist：イベントなし"
        );

        return;

    }


    console.log(
        "========== finishResist =========="
    );

    console.log(
        "イベント=",
        currentResistEvent.type,
        "対象=",
        currentResistEvent.player,
        "残りダメージ=",
        currentResistEvent.damage
    );


    //==================================
    // 残りダメージがある場合
    //==================================

    if(
        currentResistEvent.damage > 0
    ){

        //==================================
        // CPUがダメージを受ける場合
        //==================================

        if(
            currentResistEvent.player === ENEMY
        ){

            //----------------------------------
            // 使用可能CPUレジスト取得
            //----------------------------------

            const cpuResistCards =
                findCpuResistCards(
                    currentResistEvent
                ).filter(
                    card =>
                        !card.usedThisEvent
                );


            //----------------------------------
            // 使用可能カードあり
            //----------------------------------

            if(
                cpuResistCards.length > 0
            ){

                const cpuResist =
                    selectBestCpuResist(
                        cpuResistCards,
                        currentResistEvent.damage,
                        currentResistEvent
                    );


                //----------------------------------
                // CPUが使用すると判断
                //----------------------------------

                if(cpuResist){

                    console.log(
                        "CPU追加レジスト",
                        cpuResist.name,
                        "使用前ダメージ=",
                        currentResistEvent.damage
                    );


                    const result =
                        useCpuResist(
                            cpuResist
                        );


                    //----------------------------------
                    // 使用成功
                    //----------------------------------

                    if(result){

                        console.log(
                            "CPUレジスト使用後ダメージ=",
                            currentResistEvent.damage
                        );


                        //----------------------------------
                        // 追加レジスト判定へ
                        //----------------------------------

                        setTimeout(()=>{

                            finishResist();

                        },2000);


                        return;

                    }

                }

            }


            //==================================
            // CPUネレイド能力判定
            //
            // ここまで来たということは
            // CPUが今回使用するレジストがない
            //
            // 使用条件
            //
            // ・受けるダメージが3以上
            // または
            // ・そのダメージでライフが0以下
            //==================================

            if(
                currentResistEvent.type ===
                    GAME_EVENT.BEFORE_PLAYER_DAMAGE &&
                currentResistEvent.damage > 0
            ){

                const nereidUsed =
                    checkNereidDamagePrevent(
                        ENEMY,
                        currentResistEvent.damage,
                        currentResistEvent
                    );


                //----------------------------------
                // ネレイド使用
                //----------------------------------

                if(nereidUsed){

                    console.log(
                        "CPUネレイド：ダメージ0"
                    );


                    currentResistEvent.damage =
                        0;

                }

            }

        }


        //==================================
        // PLAYERがダメージを受ける場合
        //==================================

        if(
            currentResistEvent.player === PLAYER
        ){

            const resistCards =
                findResistCards(
                    currentResistEvent
                ).filter(
                    card =>
                        !card.usedThisEvent
                );


            //----------------------------------
            // 追加レジスト選択
            //----------------------------------

            if(
                resistCards.length > 0
            ){

                console.log(
                    "追加プレイヤーレジスト選択",
                    resistCards.map(
                        card =>
                            card.name
                    )
                );


                showResistSelection(
                    resistCards,
                    currentResistEvent
                );


                return;

            }

        }

    }


    //==================================
    // ダメージ解決
    //==================================

    if(
        currentResistEvent.damage > 0
    ){

        //----------------------------------
        // プレイヤーへのダメージ
        //----------------------------------

        if(
            currentResistEvent.type ===
                GAME_EVENT.BEFORE_PLAYER_DAMAGE
        ){

            damagePlayer(

                currentResistEvent.player,

                currentResistEvent.damage,

                true

            );

        }


        //----------------------------------
        // サモンへのダメージ
        //----------------------------------

        if(
            currentResistEvent.type ===
                GAME_EVENT.BEFORE_SUMMON_DAMAGE
        ){

            const summon =
                currentResistEvent.target;


            summon.damage +=
                currentResistEvent.damage;


            showDamageNumber(

                summon,

                currentResistEvent.damage

            );


            console.log(

                "サモンダメージ解決",

                summon.card.name,

                currentResistEvent.damage

            );

        }

    }


    //----------------------------------
    // 使用済みフラグ解除
    //----------------------------------

    for(
        const card of selectableResistCards
    ){

        card.setSelected(false);

        card.usedThisEvent = false;

    }


    //----------------------------------
    // CPUレジストの使用済み解除
    //----------------------------------

    for(
        const card of enemyHandCards
    ){

        card.usedThisEvent = false;

    }


    for(
        const card of enemyCoolCards
    ){

        card.usedThisEvent = false;

    }


    //----------------------------------
    // レジスト表示解除
    //----------------------------------

    for(
        const card of selectableResistCards
    ){

        card.setSelected(false);

        card.setHighlight(false);

    }


    //----------------------------------
    // レジスト状態保存
    //----------------------------------

    const wasPlayerDamage =
        currentResistEvent.type ===
            GAME_EVENT.BEFORE_PLAYER_DAMAGE;


    const attacker =
        currentResistEvent.attacker;


    //----------------------------------
    // レジスト状態解除
    //----------------------------------

    currentResistEvent = null;

    resistMode = false;

    selectableResistCards = [];

    resistUsingCard = null;

    resistCostConfirm = false;

    selectedResistCostCards = [];


    updateButtons();


    //----------------------------------
    // 戦闘解決
    //----------------------------------

    resolveBattle();


    //==================================
    // CPUターン中のレジスト終了
    //==================================

    if(
        game.currentPlayer === ENEMY &&
        cpuWaiting
    ){

        console.log(
            "レジスト終了：CPU行動を再開"
        );


        setTimeout(()=>{

            continueCpuTurn();

        },500);


        return;

    }


    //==================================
    // 通常の攻撃終了
    //==================================

    if(
        isAttacking()
    ){

        finishAttack();

    }

}


//=========================
// レジストキャンセル
//=========================

function cancelResistCost(){

    console.log(
        "レジストキャンセル"
    );

    //----------------------------------
    // コスト選択解除
    //----------------------------------

    selectedResistCostCards.forEach(card=>{

        card.setSelected(false);

        card.setCostSelected(false);

    });

    //----------------------------------
    // 状態リセット
    //----------------------------------

    resistUsingCard = null;

    selectedResistCostCards = [];

    resistCostConfirm = false;

    //----------------------------------
    // レジスト選択へ戻す
    //----------------------------------

    resistMode = true;

    startResistSelection();

    //----------------------------------
    // 行動案内をレジスト選択に戻す
    //----------------------------------

    showActionGuide(
        "レジストをプレイしますか？"
    );

    updateGameState();

}

function returnResistToHand(card){

    console.log(
        "レジスト手札戻し",
        card.name
    );


    //----------------------------------
    // 使用済み解除
    //----------------------------------

    card.usedThisEvent = false;


    //----------------------------------
    // 手札へ戻す
    //----------------------------------

    board.addHandCard(card);


    card.setFaceDown(false);

    card.setHighlight(false);

    card.setSelected(false);

    card.setCostSelected(false);


    card.refresh();


    updateGameState();

}


//======================================
// CPU現在コスト取得
//======================================

function getCurrentEnemyCardCost(card){

    if(!card){

        return 0;

    }


    //----------------------------------
    // 元のコスト
    //----------------------------------

    let cost =
        card.cost;


    //----------------------------------
    // CPU場のコスト軽減能力
    //----------------------------------

    enemyField.forEach(
        summon => {

            //----------------------------------
            // サモン確認
            //----------------------------------

            if(
                !summon ||
                !summon.card ||
                summon.destroyed
            ){

                return;

            }


            //----------------------------------
            // 属性コスト軽減
            //
            // ドッペルゲンガーの
            // コピー能力も含む
            //----------------------------------

            const costDownAbility =
                getSummonAbility(
                    summon,
                    "elementCostDown"
                );


            if(
                costDownAbility &&
                costDownAbility.element ===
                    card.elementType
            ){

                cost -=
                    Number(
                        costDownAbility.value
                    ) || 0;

            }

        }
    );


    //==================================
    // PLAYER場の能力を確認
    //==================================

    playerField.forEach(
        summon => {

            //----------------------------------
            // サモン確認
            //----------------------------------

            if(
                !summon ||
                !summon.card ||
                summon.destroyed
            ){

                return;

            }


            //----------------------------------
            // セイレーン
            // CPUのマギアコスト +1
            //----------------------------------

            const magiaCostUpAbility =
                getSummonAbility(
                    summon,
                    "enemyMagiaCostUp"
                );


            if(
                magiaCostUpAbility &&
                card.type ===
                    "マギア"
            ){

                cost +=
                    Number(
                        magiaCostUpAbility.value
                    ) || 0;

            }


            //----------------------------------
            // ハーピー
            // CPUのレジストコスト +1
            //----------------------------------

            const resistCostUpAbility =
                getSummonAbility(
                    summon,
                    "enemyResistCostUp"
                );


            if(
                resistCostUpAbility &&
                card.type ===
                    "レジスト"
            ){

                cost +=
                    Number(
                        resistCostUpAbility.value
                    ) || 0;

            }

        }
    );


    //----------------------------------
    // 0未満にはしない
    //----------------------------------

    cost =
        Math.max(
            0,
            cost
        );


    return cost;

}
//======================================
// CPUレジスト使用
//======================================

function useCpuResist(card){

    if(!card){

        return false;

    }


    //==================================
    // カードプレイ枚数制限
    //
    // ジャックフロスト等
    //==================================

    if(
        !canPlayCardByLimit(
            ENEMY
        )
    ){

        console.log(
            "CPUレジスト使用不可：",
            "カードプレイ枚数上限",
            getCardPlayCount(
                ENEMY
            ),
            "/",
            getCardPlayLimit(
                ENEMY
            )
        );

        return false;

    }


    //----------------------------------
    // 現在のコスト
    //----------------------------------

    const currentCost =
        getCurrentEnemyCardCost(
            card
        );


    console.log(
        "CPUレジストコスト確認",
        card.name,
        currentCost
    );


    //----------------------------------
    // コストカード取得
    //----------------------------------

    const costCards =
        selectCpuCostCards(
            card,
            currentCost
        );


    //----------------------------------
    // コスト不足
    //----------------------------------

    if(
        costCards.length <
        currentCost
    ){

        console.log(
            "CPUレジスト：コスト不足",
            card.name
        );

        return false;

    }


    //----------------------------------
    // ここから実際の使用
    //----------------------------------

    console.log(
        "CPUレジスト使用",
        card.name
    );


    //==================================
    // カードプレイ成立
    //
    // ジャックフロスト等の
    // プレイ枚数管理
    //==================================

    registerCardPlay(
        ENEMY,
        card
    );


    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `CPU：${card.name}を使用`
    );


    //----------------------------------
    // CPUレジスト使用演出
    //----------------------------------

    showCpuCardAction(
        card,
        "RESIST"
    );


    //----------------------------------
    // コスト支払い
    //----------------------------------

    costCards.forEach(
        costCard => {

            moveEnemyToCost(
                costCard
            );

        }
    );


    //----------------------------------
    // サンドプロテクトか確認
    //----------------------------------

    const returnToHand =
        card.effect === "sandProtect";


    //----------------------------------
    // レジスト自身を手札から除去
    //----------------------------------

    enemyHandCards =
        enemyHandCards.filter(
            c => c !== card
        );


    //----------------------------------
    // サンドプロテクト以外はクールへ
    //----------------------------------

    if(
        !returnToHand
    ){

        card.area =
            "enemyCool";


        if(
            !enemyCoolCards.includes(card)
        ){

            enemyCoolCards.push(
                card
            );

        }


        board.enemyCoolCards =
            enemyCoolCards;


        updateEnemyZoneDisplay();

    }


    //----------------------------------
    // このイベントでは使用済み
    //----------------------------------

    card.usedThisEvent =
        true;


    //----------------------------------
    // 効果発動
    //----------------------------------

    const effect =
        resistEffects[
            card.effect
        ];


    if(effect){

        effect(
            card,
            currentResistEvent
        );

    }


    //----------------------------------
    // 効果確認ログ
    //----------------------------------

    console.log(
        "CPUレジスト効果適用後",
        card.name,
        "damage=",
        currentResistEvent.damage
    );


    //----------------------------------
    // クール確認ログ
    //----------------------------------

    console.log(
        "CPUクールゾーン現在枚数",
        enemyCoolCards.length,
        enemyCoolCards.map(
            c => c.name
        )
    );


    return true;

}