
// マギア使用中
let magiaCard = null;

// マギア対象
let magiaTarget = null;

// マギア対象選択中
let magiaTargetMode = false;


let forceCostMode = false;
let forceCostPlayer = null;
let selectedForceCostCard = null;

//=========================
// マギア効果処理
//=========================

function activateMagia(card){


    console.log(
        "マギア発動",
        card.name
    );



    //----------------------------------
    // 仮効果
    //----------------------------------

    alert(
        card.name +
        " を使用しました"
    );



    //----------------------------------
    // クールへ送る
    //----------------------------------

    card.area =
    "cool";


    board.addCoolCard(
        card,
        PLAYER
    );


}

//======================================
// マギア状態リセット
//======================================

function resetMagiaState(){

    //----------------------------------
    // ハイライト解除
    //----------------------------------

    clearMagiaHighlight();

    //----------------------------------
    // 状態初期化
    //----------------------------------

    magiaCard = null;

    magiaTarget = null;

    magiaTargetMode = false;


    //----------------------------------
    // 表示状態再更新
    //----------------------------------

    updateGameState();

}

function startMagia(card){

    //----------------------------------
    // 使用中なら終了
    //----------------------------------

    if(magiaCard){

        return;

    }


    //----------------------------------
    // 使用カード保存
    //----------------------------------

    magiaCard = card;

    magiaCard.owner =
    PLAYER;

    //----------------------------------
    // 攻撃可能サモンの発光解除
    //----------------------------------

    updateGameState();


    magiaTarget = null;



    //----------------------------------
    // 手札発光更新
    //----------------------------------

    updateGameState();


    magiaTarget = null;



    //----------------------------------
    // 対象選択開始
    //----------------------------------


    startMagiaTargetSelect(
        card
    );


    updateButtons();

}

//=========================
// マギアコスト選択開始
//=========================

function startMagiaCost(){

    console.log(
        "startMagiaCost",
        magiaCard,
        magiaTarget
    );


    //----------------------------------
    // コスト確認
    //----------------------------------

    if(!canPayCost(magiaCard)){

        alert(
            "コストが足りません"
        );

        magiaCard = null;
        magiaTarget = null;
        magiaTargetMode = false;

        return;

    }


    //----------------------------------
    // サモン処理と同じ変数を利用
    //----------------------------------

    summonCard = magiaCard;

    costTargetCard = magiaCard;

    selectedCostCards = [];

    costConfirm = false;


    //----------------------------------
    // 現在のコスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            magiaCard
        );


    //----------------------------------
    // 行動案内をコスト選択に変更
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

        costConfirm = true;

    }

    //----------------------------------
    // ボタン更新
    //----------------------------------

    updateButtons();

}


//==================================================
// マギア解決
//==================================================

