//======================================
// cool.js
// クールゾーン処理
//======================================


//======================================
// クールゾーンへ送る
//======================================

function moveToCool(card){

    board.removeHandCard(card);

    addCardToCool(card);

}


function openCoolView(){

    const modal =
        document.getElementById(
            "cool-modal"
        );


    if(!modal){

        return;

    }


    //----------------------------------
    // クール回収中は閲覧不可
    //----------------------------------

    if(coolRecoveryMode){

        return;

    }


    //----------------------------------
    // 開いているなら閉じる
    //----------------------------------

    const display =
        window.getComputedStyle(
            modal
        ).display;


    if(display !== "none"){

        modal.style.display =
            "none";

        return;

    }


    //----------------------------------
    // クール一覧生成
    //----------------------------------

    renderCoolModal();


    //----------------------------------
    // 表示
    //----------------------------------

    modal.style.display =
        "block";

}

//======================================
// クール追加共通処理
//======================================

function addCardToCool(card){

    if(!card){

        return;

    }


    //----------------------------------
    // サモン状態をリセット
    //----------------------------------

    const summon =
        playerField.find(
            summon =>
                summon.card === card
        )
        ||
        enemyField.find(
            summon =>
                summon.card === card
        );


    if(summon){

        resetSummonState(
            summon
        );

    }


    //----------------------------------
    // カード状態
    //----------------------------------

    card.setFaceDown(true);

    card.setSelected(false);

    card.area = "cool";


    //----------------------------------
    // クールゾーンへ追加
    //----------------------------------

    board.addCoolCard(
        card
    );


    //----------------------------------
    // クールモーダル更新
    //----------------------------------

    refreshCoolModal();

}

function recoverEnemyCoolCard(){

    //----------------------------------
    // 回収前確認
    //----------------------------------

    console.log(
        "CPUクール回収前",
        board.enemyCoolCards
    );


    //----------------------------------
    // クールカードがない場合
    //----------------------------------

    if(
        board.enemyCoolCards.length === 0
    ){

        console.log(
            "CPUクールなし"
        );

        return;

    }


    //----------------------------------
    // 回収するカード
    //----------------------------------

    const card =
        board.enemyCoolCards[0];


    if(!card){

        console.log(
            "CPUクール回収カード取得失敗"
        );

        return;

    }


    console.log(
        "CPUクール回収カード",
        card.name
    );


    //----------------------------------
    // クールゾーンから削除
    //----------------------------------

    board.removeCoolCard(
        card,
        ENEMY
    );


    //----------------------------------
    // 手札へ戻す
    //----------------------------------

    card.area =
        "enemyHand";


    card.setFaceDown(false);

    card.setHorizontal(false);

    card.setSelected(false);

    card.setHighlight(false);

    card.setCostSelected(false);


    //----------------------------------
    // 相手手札へ追加
    //----------------------------------

    enemyHandCards.push(
        card
    );


    //----------------------------------
    // バトルログ
    //----------------------------------

    addBattleLog(
        `CPU：${card.name}をクールゾーンから回収`
    );


    //----------------------------------
    // 表示更新
    //----------------------------------

    updateEnemyZoneDisplay();


    //----------------------------------
    // クール表示更新
    //----------------------------------

    board.updateCoolCount();



    //----------------------------------
    // 回収後確認
    //----------------------------------

    console.log(
        "CPUクール回収後",
        board.enemyCoolCards
    );

    console.log(
        "CPU手札",
        enemyHandCards
    );

}

//======================================
// サモン状態リセット
//======================================

function resetSummonState(summon){

    if(!summon){

        return;

    }


    //----------------------------------
    // 戦闘データ
    //----------------------------------

    summon.damage = 0;

    summon.powerBonus = 0;

    summon.damageBonus = 0;

    summon.destroyed = false;

    summon.isRest = false;

    summon.attackReady = false;

    summon.status = [];


    //----------------------------------
    // 表示状態
    //----------------------------------

    summon.view.setHorizontal(
        false
    );

    summon.view.setSelected(
        false
    );

    summon.view.setHighlight(
        false
    );


    //----------------------------------
    // 現在パワー表示を更新
    //----------------------------------

    summon.view.updateCurrentPower(
        summon
    );


    //----------------------------------
    // 攻撃対象状態
    //----------------------------------

    summon.view.fieldSelected = false;

    summon.view.target = false;

}

//======================================
// クール回収開始
//======================================

function startCoolRecovery(){

    //----------------------------------
    // クールカードがない
    //----------------------------------

    if(
        board.playerCoolCards.length === 0
    ){

        console.log(
            "クールゾーンが空なので回収不要"
        );

        return;

    }


    //----------------------------------
    // 回収モード開始
    //----------------------------------

    coolRecoveryMode = true;

    selectedCoolCard = null;


    //----------------------------------
    // アクション案内
    //----------------------------------

    showActionGuide(
        "手札に戻すカードを選んでください"
    );


    //----------------------------------
    // モーダルを作り直す
    //----------------------------------

    openCoolRecoveryModal();

}

//======================================
// クール回収モーダル
//======================================

