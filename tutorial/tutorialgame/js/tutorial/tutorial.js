
/* =========================================================
Elementis Summoner
Tutorial System
========================================================= */


/* =========================================================
Tutorial State
========================================================= */

let tutorialStep = 0;

let tutorialActive = true;

let tutorialWaiting = false;

let tutorialGuide = "";

let tutorialStepCompleted = false;


/* =========================================================
Tutorial Start
========================================================= */

function startTutorial(){

    console.log(
        "================================"
    );

    console.log(
        "===== Tutorial Start ====="
    );

    console.log(
        "================================"
    );


    tutorialActive = true;

    tutorialStep = 0;

    tutorialWaiting = false;

    tutorialGuide = "";

    tutorialStepCompleted = false;


    showTutorialStep();

}


/* =========================================================
Tutorial Initialization
========================================================= */

function initializeTutorial(){

    console.log(
        "Tutorial initialization"
    );


    const nextButton =
        document.getElementById(
            "tutorial-next-button"
        );


    if(!nextButton){

        console.warn(
            "Tutorial next button not found."
        );

        return;

    }


    nextButton.addEventListener(
        "click",
        onTutorialNextButton
    );


    startTutorial();

}


/* =========================================================
Next Button
========================================================= */

function onTutorialNextButton(){

    if(!tutorialActive){

        return;

    }


    /*
    実操作待ちのSTEPでは
    「次へ」を押しても進めない
    */

    if(tutorialWaiting){

        console.log(
            "チュートリアル：実操作待ち"
        );

        return;

    }


    nextTutorialStep();

}


/* =========================================================
STEP表示
========================================================= */

function showTutorialStep(){

    console.log(
        "Tutorial STEP:",
        tutorialStep
    );


    tutorialStepCompleted = false;

    tutorialWaiting = false;


    switch(tutorialStep){


        /* ==============================================
           STEP 0
        ============================================== */

        case 0:

            tutorialStepStart();

            break;


        /* ==============================================
           STEP 1
        ============================================== */

        case 1:

            tutorialStepBoard();

            break;


        /* ==============================================
           STEP 2
        ============================================== */

        case 2:

            tutorialStepCardType();

            break;


        /* ==============================================
           STEP 3
        ============================================== */

        case 3:

            tutorialStepCost();

            break;


        /* ==============================================
           STEP 4
        ============================================== */

        case 4:

            tutorialStepSummon();

            break;


        /* ==============================================
           STEP 5
        ============================================== */

        case 5:

            tutorialStepAttack();

            break;


        /* ==============================================
           STEP 6
        ============================================== */

        case 6:

            tutorialStepBlock();

            break;


        /* ==============================================
           STEP 7
        ============================================== */

        case 7:

            tutorialStepMagia();

            break;


        /* ==============================================
           STEP 8
        ============================================== */

        case 8:

            tutorialStepResist();

            break;


        /* ==============================================
           STEP 9
        ============================================== */

        case 9:

            tutorialStepCool();

            break;


        /* ==============================================
           STEP 10
        ============================================== */

        case 10:

            tutorialStepTurn();

            break;


        /* ==============================================
           STEP 11
        ============================================== */

        case 11:

            tutorialStepBattle();

            break;


        /* ==============================================
           完了
        ============================================== */

        default:

            finishTutorial();

            break;

    }

}


/* =========================================================
STEP 0
========================================================= */

function tutorialStepStart(){

    showTutorialMessage(

        "ようこそ！\n\n" +

        "これからElementis Summonerの\n" +
        "基本ルールを覚えていきましょう。\n\n" +

        "まずはゲーム画面を確認します。"

    );

}


/* =========================================================
STEP 1
========================================================= */

function tutorialStepBoard(){

    showTutorialMessage(

        "ゲーム画面を確認しましょう。\n\n" +

        "上側が相手、下側があなたです。\n\n" +

        "中央がバトルフィールドです。\n\n" +

        "手札・コスト・クールゾーンを\n" +
        "使いながら戦います。"

    );

}


/* =========================================================
STEP 2
========================================================= */