function resolveMagia(){

    //----------------------------------
    // マギア確認
    //----------------------------------

    if(!magiaCard){

        console.error(
            "resolveMagia：magiaCardがありません"
        );

        return;

    }


    //==================================
    // 追加選択が必要なマギア
    //==================================

    if(
        magiaCard.effect &&
        magiaCard.effect.type === "forceCost"
    ){

        //----------------------------------
        // PLAYER → CPU
        //----------------------------------
        // CPU手札が0枚なら
        // 何も起こらずそのまま終了

        if(
            magiaCard.owner === PLAYER &&
            magiaTarget === ENEMY &&
            enemyHandCards.length === 0
        ){

            console.log(
                "ウィンドプレッシャー：CPU手札0枚",
                "効果なし"
            );


            //----------------------------------
            // マギア情報を保存
            //----------------------------------

            const resolvedMagia =
                magiaCard;

            const resolvedTarget =
                magiaTarget;


            const isCpuMagia =
                resolvedMagia.owner === ENEMY;


            //----------------------------------
            // マギアを手札から削除
            //----------------------------------

            board.handCards =
                board.handCards.filter(
                    card =>
                        card !== resolvedMagia
                );


            //----------------------------------
            // クールへ
            //----------------------------------

            resolvedMagia.area =
                "cool";


            board.addCoolCard(
                resolvedMagia,
                resolvedMagia.owner
            );


            //----------------------------------
            // 撃破解決
            //----------------------------------

            setTimeout(()=>{

                //----------------------------------
                // CPUマギア対象発光解除
                //----------------------------------

                if(
                    isCpuMagia
                ){

                    clearCpuMagiaTargetHighlight(
                        resolvedTarget
                    );

                }


                //----------------------------------
                // 撃破解決
                //----------------------------------

                resolveBattle();

            },5000);


            //----------------------------------
            // 状態リセット
            //----------------------------------

            resetMagiaState();

            summonCard = null;

            selectedCostCards = [];

            costConfirm = false;


            updateButtons();


            return;

        }


        //----------------------------------
        // 通常の強制コスト選択
        //----------------------------------

        startForceCostSelect(
            magiaTarget
        );


        return;

    }


    //==================================
    // 通常マギア
    //==================================

//----------------------------------
// マギア情報を保存
//----------------------------------

const resolvedMagia =
    magiaCard;

const resolvedTarget =
    magiaTarget;

const isCpuMagia =
    resolvedMagia.owner === ENEMY;


//----------------------------------
// 効果発動
//----------------------------------

activateCardEffect(
    resolvedMagia,
    resolvedTarget,
    resolvedMagia.owner
);


//----------------------------------
// 撃破解決
//----------------------------------

setTimeout(()=>{

    //----------------------------------
    // CPU対象発光解除
    //----------------------------------


    //----------------------------------
    // 撃破解決
    //----------------------------------

    resolveBattle();

},1000);


    //----------------------------------
    // 手札から削除
    //----------------------------------

    if(
        resolvedMagia.owner === PLAYER
    ){

        board.handCards =
            board.handCards.filter(
                card =>
                    card !== resolvedMagia
            );

    }
    else{

        enemyHandCards =
            enemyHandCards.filter(
                card =>
                    card !== resolvedMagia
            );

    }


    //----------------------------------
    // クールへ
    //----------------------------------

    resolvedMagia.area =
        "cool";


    board.addCoolCard(
        resolvedMagia,
        resolvedMagia.owner
    );


    //----------------------------------
    // 状態リセット
    //----------------------------------

    resetMagiaState();

    summonCard = null;

    selectedCostCards = [];

    costConfirm = false;


    updateButtons();

}

//======================================
// マギア対象選択開始
//======================================


function startMagiaTargetSelect(card){

    magiaCard = card;

    magiaTarget = null;

    magiaTargetMode = true;


    console.log(
        "マギア対象選択開始",
        card.name
    );

    //----------------------------------
    // 行動案内
    //----------------------------------

    showActionGuide(
        "対象を選んでください"
    );



    //----------------------------------
    // クールゾーン対象
    //----------------------------------

    const targets =
        card.effect?.target || [];


    if(
        targets.includes("playerCoolCard") ||
        targets.includes("playerCoolMagia") ||
        targets.includes("playerCoolSummon")
    ){

        startMagiaCoolTargetSelect();

        return;

    }


    //----------------------------------
    // 通常対象
    //----------------------------------

    highlightMagiaTargets();

}

//======================================
// マギア対象種類
//======================================

function getMagiaTargetMode(card){


    if(
        !card ||
        !card.effect ||
        !card.effect.target
    ){

        return null;

    }


    return card.effect.target;


}

//======================================
// マギア対象ハイライト
//======================================

function highlightMagiaTargets(){

    if(
        !magiaCard ||
        !magiaCard.effect ||
        !magiaCard.effect.target
    ){

        return;

    }


    //----------------------------------
    // 対象タイプ取得
    //----------------------------------

    const targets =
        magiaCard.effect.target;


    //----------------------------------
    // 相手サモン
    //----------------------------------

    if(
        targets.includes("enemySummon")
    ){

        enemyField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分サモン
    //----------------------------------

    if(
        targets.includes("playerSummon")
    ){

        playerField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分タテ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "playerVerticalSummon"
        )
    ){

        playerField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分ヨコ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "playerHorizontalSummon"
        )
    ){

        playerField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 相手タテ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "enemyVerticalSummon"
        )
    ){

        enemyField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 相手ヨコ向きサモン
    //----------------------------------

    if(
        targets.includes(
            "enemyHorizontalSummon"
        )
    ){

        enemyField.forEach(summon=>{

            if(
                isValidMagiaTarget(
                    magiaCard,
                    summon
                )
            ){

                summon.view
                    .getElement()
                    .classList.add(
                        "magia-target"
                    );

            }

        });

    }


    //----------------------------------
    // 自分
    //----------------------------------

    if(
        targets.includes("player")
    ){

        document
            .getElementById(
                "player-icon"
            )
            ?.classList.add(
                "magia-target"
            );

    }


    //----------------------------------
    // 相手
    //----------------------------------

    if(
        targets.includes("enemy")
    ){

        document
            .getElementById(
                "enemy-player-icon"
            )
            ?.classList.add(
                "magia-target"
            );

    }


    //----------------------------------
    // 自分クールゾーン
    //----------------------------------

    if(
        targets.includes(
            "playerCoolCard"
        )
    ){

        board.playerCoolCards.forEach(card=>{

            card.getElement()
                .classList.add(
                    "magia-target"
                );

        });

    }

}


