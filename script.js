
const imageFolder = "torifuda/";
const imageFiles = Array.from({length: 100}, (_, i) => `f1s1_${String(i+1).padStart(3,'0')}.jpg`);

let timerInterval = null;

let mistakenFlag = false;
let sampledFile = "";
let remainingCards = [];

const CARD_HEIGHT = 90;
const CARD_WIDTH = 66;

























function setupBackground() {
    const body = document.body;
    body.style.fontFamily = "sans-serif";
    body.style.height = "100vh";
    body.style.background = "#c0c0c0";
    body.style.margin = "0";
    //body.style.paddingTop = CARD_HEIGHT*0.5 + "px";
    body.style.display = "flex";
    body.style.alignItems = "center";      // 縦方向中央
    body.style.flexDirection = "column";   // 縦に並べる

}


function makeControls() {
    const controls = document.createElement("div");
    controls.id = "controls";
    controls.style.marginTop = CARD_HEIGHT*0.4 + "px";
    controls.innerHTML = `
    <label><input type="checkbox" id="self-side" checked>自陣: </label>
    <input type="number" id="num-cards-self" value="3" min="0" max="48" step="1" /> 枚
    <label><input type="checkbox" id="opponent-side" checked>敵陣</label>
    <input type="number" id="num-cards-opponent" value="3" min="0" max="48" step="1" /> 枚
    暗記時間(秒): <input type="number" id="show-time" value="10" min="1" max="900" />
    <button id="start-btn">スタート</button>
    `;

    document.body.appendChild(controls);

    const numCardsSelf = document.querySelector("#num-cards-self");
    const checkboxSelf = document.querySelector("#self-side");
    numCardsSelf.disabled = !checkboxSelf.checked;
    checkboxSelf.addEventListener("change", () => {
        if (checkboxSelf.checked) {
            numCardsSelf.disabled = false;
            numCardsSelf.value = 25;
        } else {
            numCardsSelf.disabled = true;
            numCardsSelf.value = 0;
        }
    });

    const numCardsOpponent = document.querySelector("#num-cards-opponent");
    const checkboxOpponent = document.querySelector("#opponent-side");
    numCardsOpponent.disabled = !checkboxOpponent.checked;
    checkboxOpponent.addEventListener("change", () => {
        if (checkboxOpponent.checked) {
            numCardsOpponent.disabled = false;
            numCardsOpponent.value = 25;
        } else {
            numCardsOpponent.disabled = true;
            numCardsOpponent.value = 0;
        }
    });
}


function makeStatusArea() {
    const statusArea = document.createElement("div");
    statusArea.id = "status-area";
    statusArea.style.marginTop = CARD_HEIGHT*0.2 + "px";
    statusArea.innerHTML = `
    時間: <span id="remaining-time">0</span> 秒
    状態: <span id="game-state">待機中</span>
    <span id="left-over-cards"></span>
    `;
    statusArea.querySelector("#remaining-time").style.fontWeight = "bold";
    statusArea.querySelector("#game-state").style.fontWeight = "bold";
    statusArea.querySelector("#left-over-cards").style.fontWeight = "bold";
    statusArea.querySelector("#left-over-cards").style.color = "red";

    document.body.appendChild(statusArea);
}


function makeGameArea() {
    const gameArea1 = document.createElement("div");
    gameArea1.id = "game-area1";
    gameArea1.style.width = CARD_WIDTH*50/3 + "px";
    gameArea1.style.height = CARD_HEIGHT*3.4 + "px";
    gameArea1.style.background = "#cddead";
    gameArea1.style.marginTop = CARD_HEIGHT*0.4 + "px";
    gameArea1.style.borderRadius = "10px";
    gameArea1.style.position = "relative";
    document.body.appendChild(gameArea1);

    const gameArea2 = document.createElement("div");
    gameArea2.id = "game-area2";
    gameArea2.style.width = CARD_WIDTH*50/3 + "px";
    gameArea2.style.height = CARD_HEIGHT*3.4 + "px";
    gameArea2.style.background = "#cddead";
    gameArea2.style.marginTop = CARD_HEIGHT*0.6 + "px";
    gameArea2.style.position = "relative";
    // change border radius
    gameArea2.style.borderRadius = "10px";
    document.body.appendChild(gameArea2);
}





function makeOrganizationButton() {
    const organizationArea = document.createElement("div");
    organizationArea.id = "organization-area";
    organizationArea.style.marginTop = CARD_HEIGHT*0.4 + "px";
    organizationArea.innerHTML = `
    <button id="organize-btn">自陣を整頓</button>
    <span id="alert"></span>
    `;
    organizationArea.querySelector("#alert").style.fontWeight = "bold";
    organizationArea.querySelector("#alert").style.color = "red";

    document.body.appendChild(organizationArea);
}
































