/* =========================================================
Elementis Summoner
Tutorial Menu
========================================================= */


/* =========================================================
Initialize
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeTutorialMenu
);


/* =========================================================
Tutorial Menu
========================================================= */

function initializeTutorialMenu(){

    console.log(
        "================================"
    );

    console.log(
        "Elementis Summoner Tutorial Menu"
    );

    console.log(
        "================================"
    );


    //----------------------------------
    // はじめから
    //----------------------------------

    const startButton =
        document.getElementById(
            "tutorial-start-button"
        );


    if(startButton){

        startButton.addEventListener(
            "click",
            () => {

                openTutorialStep(
                    1
                );

            }
        );

    }


    //----------------------------------
    // STEP選択
    //----------------------------------

    const stepButtons =
        document.querySelectorAll(
            ".tutorial-step"
        );


    stepButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const step =
                        Number(
                            button.dataset.step
                        );


                    openTutorialStep(
                        step
                    );

                }
            );

        }
    );


    //----------------------------------
    // ホーム
    //----------------------------------

    const backButton =
        document.getElementById(
            "tutorial-back-button"
        );


    if(backButton){

        backButton.addEventListener(
            "click",
            () => {

                goTutorialHome();

            }
        );

    }

}


/* =========================================================
Open STEP
========================================================= */

function openTutorialStep(
    step
){

    //----------------------------------
    // STEP確認
    //----------------------------------

    if(
        !Number.isInteger(step) ||
        step < 1 ||
        step > 6
    ){

        console.error(
            "存在しないTutorial STEP:",
            step
        );


        return;

    }


    console.log(
        "Tutorial STEP",
        step,
        "を開きます"
    );


    //----------------------------------
    // ページ移動
    //----------------------------------

    window.location.href =
        `STEP${step}.html`;

}


/* =========================================================
Home
========================================================= */

function goTutorialHome(){

    /*
        ここは後で実際のホーム画面の
        ファイル位置に合わせて変更できます。
    */

    window.location.href =
        "../index.html";
}