//======================================
// マギア対象タイプ ハイライト
//======================================

function highlightMagiaTargetType(
    targetType
){

    switch(targetType){

        //----------------------------------
        // 自分のタテ向きサモン
        //----------------------------------

        case "playerVerticalSummon":

            playerField.forEach(
                summon => {

                    if(
                        summon.owner === PLAYER &&
                        !summon.isRest
                    ){

                        summon.view
                            .getElement()
                            .classList.add(
                                "magia-target"
                            );

                    }

                }
            );

            break;


        //----------------------------------
        // 自分のヨコ向きサモン
        //----------------------------------

        case "playerHorizontalSummon":

            playerField.forEach(
                summon => {

                    if(
                        summon.owner === PLAYER &&
                        summon.isRest
                    ){

                        summon.view
                            .getElement()
                            .classList.add(
                                "magia-target"
                            );

                    }

                }
            );

            break;


        //----------------------------------
        // 自分
        //----------------------------------

        case "player":

            document
                .getElementById(
                    "player-icon"
                )
                ?.classList.add(
                    "magia-target"
                );

            break;


        //----------------------------------
        // クールゾーン
        //----------------------------------

        case "playerCoolCard":
        case "playerCoolMagia":
        case "playerCoolSummon":

            document
                .getElementById(
                    "player-cool-zone-button"
                )
                ?.classList.add(
                    "magia-target"
                );

            break;

    }

}


//======================================
// マギア対象表示解除
//======================================

function clearMagiaHighlight(){


    document
    .querySelectorAll(
        ".magia-target"
    )
    .forEach(element=>{


        element.classList.remove(
            "magia-target"
        );


    });


}

//======================================
// マギア使用可能判定
//======================================

