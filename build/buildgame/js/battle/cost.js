//======================================
// コスト回収
//======================================

function recoverCostCards(){

    while(board.costCards.length > 0){

        const card = board.costCards.pop();

        card.setFaceDown(false);

        card.setCostSelected(false);

        card.area = "hand";

        board.addHandCard(card);

    }

    board.updateCostCount();

}

//======================================
// CPUコスト回収
//======================================

function recoverEnemyCostCards(){


    if(
        !board.enemyCostCards
    ){
        return;
    }


    while(
        board.enemyCostCards.length > 0
    ){

        const card =
        board.enemyCostCards.pop();


        card.area = "hand";


        enemyHandCards.push(
            card
        );

    }


    console.log(
        "CPUコスト回収完了"
    );

}

//======================================
// コスト支払い可能か
//======================================

function canPayCost(card){

    if(!card){
        return false;
    }


    //----------------------------------
    // 使用カード以外の手札枚数
    //----------------------------------

    let handCount = 0;


    board.handCards.forEach(c=>{

        if(c !== card){

            handCount++;

        }

    });


    //----------------------------------
    // 現在コスト
    //----------------------------------

    const currentCost =
        getCurrentCardCost(
            card
        );


    //----------------------------------
    // 通常のコストを払える
    //----------------------------------

    if(
        handCount >=
        currentCost
    ){

        return true;

    }


    //----------------------------------
    // 対象によってコストが下がるマギア
    //----------------------------------

    if(
        card.type === "マギア" &&
        card.effect &&
        card.effect.costDownElement &&
        card.effect.costDownValue &&
        Array.isArray(
            card.effect.target
        )
    ){

        const targets =
            card.effect.target;


        const reduction =
            Number(
                card.effect.costDownValue
            ) || 0;


        //----------------------------------
        // 軽減後コスト
        //----------------------------------

        const reducedCost =
            Math.max(
                0,
                currentCost -
                reduction
            );


        //----------------------------------
        // 軽減後でも払えない
        //----------------------------------

        if(
            handCount <
            reducedCost
        ){

            return false;

        }


        //----------------------------------
        // 軽減対象が存在するか
        //----------------------------------

        let hasReducedTarget =
            false;


        //==================================
        // 自分クールゾーンのサモン
        //
        // クレイクリエイト等
        //==================================

        if(
            targets.includes(
                "playerCoolSummon"
            )
        ){

            hasReducedTarget =
                board.playerCoolCards.some(
                    coolCard => {

                        if(
                            !coolCard ||
                            coolCard.type !==
                                "サモン"
                        ){

                            return false;

                        }


                        const targetElement =
                            coolCard.elementType ??
                            coolCard.element ??
                            null;


                        return (
                            targetElement ===
                            card.effect.costDownElement
                        );

                    }
                );

        }


        //==================================
        // 自分・相手のヨコ向きサモン
        //
        // クイックアクション等
        //==================================

        if(
            !hasReducedTarget &&
            targets.includes(
                "horizontalSummon"
            )
        ){

            //----------------------------------
            // 自分の場
            //----------------------------------

            hasReducedTarget =
                playerField.some(
                    summon => {

                        if(
                            !summon ||
                            summon.destroyed ||
                            !summon.isRest
                        ){

                            return false;

                        }


                        //----------------------------------
                        // 実際に対象にできるか
                        //----------------------------------

                        if(
                            !isValidMagiaTarget(
                                card,
                                summon
                            )
                        ){

                            return false;

                        }


                        const targetElement =
                            summon.card?.elementType ??
                            summon.card?.element ??
                            null;


                        return (
                            targetElement ===
                            card.effect.costDownElement
                        );

                    }
                );


            //----------------------------------
            // 相手の場
            //----------------------------------

            if(!hasReducedTarget){

                hasReducedTarget =
                    enemyField.some(
                        summon => {

                            if(
                                !summon ||
                                summon.destroyed ||
                                !summon.isRest
                            ){

                                return false;

                            }


                            //----------------------------------
                            // 実際に対象にできるか
                            //----------------------------------

                            if(
                                !isValidMagiaTarget(
                                    card,
                                    summon
                                )
                            ){

                                return false;

                            }


                            const targetElement =
                                summon.card?.elementType ??
                                summon.card?.element ??
                                null;


                            return (
                                targetElement ===
                                card.effect.costDownElement
                            );

                        }
                    );

            }

        }


        //----------------------------------
        // 軽減対象があり、
        // 軽減後コストを払える
        //----------------------------------

        if(hasReducedTarget){

            console.log(
                "対象によるコスト軽減を考慮して使用可能",
                {
                    card:
                        card.name,

                    handCount:
                        handCount,

                    normalCost:
                        currentCost,

                    reducedCost:
                        reducedCost,

                    element:
                        card.effect.costDownElement
                }
            );


            return true;

        }

    }


    //----------------------------------
    // 支払い不可
    //----------------------------------

    return false;

}