function makeCard(file) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.width = CARD_WIDTH + "px";
    card.style.height = CARD_HEIGHT + "px";
    card.style.position = "absolute";
    card.style.cursor = "pointer";
    card.style.perspective = "1000px";
    card.dataset.filename = file;

    const cardInner = document.createElement("div");
    cardInner.className = "card-inner";
    cardInner.style.width = "100%";
    cardInner.style.height = "100%";
    cardInner.style.position = "relative";
    cardInner.style.transformStyle = "preserve-3d";
    cardInner.style.transition = "transform 0.6s";
    cardInner.style.textAlign = "center";

    const cardFront = document.createElement("div");
    cardFront.className = "card-front";
    cardFront.style.width = "100%";
    cardFront.style.height = "100%";
    cardFront.style.position = "absolute";
    cardFront.style.backfaceVisibility = "hidden";
    cardFront.style.backgroundImage = `url('${imageFolder}${file}')`;
    cardFront.style.backgroundSize = "cover";
    cardFront.style.backgroundPosition = "center";
    cardFront.style.borderRadius = "8px";
    cardFront.style.border = "2px solid #000";
    cardFront.style.boxSizing = "border-box";

    const cardBack = document.createElement("div");
    cardBack.className = "card-back";
    cardBack.style.width = "100%";
    cardBack.style.height = "100%";
    cardBack.style.position = "absolute";
    cardBack.style.backfaceVisibility = "hidden";
    cardBack.style.backgroundColor = "#004d00";
    cardBack.style.transform = "rotateY(180deg)";
    cardBack.style.borderRadius = "8px";
    cardBack.style.border = "2px solid #000";
    cardBack.style.boxSizing = "border-box";

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);



    return card
}



function prepareOpponentCards(selectedCardsOpponent) {
    const numCardsForGroup = new Array(6).fill(0);
    const gameArea1 = document.getElementById("game-area1");

    selectedCardsOpponent.forEach((file, idx) => {
        const card = makeCard(file)
        cardFront = card.querySelector(".card-front");
        cardFront.style.transform = "rotate(180deg)";

        // グループ選択（各グループ最大8枚）
        let group = -1;
        while(true) {
            group = Math.floor(Math.random() * 6);
            if(numCardsForGroup[group] < 8) break;
        }
        
        card.style.right = (group%2 === 0 ? numCardsForGroup[group]*CARD_WIDTH + "px"
                                         : CARD_WIDTH*50/3 - (numCardsForGroup[group]+1)*CARD_WIDTH + "px");
        card.style.top = (Math.floor(group/2)*CARD_HEIGHT*1.2 + "px");
        numCardsForGroup[group]++;
        gameArea1.appendChild(card);
    });
}



function handleMouseMove(e) {
    const card = this.card;
    card.style.position = "absolute";
    card.style.left = (e.clientX - this.offsetX) + "px";
    card.style.top = (e.clientY - this.offsetY) + "px";
}

function handleMouseUp(e) {
    const card = this.card;
    let minY = CARD_HEIGHT * 100;
    let closestY = 0;
    for (let y = 0; y <= CARD_HEIGHT * 2.5; y += CARD_HEIGHT * 1.2) {
        if (Math.abs(card.offsetTop - y) < minY) {
            minY = Math.abs(card.offsetTop - y);
            closestY = y;
        }
    }
    card.style.top = closestY + "px";
    document.removeEventListener("mousemove", this.moveHandler);
    document.removeEventListener("mouseup", this.upHandler);
}

function handleMouseDown(e) {
    const card = e.currentTarget;
    const offsetX = e.clientX - card.offsetLeft;
    const offsetY = e.clientY - card.offsetTop;

    const ctx = { card, offsetX, offsetY }; // 状態を共有するコンテキスト

    ctx.moveHandler = handleMouseMove.bind(ctx);
    ctx.upHandler = handleMouseUp.bind(ctx);

    document.addEventListener("mousemove", ctx.moveHandler);
    document.addEventListener("mouseup", ctx.upHandler);
}


function prepareSelfCards(selectedCardsSelf) {
    const gameArea2 = document.getElementById("game-area2");

    selectedCardsSelf.forEach((file, idx) => {
        const card = makeCard(file);
        card.style.left = (47 * CARD_WIDTH / 6) + "px";
        card.style.top = (-0.3 * CARD_HEIGHT) + "px";
        gameArea2.appendChild(card);

        card.addEventListener("mousedown", handleMouseDown)
    });
}