function openCoolRecoveryModal(){

    const modal =
        document.getElementById(
            "cool-modal"
        );


    const list =
        document.getElementById(
            "cool-list"
        );


    if(!modal || !list){

        console.warn(
            "クールモーダル要素がありません"
        );

        return;

    }


    //----------------------------------
    // 一覧をクリア
    //----------------------------------

    list.innerHTML = "";


    //----------------------------------
    // 選択解除
    //----------------------------------

    selectedCoolCard =
        null;


    //----------------------------------
    // クールカード表示
    //----------------------------------

    board.playerCoolCards.forEach(
        card=>{

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "cool-card-wrapper";


            //----------------------------------
            // カード画像
            //----------------------------------

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                card.image;


            image.className =
                "cool-card";


            //----------------------------------
            // 〇マーカー
            //----------------------------------

            const marker =
                document.createElement(
                    "div"
                );


            marker.className =
                "card-marker";


            marker.style.display =
                "none";


            //----------------------------------
            // 追加
            //----------------------------------

            wrapper.appendChild(
                image
            );

            wrapper.appendChild(
                marker
            );


            //----------------------------------
            // カードクリック
            //----------------------------------

            image.onclick = ()=>{

                if(!coolRecoveryMode){

                    return;

                }


                console.log(
                    "クールカードクリック：",
                    card.name
                );


                //----------------------------------
                // 手札の〇を解除
                //----------------------------------

                if(selectedHandCard){

                    selectedHandCard.setSelected(
                        false
                    );

                }


                //----------------------------------
                // その他の通常選択も解除
                //----------------------------------

                if(selectedInfoCard){

                    selectedInfoCard.setSelected(
                        false
                    );

                }


                //----------------------------------
                // 手札選択を解除
                //----------------------------------

                selectedHandCard =
                    null;


                //----------------------------------
                // クールモーダルの
                // 以前の〇をすべて解除
                //----------------------------------

                document
                    .querySelectorAll(
                        "#cool-list .card-marker"
                    )
                    .forEach(
                        oldMarker=>{

                            oldMarker.style.display =
                                "none";

                        }
                    );


                //----------------------------------
                // 選択カード設定
                //----------------------------------

                selectedCoolCard =
                    card;


                //----------------------------------
                // 通常選択情報
                //----------------------------------

                selectedInfoCard =
                    card;


                //----------------------------------
                // 今回の〇を表示
                //----------------------------------

                marker.style.display =
                    "block";


                //----------------------------------
                // カード詳細
                //----------------------------------

                showCardInfo(
                    card
                );


                //----------------------------------
                // アクションボタン更新
                //----------------------------------

                updateButtons();


                console.log(
                    "クール回収選択:",
                    card.name
                );

            };


            list.appendChild(
                wrapper
            );

        }
    );


    //----------------------------------
    // 回収モード
    //----------------------------------

    modal.classList.add(
        "cool-recovery-mode"
    );


    //----------------------------------
    // モーダル表示
    //----------------------------------

    modal.style.display =
        "block";


    //----------------------------------
    // アクションボタン更新
    //----------------------------------

    updateButtons();

}


//======================================
// クール回収決定
//======================================

function confirmCoolRecovery(){

    //----------------------------------
    // 選択されていない
    //----------------------------------

    if(!selectedCoolCard){

        console.log(
            "クール回収カードが選択されていません"
        );

        return;

    }


    const card =
        selectedCoolCard;


    console.log(
        "クール回収決定:",
        card.name
    );


    //----------------------------------
    // クールゾーンから削除
    //----------------------------------

    board.removeCoolCard(
        card,
        PLAYER
    );


    //----------------------------------
    // カード状態を手札用に戻す
    //----------------------------------

    card.area =
        "hand";

    card.setFaceDown(
        false
    );

    card.setHorizontal(
        false
    );

    card.setSelected(
        false
    );

    card.setHighlight(
        false
    );

    card.setCostSelected(
        false
    );


    //----------------------------------
    // 手札へ追加
    //----------------------------------

    board.addHandCard(
        card
    );


    //----------------------------------
    // 選択解除
    //----------------------------------

    selectedCoolCard =
        null;


    //----------------------------------
    // 回収モード終了
    //----------------------------------

    coolRecoveryMode =
        false;


    //----------------------------------
    // モーダルを閉じる
    //----------------------------------

    const modal =
        document.getElementById(
            "cool-modal"
        );


    if(modal){

        modal.classList.remove(
            "cool-recovery-mode"
        );

        modal.style.display =
            "none";

    }


    //----------------------------------
    // 案内を消す
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // 表示更新
    //----------------------------------

    updateGameState();

    updateCostZoneView();

    updateButtons();

    updateUsableCardHighlight();


    console.log(
        "クール回収完了"
    );

}

//======================================
// クールモーダル更新
//======================================

function refreshCoolModal(){

    //----------------------------------
    // 自分クール
    //----------------------------------

    const playerModal =
        document.getElementById(
            "cool-modal"
        );


    if(
        playerModal &&
        playerModal.style.display === "block"
    ){

        //----------------------------------
        // 回収中は更新しない
        //----------------------------------

        if(coolRecoveryMode){

            console.log(
                "クール回収中のため自分クールモーダル更新をスキップ"
            );

        }else{

            renderCoolModal();

        }

    }


    //----------------------------------
    // 相手クール
    //----------------------------------

    const enemyModal =
        document.getElementById(
            "enemy-cool-modal"
        );


    if(
        enemyModal &&
        enemyModal.style.display === "block"
    ){

        openEnemyCoolModal();

    }

}