function tutorialStepCardType(){

    showTutorialMessage(

        "カードには3種類あります。\n\n" +

        "・サモン\n" +
        "　場に出して戦うカード\n\n" +

        "・マギア\n" +
        "　効果を発動するカード\n\n" +

        "・レジスト\n" +
        "　相手の行動に対応するカード"

    );

}


/* =========================================================
STEP 3
========================================================= */

function tutorialStepCost(){

    showTutorialMessage(

        "カードを使うにはコストが必要です。\n\n" +

        "手札のカードをコストゾーンに置くことで\n" +
        "コストを支払います。\n\n" +

        "では、実際にサモンを出してみましょう。\n\n" +

        "「次へ」を押してください。"

    );

}


/* =========================================================
STEP 4
========================================================= */

function tutorialStepSummon(){

    tutorialWaiting = true;


    showTutorialMessage(

        "サモンを召喚してみましょう。\n\n" +

        "① 手札からサモンを選択\n\n" +

        "② 「プレイ」を押す\n\n" +

        "③ 必要なコストを選択\n\n" +

        "④ 「決定」を押します。\n\n" +

        "実際にサモンを召喚してください。"

    );

}


/* =========================================================
STEP 5
========================================================= */

function tutorialStepAttack(){

    tutorialWaiting = true;


    showTutorialMessage(

        "サモンで攻撃してみましょう。\n\n" +

        "場に出したサモンを選択して、\n" +

        "「アタック」を押してください。\n\n" +

        "相手プレイヤーを攻撃してみましょう。"

    );

}


/* =========================================================
STEP 6
========================================================= */

function tutorialStepBlock(){

    tutorialWaiting = true;


    showTutorialMessage(

        "今度は相手から攻撃されたときの\n" +

        "「ブロック」を覚えましょう。\n\n" +

        "相手の攻撃に対して、\n" +

        "自分のサモンでブロックできます。\n\n" +

        "ブロック対象を選択してみましょう。"

    );

}


/* =========================================================
STEP 7
========================================================= */

function tutorialStepMagia(){

    tutorialWaiting = true;


    showTutorialMessage(

        "次はマギアです。\n\n" +

        "マギアは使用すると\n" +
        "カードに書かれた効果を発動します。\n\n" +

        "手札からマギアを選択して、\n" +
        "実際に使ってみましょう。"

    );

}


/* =========================================================
STEP 8
========================================================= */

function tutorialStepResist(){

    tutorialWaiting = true;


    showTutorialMessage(

        "レジストを覚えましょう。\n\n" +

        "レジストは相手のターンに使用できます。\n\n" +

        "相手の攻撃などによって条件を満たすと、\n" +
        "レジストを使用できます。\n\n" +

        "レジストを選択してみましょう。"

    );

}


/* =========================================================
STEP 9
========================================================= */

function tutorialStepCool(){

    showTutorialMessage(

        "カードを使ったあと、\n" +
        "カードはクールゾーンへ送られることがあります。\n\n" +

        "クールゾーンのカードは、\n" +
        "ターン開始時に回収できます。\n\n" +

        "これでカードの基本的な流れが分かりました。"

    );

}


/* =========================================================
STEP 10
========================================================= */

function tutorialStepTurn(){

    showTutorialMessage(

        "ターンには流れがあります。\n\n" +

        "カードを使う\n" +
        "↓\n" +
        "サモンで攻撃する\n" +
        "↓\n" +
        "ターンを終了する\n\n" +

        "相手のターンになると、\n" +
        "相手も同じように行動します。"

    );

}


/* =========================================================
STEP 11
========================================================= */

function tutorialStepBattle(){

    showTutorialMessage(

        "ここまでで基本ルールは終了です！\n\n" +

        "これまで覚えた\n" +
        "サモン・アタック・ブロック・マギア・レジストを\n" +
        "使って実際に対戦してみましょう。\n\n" +

        "準備ができたら「次へ」を押してください。"

    );

}


/* =========================================================
Tutorial Message
========================================================= */

