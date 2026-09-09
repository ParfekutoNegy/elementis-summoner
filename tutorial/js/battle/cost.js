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


    let handCount = 0;


    board.handCards.forEach(c=>{

        if(c !== card){

            handCount++;

        }

    });


    //----------------------------------
    // 現在のコストを取得
    //----------------------------------

    const currentCost =
        getCurrentCardCost(card);


    return handCount >= currentCost;
}