function prepareCards() {
    const gameArea1 = document.getElementById("game-area1");
    gameArea1.innerHTML = "";
    const gameArea2 = document.getElementById("game-area2");
    gameArea2.innerHTML = "";

    const numCardsOpponent = parseInt(document.getElementById("num-cards-opponent").value);
    const numCardsSelf = parseInt(document.getElementById("num-cards-self").value);
    
    // シャッフルして選ぶ
    const shuffled = [...imageFiles].sort(() => Math.random()-0.5);
    const selectedCardsOpponent = shuffled.slice(0, numCardsOpponent);
    const selectedCardsSelf = shuffled.slice(numCardsOpponent, numCardsOpponent + numCardsSelf);

    prepareOpponentCards(selectedCardsOpponent);
    prepareSelfCards(selectedCardsSelf);
}



function organize() {
    const gameArea2 = document.getElementById("game-area2");
    const cards = Array.from(gameArea2.querySelectorAll(".card"));
    
    // 左右上段、中段、下段に分ける
    const groups = [[], [], [], [], [], []];

    cards.forEach(card => {
        if (card.offsetTop < -1 * CARD_HEIGHT * 0.2) return;
        if (card.offsetTop < CARD_HEIGHT * 1.0 && card.offsetLeft < CARD_WIDTH * 47/6) {
            groups[0].push(card);
        } else if (card.offsetTop < CARD_HEIGHT * 1.0 && card.offsetLeft >= CARD_WIDTH * 47/6) {
            groups[1].push(card);
        } else if (card.offsetTop < CARD_HEIGHT * 2.2 && card.offsetLeft < CARD_WIDTH * 47/6) {
            groups[2].push(card);
        } else if (card.offsetTop < CARD_HEIGHT * 2.2 && card.offsetLeft >= CARD_WIDTH * 47/6) {
            groups[3].push(card);
        } else if (card.offsetLeft < CARD_WIDTH * 47/6) {
            groups[4].push(card);
        } else {
            groups[5].push(card);
        }
    });
    if (groups[0].length + groups[1].length > 16 || groups[2].length + groups[3].length > 16 || groups[4].length + groups[5].length > 16) {
        document.getElementById("alert").textContent = "各段16枚以内にしてください";
        setTimeout(() => {
            document.getElementById("alert").textContent = "";
        }, 2000);
        return;
    }
    groups.forEach((group, idx) => {
        if (idx % 2 === 0) {
            group.sort((a, b) => a.offsetLeft - b.offsetLeft);
        }
        else {
            group.sort((a, b) => b.offsetLeft - a.offsetLeft);
        }
        group.forEach((card, i) => {
            card.style.left = (idx % 2 === 0 ? i * CARD_WIDTH + "px"
                                            : CARD_WIDTH * 50/3 - (i + 1) * CARD_WIDTH + "px");
            card.style.top = (Math.floor(idx / 2) * CARD_HEIGHT * 1.2 + "px");
        });
    });
}





function startMemorizationTime() {
    document.getElementById("game-state").textContent = "暗記中";
    document.getElementById("left-over-cards").textContent = ``;
    document.getElementById("alert").textContent = ``;
    document.getElementById("organize-btn").addEventListener("click", () => {
        organize();
    });
    document.getElementById("organize-btn").style.opacity = 1.0;
    document.getElementById("organize-btn").disabled = false;

    prepareCards();

    let remainingTime = parseInt(document.getElementById("show-time").value);
    document.getElementById("remaining-time").textContent = remainingTime;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remainingTime--;
        document.getElementById("remaining-time").textContent = remainingTime;
        if(remainingTime <= 0) {
            clearInterval(timerInterval);
            startGame();
        }
    }, 1000);
}






























function handleCardClick(card) {
    if (card.offsetTop < -0.2 * CARD_HEIGHT) {
        return 2;
    }
    const cardFile = card.dataset.filename;
    if (cardFile === sampledFile) {
        if (mistakenFlag) {
            const cardFront = card.querySelector(".card-front");
            cardFront.style.backgroundImage = `linear-gradient(rgba(255,0,0,0.3), rgba(255,0,0,0.3)), url('${imageFolder}${sampledFile}')`;
        }
        card.querySelector(".card-inner").style.transform = "rotateY(0deg)";
        return 0;
    }
    let flashes = 7;
    const flashInterval = setInterval(() => {
        if (flashes % 2 === 0) {
            card.style.visibility = "hidden";
        } else {
            card.style.visibility = "visible";
        }
        flashes--;
        if (flashes < 0) {
            clearInterval(flashInterval);
            card.style.visibility = "visible";
        }
    }, 100);
    return 1;
}