function showTutorialMessage(message){

    tutorialGuide = message;


    const guide =
        document.getElementById(
            "tutorial-guide"
        );


    const step =
        document.getElementById(
            "tutorial-guide-step"
        );


    const text =
        document.getElementById(
            "tutorial-guide-text"
        );


    const nextButton =
        document.getElementById(
            "tutorial-next-button"
        );


    if(
        !guide ||
        !step ||
        !text ||
        !nextButton
    ){

        console.warn(
            "Tutorial UI element not found."
        );

        return;

    }


    step.textContent =
        "STEP " + tutorialStep;


    /*
    改行をそのまま表示
    */

    text.textContent =
        message;


    /*
    ボタンは常に表示
    */

    nextButton.style.display =
        "block";


    nextButton.disabled =
        false;


    nextButton.textContent =
        tutorialWaiting
            ? "操作してください"
            : "次へ";


    guide.style.display =
        "flex";

}


/* =========================================================
Next STEP
========================================================= */

function nextTutorialStep(){

    if(!tutorialActive){

        return;

    }


    tutorialStepCompleted =
        true;


    tutorialWaiting =
        false;


    tutorialStep++;


    console.log(
        "Tutorial Next Step:",
        tutorialStep
    );


    showTutorialStep();

}


/* =========================================================
Tutorial Operation Complete
========================================================= */

/*
ゲーム本体側から呼び出す関数。

例：

tutorialCompleteStep();

これをサモン成功・アタック成功などの
タイミングから呼び出すことで、
チュートリアルを次へ進める。
*/

function tutorialCompleteStep(){

    if(!tutorialActive){

        return;

    }


    if(!tutorialWaiting){

        return;

    }


    console.log(
        "Tutorial STEP 完了:",
        tutorialStep
    );


    tutorialWaiting =
        false;


    tutorialStepCompleted =
        true;


    const nextButton =
        document.getElementById(
            "tutorial-next-button"
        );


    if(nextButton){

        nextButton.textContent =
            "次へ";

    }


    showTutorialCompletionMessage();

}


/* =========================================================
Tutorial Operation Complete Message
========================================================= */

function showTutorialCompletionMessage(){

    const text =
        document.getElementById(
            "tutorial-guide-text"
        );


    if(!text){

        return;

    }


    switch(tutorialStep){


        case 4:

            text.textContent =
                "サモンを召喚できました！\n\n" +
                "次はサモンで攻撃してみましょう。\n\n" +
                "「次へ」を押してください。";

            break;


        case 5:

            text.textContent =
                "アタック成功です！\n\n" +
                "次は相手からの攻撃を防ぐ\n" +
                "「ブロック」を覚えましょう。\n\n" +
                "「次へ」を押してください。";

            break;


        case 6:

            text.textContent =
                "ブロックを確認できました！\n\n" +
                "次はマギアを使ってみましょう。\n\n" +
                "「次へ」を押してください。";

            break;


        case 7:

            text.textContent =
                "マギアを使用できました！\n\n" +
                "次はレジストです。\n\n" +
                "「次へ」を押してください。";

            break;


        case 8:

            text.textContent =
                "レジストを使用できました！\n\n" +
                "次はクールゾーンについて確認します。\n\n" +
                "「次へ」を押してください。";

            break;


        default:

            break;

    }

}


/* =========================================================
Tutorial Finish
========================================================= */

function finishTutorial(){

    console.log(
        "================================"
    );

    console.log(
        "===== Tutorial Complete ====="
    );

    console.log(
        "================================"
    );


    tutorialActive =
        false;


    tutorialWaiting =
        false;


    const step =
        document.getElementById(
            "tutorial-guide-step"
        );


    const text =
        document.getElementById(
            "tutorial-guide-text"
        );


    const nextButton =
        document.getElementById(
            "tutorial-next-button"
        );


    if(step){

        step.textContent =
            "COMPLETE";

    }


    if(text){

        text.textContent =
            "チュートリアル完了！\n\n" +
            "これで基本ルールは終了です。";

    }


    if(nextButton){

        nextButton.style.display =
            "none";

    }

}


/* =========================================================
Tutorial Guide Hide
========================================================= */

function hideTutorial(){

    const guide =
        document.getElementById(
            "tutorial-guide"
        );


    if(!guide){

        return;

    }


    guide.style.display =
        "none";

}


/* =========================================================
Tutorial Waiting
========================================================= */

function isTutorialWaiting(){

    return (

        tutorialActive &&

        tutorialWaiting

    );

}


/* =========================================================
Start
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeTutorial
);