function canUseMagia(card){

    if(
        !card ||
        !card.effect ||
        !card.effect.target
    ){

        return true;

    }


    const targets =
        card.effect.target;


    //----------------------------------
    // 自分サモン
    //----------------------------------

    if(
        targets.includes("playerSummon") &&
        playerField.length > 0
    ){

        return true;

    }


    //----------------------------------
    // 相手サモン
    //----------------------------------

    if(
        targets.includes("enemySummon") &&
        enemyField.length > 0
    ){

        return true;

    }


    //----------------------------------
    // 自分タテ向き
    //----------------------------------

    if(
        targets.includes("playerVerticalSummon")
    ){

        if(
            playerField.some(
                summon =>
                    !summon.isRest
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分ヨコ向き
    //----------------------------------

    if(
        targets.includes("playerHorizontalSummon")
    ){

        if(
            playerField.some(
                summon =>
                    summon.isRest
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 相手タテ向き
    //----------------------------------

    if(
        targets.includes("enemyVerticalSummon")
    ){

        if(
            enemyField.some(
                summon =>
                    !summon.isRest
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 相手ヨコ向き
    //----------------------------------

    if(
        targets.includes("enemyHorizontalSummon")
    ){

        if(
            enemyField.some(
                summon =>
                    summon.isRest
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分
    //----------------------------------

    if(
        targets.includes("player")
    ){

        return true;

    }


    //----------------------------------
    // 相手
    //----------------------------------

    if(
        targets.includes("enemy")
    ){

        return true;

    }


//----------------------------------
// 自分クールゾーンのカード
//----------------------------------

if(
    targets.includes("playerCoolCard") &&
    board.playerCoolCards.length > 0
){

    return true;

}


return false;

}



//======================================
// マギア対象タイプ 使用可能判定
//======================================

function canSelectMagiaTargetType(
    targetType
){

    switch(targetType){

        //----------------------------------
        // 自分のタテ向きサモン
        //----------------------------------

        case "playerVerticalSummon":

            return playerField.some(
                summon =>
                    summon.owner === PLAYER &&
                    !summon.isRest
            );


        //----------------------------------
        // 自分のヨコ向きサモン
        //----------------------------------

        case "playerHorizontalSummon":

            return playerField.some(
                summon =>
                    summon.owner === PLAYER &&
                    summon.isRest
            );


        //----------------------------------
        // 自分のクールゾーンのカード
        //----------------------------------

        case "playerCoolCard":

            return board.playerCoolCards.length > 0;


        //----------------------------------
        // 自分のクールゾーンのマギア
        //----------------------------------

        case "playerCoolMagia":

            return board.playerCoolCards.some(
                card =>
                    card.type === "マギア"
            );


        //----------------------------------
        // 自分のクールゾーンのサモン
        //----------------------------------

        case "playerCoolSummon":

            return board.playerCoolCards.some(
                card =>
                    card.type === "サモン"
            );


        //----------------------------------
        // 自分
        //----------------------------------

        case "player":

            return true;


        //----------------------------------
        // 未対応
        //----------------------------------

        default:

            return false;

    }

}

//======================================
// マギア対象タイプ取得
//======================================

function getMagiaTargetFromCard(
    card,
    targetType
){

    switch(targetType){

        //----------------------------------
        // 自分のタテ向きサモン
        //----------------------------------

        case "playerVerticalSummon":{

            if(
                card.area !== "field"
            ){

                return null;

            }


            const summon =
                findSummonByView(card);


            if(
                summon &&
                summon.owner === PLAYER &&
                !summon.isRest
            ){

                return summon;

            }

            return null;

        }


        //----------------------------------
        // 自分のヨコ向きサモン
        //----------------------------------

        case "playerHorizontalSummon":{

            if(
                card.area !== "field"
            ){

                return null;

            }


            const summon =
                findSummonByView(card);


            if(
                summon &&
                summon.owner === PLAYER &&
                summon.isRest
            ){

                return summon;

            }

            return null;

        }


        default:

            return null;

    }

}

//======================================
// マギア対象存在確認
//======================================

function canUseMagiaTarget(card){

    if(
        !card ||
        !card.effect ||
        !card.effect.target
    ){

        return false;

    }


    //----------------------------------
    // 自分サモン
    //----------------------------------

    for(
        const summon of playerField
    ){

        if(
            isValidMagiaTarget(
                card,
                summon
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 相手サモン
    //----------------------------------

    for(
        const summon of enemyField
    ){

        if(
            isValidMagiaTarget(
                card,
                summon
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分プレイヤー
    //----------------------------------

    if(
        isValidMagiaTarget(
            card,
            PLAYER
        )
    ){

        return true;

    }


    //----------------------------------
    // 相手プレイヤー
    //----------------------------------

    if(
        isValidMagiaTarget(
            card,
            ENEMY
        )
    ){

        return true;

    }


    //----------------------------------
    // クールゾーン
    //----------------------------------

    const targets =
        card.effect.target;


    //----------------------------------
    // 自分クール：カード
    //----------------------------------

    if(
        targets.includes(
            "playerCoolCard"
        ) &&
        board.playerCoolCards.length > 0
    ){

        return true;

    }


    //----------------------------------
    // 自分クール：マギア
    //----------------------------------

    if(
        targets.includes(
            "playerCoolMagia"
        ) &&
        board.playerCoolCards.some(
            card =>
                card.type === "マギア"
        )
    ){

        return true;

    }


    //----------------------------------
    // 自分クール：サモン
    //----------------------------------

    if(
        targets.includes(
            "playerCoolSummon"
        ) &&
        board.playerCoolCards.some(
            card =>
                card.type === "サモン"
        )
    ){

        return true;

    }


    return false;

}

//======================================
// マギア対象不可判定
//======================================

function isMagiaTargetBlocked(
    card,
    target
){

    if(
        !card ||
        !target ||
        !(target instanceof Summon)
    ){

        return false;

    }


    //----------------------------------
    // 相手のマギア対象にならない
    //----------------------------------

    if(
        target.card?.ability?.type ===
        "cannotBeMagiaTarget"
    ){

        //----------------------------------
        // 自分のマギアは対象にできる
        //----------------------------------

        if(
            target.owner !== card.owner
        ){

            console.log(
                "マギア対象不可",
                target.card.name,
                "cardOwner=",
                card.owner,
                "targetOwner=",
                target.owner
            );

            return true;

        }

    }


    return false;

}




//======================================
// マギア対象判定
//======================================


function isValidMagiaTarget(
    card,
    target
){

    if(
        !card ||
        !card.effect ||
        !card.effect.target ||
        !target
    ){

        return false;

    }


    const targets =
        card.effect.target;


    //----------------------------------
    // サモン
    //----------------------------------

    if(
        target instanceof Summon
    ){

        //----------------------------------
        // 共通対象不可判定
        //----------------------------------

        if(
            isMagiaTargetBlocked(
                card,
                target
            )
        ){

            return false;

        }


        //----------------------------------
        // 自分サモン
        //----------------------------------

        if(
            targets.includes(
                "playerSummon"
            ) &&
            target.owner === PLAYER
        ){

            return true;

        }


        //----------------------------------
        // 相手サモン
        //----------------------------------

        if(
            targets.includes(
                "enemySummon"
            ) &&
            target.owner === ENEMY
        ){

            return true;

        }


        //----------------------------------
        // 自分タテ向き
        //----------------------------------

        if(
            targets.includes(
                "playerVerticalSummon"
            ) &&
            target.owner === PLAYER &&
            !target.isRest
        ){

            return true;

        }


        //----------------------------------
        // 自分ヨコ向き
        //----------------------------------

        if(
            targets.includes(
                "playerHorizontalSummon"
            ) &&
            target.owner === PLAYER &&
            target.isRest
        ){

            return true;

        }


        //----------------------------------
        // 相手タテ向き
        //----------------------------------

        if(
            targets.includes(
                "enemyVerticalSummon"
            ) &&
            target.owner === ENEMY &&
            !target.isRest
        ){

            return true;

        }


        //----------------------------------
        // 相手ヨコ向き
        //----------------------------------

        if(
            targets.includes(
                "enemyHorizontalSummon"
            ) &&
            target.owner === ENEMY &&
            target.isRest
        ){

            return true;

        }


        return false;

    }


    //----------------------------------
    // 自分
    //----------------------------------

    if(
        target === PLAYER ||
        target === "player"
    ){

        return targets.includes(
            "player"
        );

    }


    //----------------------------------
    // 相手
    //----------------------------------

    if(
        target === ENEMY ||
        target === "enemy"
    ){

        return targets.includes(
            "enemy"
        );

    }


    //----------------------------------
    // 自分クールゾーン
    //----------------------------------

    if(
        target.area === "cool" &&
        target.owner === PLAYER &&
        targets.includes(
            "playerCoolCard"
        )
    ){

        return true;

    }


    //----------------------------------
    // その他
    //----------------------------------

    return false;

}
//======================================
// マギア：クールゾーン対象選択
//======================================

function startMagiaCoolTargetSelect(){

    console.log(
        "マギア：クールゾーン対象選択開始"
    );


    const modal =
        document.getElementById(
            "cool-modal"
        );


    const title =
        modal.querySelector("h2");


    const list =
        document.getElementById(
            "cool-list"
        );


    const button =
        document.getElementById(
            "close-cool-x-button"
        );


    //----------------------------------
    // タイトル
    //----------------------------------

    title.textContent =
        "対象カードを選択";


    //----------------------------------
    // 決定ボタン
    //----------------------------------

    button.textContent =
        "キャンセル";


    //----------------------------------
    // リスト初期化
    //----------------------------------

    list.innerHTML = "";


    //----------------------------------
    // 自分のクールゾーン
    //----------------------------------

    const cards =
        board.playerCoolCards;


    //----------------------------------
    // カードなし
    //----------------------------------

    if(cards.length === 0){

        list.innerHTML =
            "<p>カードはありません</p>";

    }else{


        cards.forEach(card=>{

            const img =
                document.createElement("img");


            img.src =
                card.image;


            img.className =
                "cool-card";


            //----------------------------------
            // マギア対象として選択可能なら発光
            //----------------------------------

            if(
                isValidMagiaCoolTarget(
                    magiaCard,
                    card
                )
            ){

                img.classList.add(
                    "magia-target"
                );

            }


            //----------------------------------
            // マギア対象クリック
            //----------------------------------

            img.onclick = ()=>{

                //----------------------------------
                // 対象判定
                //----------------------------------

                if(
                    !isValidMagiaCoolTarget(
                        magiaCard,
                        card
                    )
                ){

                    console.log(
                        "マギア対象外",
                        card.name
                    );

                    return;

                }


                //----------------------------------
                // 対象決定
                //----------------------------------

                magiaTarget =
                    card;


                magiaTargetMode =
                    false;


                console.log(
                    "マギア対象決定：クール",
                    card.name
                );


                //----------------------------------
                // モーダルを閉じる
                //----------------------------------

                modal.style.display =
                    "none";

                modal.classList.remove(
                    "active"
                );


                //----------------------------------
                // 発光解除
                //----------------------------------

                clearMagiaHighlight();


                //----------------------------------
                // コスト選択
                //----------------------------------

                startMagiaCost();

            };


            list.appendChild(img);

        });

    }


    //----------------------------------
    // 表示
    //----------------------------------

    modal.style.display =
        "block";


    modal.classList.add(
        "active"
    );

}

//======================================
// マギア：クールゾーン対象判定
//======================================

function isValidMagiaCoolTarget(
    card,
    target
){

    if(
        !card ||
        !card.effect ||
        !card.effect.target ||
        !target
    ){

        return false;

    }


    //----------------------------------
    // 自分のクールゾーンのカード
    //----------------------------------

    if(
        card.effect.target.includes(
            "playerCoolCard"
        )
    ){

        if(
            board.playerCoolCards.includes(
                target
            )
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分のクールゾーンのマギア
    //----------------------------------

    if(
        card.effect.target.includes(
            "playerCoolMagia"
        )
    ){

        if(
            board.playerCoolCards.includes(target) &&
            target.type === "マギア"
        ){

            return true;

        }

    }


    //----------------------------------
    // 自分のクールゾーンのサモン
    //----------------------------------

    if(
        card.effect.target.includes(
            "playerCoolSummon"
        )
    ){

        if(
            board.playerCoolCards.includes(target) &&
            target.type === "サモン"
        ){

            return true;

        }

    }


    return false;

}

//======================================
// ウインドプレッシャー
// 相手手札選択開始
//======================================
function startForceCostSelect(target){

    console.log(
        "ウインドプレッシャー：相手の手札選択開始",
        target
    );


    //----------------------------------
    // 選択プレイヤー
    //----------------------------------

    forceCostPlayer =
        target;

    forceCostMode =
        true;

    selectedForceCostCard =
    null;

    //----------------------------------
    // 対象プレイヤーの手札確認
    //----------------------------------

    const targetHand =
        target === PLAYER
        ? board.handCards
        : enemyHandCards;


    //----------------------------------
    // 手札がない
    //----------------------------------

    if(
        targetHand.length === 0
    ){

        console.log(
            "ウインドプレッシャー：",
            target === PLAYER
            ? "プレイヤー"
            : "CPU",
            "の手札なし"
        );


        //----------------------------------
        // 選択状態解除
        //----------------------------------

        forceCostMode =
            false;

        forceCostPlayer =
            null;


        //----------------------------------
        // CPUがプレイヤーを対象にした場合
        //----------------------------------
        // 手札0枚なので効果なし

        if(
            target === PLAYER
        ){

            hideActionGuide();

        }


        //----------------------------------
        // マギア解決を続行
        //----------------------------------

        resolveMagiaAfterForceCost();

        return;

    }


    //----------------------------------
    // CPU
    //----------------------------------

    if(
        target === ENEMY
    ){

        cpuForceCostSelect();

        return;

    }


    //----------------------------------
    // プレイヤー
    //----------------------------------

    if(
        target === PLAYER
    ){

        //----------------------------------
        // CPUが使用したウインドプレッシャー
        // プレイヤーに手札選択を要求
        //----------------------------------

        if(
            magiaCard &&
            magiaCard.owner === ENEMY
        ){

            showActionGuide(
                "手札を1枚コストゾーンに置いてください"
            );

        }


        //----------------------------------
        // プレイヤー手札を発光
        //----------------------------------

        updateHandHighlight();

        updateButtons();

        return;

    }


    //----------------------------------
    // その他
    //----------------------------------

    forceCostMode =
        false;

    forceCostPlayer =
        null;

}


//======================================
// 強制コストカード選択
//======================================

function selectForceCostCard(card){

    console.log(
        "ウインドプレッシャー：コストカード選択",
        card.name
    );


    //----------------------------------
    // 強制コスト選択中でなければ無効
    //----------------------------------

    if(!forceCostMode){

        return;

    }


    //----------------------------------
    // プレイヤーの手札以外は選択不可
    //----------------------------------

    if(
        forceCostPlayer !== PLAYER ||
        card.area !== "hand"
    ){

        return;

    }


    //----------------------------------
    // 前回の選択を解除
    //----------------------------------

    if(selectedForceCostCard){

        selectedForceCostCard.setSelected(
            false
        );

    }


    //----------------------------------
    // 今回のカードを選択
    //----------------------------------

    selectedForceCostCard =
        card;

    card.setSelected(true);


    //----------------------------------
    // カード情報表示
    //----------------------------------

    showCardInfo(card);


    //----------------------------------
    // 決定・キャンセルを表示
    //----------------------------------

    updateButtons();


    console.log(
        "ウインドプレッシャー：コストカード選択中",
        card.name
    );

}

function confirmForceCostCard(){

    //----------------------------------
    // 選択確認
    //----------------------------------

    if(
        !forceCostMode ||
        forceCostPlayer !== PLAYER ||
        !selectedForceCostCard
    ){

        return;

    }


    console.log(
        "ウインドプレッシャー：コストカード決定",
        selectedForceCostCard.name
    );


    //----------------------------------
    // 使用中のマギアを保存
    //----------------------------------

    const resolvedMagia =
        magiaCard;


    //----------------------------------
    // 選択カードを保存
    //----------------------------------

    const selectedCard =
        selectedForceCostCard;


    //----------------------------------
    // コストゾーンへ移動
    //----------------------------------

    moveToCost(
        selectedCard
    );


    //----------------------------------
    // 選択解除
    //----------------------------------

    selectedForceCostCard =
        null;


    //----------------------------------
    // 案内を消す
    //----------------------------------

    hideActionGuide();


    //----------------------------------
    // 強制コスト選択終了
    //----------------------------------

    forceCostMode =
        false;

    forceCostPlayer =
        null;


    //----------------------------------
    // ハイライト更新
    //----------------------------------

    updateGameState();

    updateButtons();


    //----------------------------------
    // マギア解決
    //----------------------------------

    resolveMagiaAfterForceCost(
        resolvedMagia,
        PLAYER
    );


    //----------------------------------
    // 使用可能カードの発光を復帰
    //----------------------------------

    if(
        game.currentPlayer === PLAYER
    ){

        updateUsableCardHighlight();

    }

}

function cancelForceCostCard(){

    console.log(
        "ウインドプレッシャー：コストカード選択キャンセル"
    );


    //----------------------------------
    // 選択解除
    //----------------------------------

    if(selectedForceCostCard){

        selectedForceCostCard.setSelected(
            false
        );

    }


    selectedForceCostCard =
        null;


    //----------------------------------
    // カード情報を閉じる
    //----------------------------------

    clearHandSelection();


    //----------------------------------
    // 再び「1枚選んでください」の状態
    //----------------------------------

    showActionGuide(
        "手札を1枚コストゾーンに置いてください"
    );


    updateButtons();

}


//======================================
// 強制コスト選択後
// マギア解決
//======================================

function resolveMagiaAfterForceCost(
    resolvedMagia,
    selectedForceCostPlayer = null
){

    //----------------------------------
    // マギア確認
    //----------------------------------

    if(!resolvedMagia){

        console.error(
            "resolveMagiaAfterForceCost：マギアがありません"
        );

        return;

    }


    //----------------------------------
    // CPUマギアか保存
    //----------------------------------

    const isCpuMagia =
        resolvedMagia.owner === ENEMY;


    //----------------------------------
    // 対象を保存
    //----------------------------------

    const resolvedTarget =
        magiaTarget;


    //----------------------------------
    // 撃破解決
    //----------------------------------

    setTimeout(()=>{

        //----------------------------------
        // CPUマギア対象発光解除
        //----------------------------------

        if(
            isCpuMagia
        ){

            clearCpuMagiaTargetHighlight(
                resolvedTarget
            );

        }


        //----------------------------------
        // 撃破解決
        //----------------------------------

        resolveBattle();

    },5000);


    //----------------------------------
    // 手札から削除
    //----------------------------------

    if(
        resolvedMagia.owner === PLAYER
    ){

        board.handCards =
            board.handCards.filter(
                card =>
                    card !== resolvedMagia
            );

    }
    else{

        enemyHandCards =
            enemyHandCards.filter(
                card =>
                    card !== resolvedMagia
            );

    }


    //----------------------------------
    // クールへ
    //----------------------------------

    resolvedMagia.area =
        "cool";


    board.addCoolCard(
        resolvedMagia,
        resolvedMagia.owner
    );


    //----------------------------------
    // マギア状態解除
    //----------------------------------

    resetMagiaState();

    summonCard = null;

    selectedCostCards = [];

    costConfirm = false;


    //----------------------------------
    // CPUであれば再開可能状態へ
    //----------------------------------

    if(
        isCpuMagia
    ){

        cpuWaiting = false;

    }


    //----------------------------------
    // UI更新
    //----------------------------------

    updateButtons();


    //----------------------------------
    // PLAYERの手札を選択した場合
    //----------------------------------
    // CPUが使った場合ではなく、
    // PLAYERがCPUのカードを選択した場合

    if(
        selectedForceCostPlayer === PLAYER &&
        game.currentPlayer === PLAYER
    ){

        console.log(
            "★ ウインドプレッシャー解決後",
            "PLAYER使用可能カード発光更新"
        );


        updateUsableCardHighlight();

    }


    //----------------------------------
    // CPUターンなら再開
    //----------------------------------

    if(
        isCpuMagia &&
        game.currentPlayer === ENEMY
    ){

        console.log(
            "CPU：ウインドプレッシャー解決完了"
        );


        setTimeout(()=>{

            console.log(
                "CPU：マギア後の行動再開"
            );


            cpuTurnStep = 0;

            runCpuTurnStep();

        },1200);

    }

}


//======================================
// CPUによる強制コスト選択
//======================================

function cpuForceCostSelect(){

    //----------------------------------
    // マギア確認
    //----------------------------------

    if(!magiaCard){

        console.error(
            "cpuForceCostSelect：magiaCardがありません"
        );

        return;

    }


    //----------------------------------
    // 使用中のマギアを保存
    //----------------------------------

    const resolvedMagia =
        magiaCard;


    //----------------------------------
    // 手札なし
    //----------------------------------

    if(
        enemyHandCards.length === 0
    ){

        console.log(
            "CPU：ウインドプレッシャー対象手札なし"
        );


        forceCostMode =
            false;

        forceCostPlayer =
            null;


        //----------------------------------
        // マギア解決
        //----------------------------------

        resolveMagiaAfterForceCost(
            resolvedMagia,
            ENEMY
        );


        return;

    }


    //----------------------------------
    // CPUが選択
    //----------------------------------

    const card =
        enemyHandCards[
            Math.floor(
                Math.random() *
                enemyHandCards.length
            )
        ];


    console.log(
        "CPU：ウインドプレッシャー対象カード",
        card.name
    );


    //----------------------------------
    // コストへ移動
    //----------------------------------

    moveEnemyToCost(
        card
    );


    //----------------------------------
    // 状態解除
    //----------------------------------

    forceCostMode =
        false;

    forceCostPlayer =
        null;


    //----------------------------------
    // UI更新
    //----------------------------------

    updateGameState();

    updateButtons();


    //----------------------------------
    // マギア解決
    //----------------------------------

    resolveMagiaAfterForceCost(
        resolvedMagia,
        ENEMY
    );

}