function pickTargetAndWait(remainingCards) {
    const gameArea1 = document.getElementById("game-area1");

    let currentTarget = document.createElement("div");
    if (remainingCards.length === 0) {
        if (timerInterval) clearInterval(timerInterval);
        document.getElementById("game-state").textContent = "終了";
        currentTarget = null;
        return;
    }

    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const sampledCard = remainingCards[randomIndex];
    remainingCards.splice(randomIndex, 1);
    sampledFile = sampledCard.dataset.filename;
    currentTarget = makeCard(sampledFile);
    currentTarget.querySelector(".card-inner").style.transform = "rotateY(0deg)";
    currentTarget.style.top = (-1.2 * CARD_HEIGHT) + "px";
    currentTarget.style.left = (13 * CARD_WIDTH) + "px";
    gameArea1.appendChild(currentTarget);

    mistakenFlag = false;
}





function isGameArea2Valid() {
    const gameArea2 = document.getElementById("game-area2");
    const cards = Array.from(gameArea2.querySelectorAll(".card"));
    let res = 0;

    const groups = [[], [], []];
    cards.forEach(card => {
        if (card.offsetTop < -1 * CARD_HEIGHT * 0.2) return;
        if (card.offsetTop < CARD_HEIGHT * 1.0) {
            groups[0].push(card);
        } else if (card.offsetTop < CARD_HEIGHT * 2.2) {
            groups[1].push(card);
        } else {
            groups[2].push(card);
        }
    });
    if (groups.some(group => group.length > 16)) {
        return 2;
    }

    groups.forEach(group => {
        group.sort((a, b) => a.offsetLeft - b.offsetLeft);
        if (group.length > 0  && (group[0].offsetLeft < 0 || group[group.length - 1].offsetLeft + CARD_WIDTH > CARD_WIDTH * 50/3)) {
            res = 1;
        }
        for (let i = 0; i < group.length - 1; i++) {
            if (group[i].offsetLeft + CARD_WIDTH > group[i+1].offsetLeft) {
                res = 1;
            }
        }
    });

    return res;
}




function startGame() {
    document.getElementById("game-state").textContent = "プレイ中";

    let countLeftOverCards = 0;
    document.querySelectorAll('#game-area2 .card').forEach(card => {
        if (card.offsetTop < 0) {
            countLeftOverCards++;
            // このcardを削除する
            card.remove();
        }
        card.removeEventListener("mousedown", handleMouseDown);

    });
    if (countLeftOverCards > 0) {
        document.getElementById("left-over-cards").textContent = `並べ損ねた札: ${countLeftOverCards} 枚`;
    }

    const gameArea2Validity = isGameArea2Valid();
    if (gameArea2Validity === 2) {
        document.getElementById("alert").textContent = `各段16枚以内にしてください`;
        document.getElementById("game-state").textContent = "終了";
        return;
    } else if (gameArea2Validity === 1) {
        document.getElementById("alert").textContent = `札が重なっているか、はみ出していたので整頓しました`;
        organize();
        setTimeout(() => {
            document.getElementById("alert").textContent = "";
        }, 4000);
    }

    document.getElementById("organize-btn").disabled = true;
    document.getElementById("organize-btn").style.opacity = 0.5;

    document.querySelectorAll('.card').forEach(c => { 
        const cardInner = c.querySelector('.card-inner');
        cardInner.style.transform = "rotateY(180deg)";
    });

    let remainingTime = 0;
    document.getElementById("remaining-time").textContent = remainingTime;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        remainingTime++; 
        document.getElementById("remaining-time").textContent = remainingTime;
    }, 1000);


    remainingCards = [...document.querySelectorAll('.card')]
    pickTargetAndWait(remainingCards);

    document.querySelectorAll('.card').forEach(c => { 
        c.addEventListener("click", () => {
            const clickresult = handleCardClick(c);
            if (clickresult === 1) {
                mistakenFlag = true;
            } else if (clickresult === 0) {
                pickTargetAndWait(remainingCards);
            }
        });
    });
}

















function main() {
    setupBackground();
    makeControls();
    makeStatusArea();
    makeGameArea();
    makeOrganizationButton();
    // --- イベント設定 ---
    document.getElementById("start-btn").addEventListener("click", () => {
        startMemorizationTime();
    });
}


main();