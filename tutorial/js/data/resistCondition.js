//======================================
// ウォーターバリア条件
// 火属性マギアによるプレイヤーダメージ
//======================================

function waterBarrierCondition(event){

    return (
        event.sourceType === "マギア" &&
        event.element === "火"
    );

}
//======================================
// ラピッドムーヴ条件
// サモンの攻撃ダメージ
//======================================

function rapidMoveCondition(event){


    return (

        event.sourceType === "サモン"

    );

}



//======================================
// サンドプロテクト条件
// 1ダメージのみ
//======================================

function sandProtectCondition(event){


    return (

        event.damage === 1

    );

}


function liquidVeilCondition(event){

    console.log(
        "liquidVeilCondition",
        event.sourceType,
        event.element,
        event.type
    );


    return (
        event.sourceType === "マギア"
    );

}