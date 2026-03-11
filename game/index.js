const version = [1,1,1];
var clicks = 0;
var lastClick = 0;
var clickAmount = 1;

var clickCooldown = 10000;
var cooldownFinish = 0;

var costIncrease = 2;
var prestige = 1;

let completeUpgradePool = [{type:"cooldown", level:0, cost: 2}, {type:"amount", level:0, cost: 2}, {type:"prestige", level:0, cost: prestigeCost()}];
function prestigeCost()
{
    return Math.pow(2, prestige+2);
}
var upgrades = structuredClone([completeUpgradePool[0], completeUpgradePool[1], completeUpgradePool[2]]);

let clickObject;

function Ready(){

    document.getElementById("VersionDisplay").innerHTML = "Version: " + version.join(".") + "<br> Prestige: <span id='prestige'>" + prestige + "</span>";

    clickObject = document.getElementById("clickButton");
    onbeforeunload = BeforeUnload;
    document.addEventListener("visibilitychange", BeforeUnload);

    LoadLocal();

    StartCooldown();
}

function BeforeUnload(){
    SaveLocal();
}

function Save(){
    let save = CreateSave();
    WriteFile(save);
}
function Load(fileInput) {
    DispatchReadFile(fileInput.files[0]);
}
function LoadPart2(e){
    LoadSave(JSON.parse(e.target.result));
    UpdateDisplay();
}

function SaveLocal() {
    let save = CreateSave();
    localStorage.setItem("save", JSON.stringify(save));
}

function LoadLocal(){
    let save = JSON.parse(localStorage.getItem("save"));
    if (save != null)
        LoadSave(save);
}

function CreateSave(){
    return {version, date: new Date(), clicks, clickCooldown, lastClick, cooldownFinish, clickAmount, upgrades, prestige, tokens: 0};
}
function  CalculateCost()
{
    return  1 + Math.pow(0.9, prestige-1);
}

function Hide()
{
    var element =document.getElementById("hidden");
    if (element.classList.contains("nodisplay"))
        element.classList.remove("nodisplay");
    else
        element.classList.add("nodisplay");
}
var animTimeout;
function LoadSave(data){
    clearTimeout(animTimeout);

    if(typeof(data.version) === typeof ("string")) ResetSave(false);
    if(data.version[0] === 0 && data.version[1] < 16)
    {
        clicks = 0; clickCooldown = 10000; lastClick = 0; cooldownFinish = 0; clickAmount = 1; upgrades = structuredClone([completeUpgradePool[0], completeUpgradePool[1], completeUpgradePool[2]]);
        upgrades[2].cost = prestigeCost();

        if(prestige>= 8)
            IncreaseClick();

        UpdateDisplay();
        return;
    }

    clicks = data.clicks;
    if (isNaN(clicks)){
        clicks = 0;
    }
    if(data.version[0] === 0 && data.version[1] == 16){
        clicks += Math.round(Math.pow(costIncrease, prestige - 1));
    }

    upgrades = data.upgrades;
    if (upgrades === undefined){
        upgrades = structuredClone(completeUpgradePool);
    }

    clickCooldown = CalculateCooldownValue(upgrades[0] = data.upgrades[0]);
    if (isNaN(clickCooldown)){
        clickCooldown = 10000;
        upgrades[0] = completeUpgradePool[0];
    }
    clickAmount = CalculateAmountValue(upgrades[1] = data.upgrades[1]);
    if (isNaN(clickAmount)){
        clickAmount = 1;
        upgrades[1] = completeUpgradePool[1];
    }
    prestige = data.prestige;
    if (isNaN(prestige)){
        prestige = 1;
    }
    costIncrease = CalculateCost();

    lastClick = data.lastClick;
    if (isNaN(lastClick)){
        lastClick = 0;
    }
    if(lastClick > Date.now()){
        lastClick = Date.now();
    }


    if(prestige >= 12 && prestige < 20){
        let offlineEarnings = Math.min(
            Math.round(((Date.now() - lastClick) / 1000.0) / (clickCooldown/1000.0)),
            Math.max(
                0,
                Math.round(
                    Math.pow(
                        ((Date.now() - lastClick) / 1000.0) / clickCooldown,
                        1.0-(1/(prestige-10))
                    ) * clickAmount
                )
            )
        );
        clicks += offlineEarnings;
        if (offlineEarnings > 0)
            alert("You earned $" + ShortenNum(offlineEarnings) + " while you were offline!");
    }
    else if(prestige >= 20 && prestige < 28){
        let offlineEarnings = Math.round(((Date.now() - lastClick) / 1000.0) / (clickCooldown/1000.0)) * clickAmount;
        clicks += offlineEarnings;
        if (offlineEarnings > 0)
            alert("You earned $" + ShortenNum(offlineEarnings) + " while you were offline!");
    }
    else if (prestige >= 28){
        let offlineEarnings = Math.round(Math.pow(Math.round(((Date.now() - lastClick) / 1000.0) / (clickCooldown/1000.0)), 1 + ((prestige - 27) / 10.0))) * clickAmount;
        clicks += offlineEarnings;
        if (offlineEarnings > 0)
            alert("You earned $" + ShortenNum(offlineEarnings) + " while you were offline!");
    }

    cooldownFinish = data.cooldownFinish;
    if (isNaN(cooldownFinish)){
        cooldownFinish = 0;
    }


    if(prestige>= 8)
        IncreaseClick();

    UpdateDisplay();

    if (prestige >= 16)
        AutoUpgrade();

    if(prestige >= 24)
        AutoSpeedUp();
}

function WriteFile(data){
    let saveString = JSON.stringify(data);
    let uri = "data:text/json;charset=utf-8," + encodeURIComponent(saveString);

    let tempLink = document.createElement('a');
    tempLink.innerHTML = "aids";
    tempLink.setAttribute("href", uri);
    tempLink.setAttribute("download", "save.json");
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
}
function DispatchReadFile(file){
    let reader = new FileReader();
    reader.onload = LoadPart2;
    reader.readAsText(file);
}

function ShortenNum(num)
{
    if (num > Math.pow(10, 33))
        return (Math.floor(num/Math.pow(10, 31)) / 100).toString() + "d";
    else if (num > Math.pow(10, 30))
        return (Math.floor(num/Math.pow(10, 28)) / 100).toString() + "N";
    else if (num > Math.pow(10, 27))
        return (Math.floor(num/Math.pow(10, 25)) / 100).toString() + "O";
    else if (num > Math.pow(10, 24))
        return (Math.floor(num/Math.pow(10, 22)) / 100).toString() + "S";
    else if (num > Math.pow(10, 21))
        return (Math.floor(num/Math.pow(10, 19)) / 100).toString() + "s";
    else if (num > Math.pow(10, 18))
        return (Math.floor(num/Math.pow(10, 16)) / 100).toString() + "Q";
    else if (num > Math.pow(10, 15))
        return (Math.floor(num/Math.pow(10, 13)) / 100).toString() + "q";
    else if (num > Math.pow(10, 12))
        return (Math.floor(num/Math.pow(10, 10)) / 100).toString() + "T";
    else if (num > Math.pow(10, 9))
        return (Math.floor(num/Math.pow(10, 7)) / 100).toString() + "B";
    else if (num > Math.pow(10, 6))
        return (Math.floor(num/Math.pow(10, 4)) / 100).toString() + "M";
    else if(num > Math.pow(10, 3))
        return (Math.floor(num/Math.pow(10, 1)) / 100).toString() + "K";
    else
        return num.toString();
}

function UpdateDisplay(){
    clickObject.innerHTML = ShortenNum(clicks);

    document.getElementById("upgrade0_label").innerHTML = "Upgrade " + upgrades[0].type + " $" + ShortenNum(CalculateUpgradeCost(upgrades[0])) + "<br>Current: " + (Math.round(clickCooldown / 10.0)/100.0) + "s";
    document.getElementById("upgrade1_label").innerHTML = "Upgrade " + upgrades[1].type + " $" + ShortenNum(CalculateUpgradeCost(upgrades[1])) + "<br>Current: $" + ShortenNum(clickAmount);
    document.getElementById("upgrade2_label").innerHTML = "Upgrade " + upgrades[2].type + " $" + ShortenNum(prestigeCost()) + "<br>Next: x" + (Math.round((1 + Math.pow(0.9, prestige))*100)) / 100.0;
    document.getElementById("MultText").innerHTML = "Cost: x" + (Math.round(costIncrease * 100) / 100) + "<br>$/sec: " + ShortenNum(Math.round((1.0/(clickCooldown/1000) * clickAmount) * 100) / 100);
    document.getElementById("VersionDisplay").innerHTML = "Version: " + version.join(".") + "<br> Prestige: <span id='prestige'>" + prestige + "</span>";

    document.querySelector(':root').style.setProperty('--prestigeHue', (prestige % 12)*30);
    document.querySelector(':root').style.setProperty('--prestigeSat', prestige * (100.0/(12 * 12)));

    if(prestige >= 4)
        document.getElementById("prestige4_reward").innerHTML = "tap to speed up!";

    if(prestige >= 8)
        document.getElementById("prestige8_reward").innerHTML = "auto clicker";

    if(prestige >= 12)
        document.getElementById("prestige12_reward").innerHTML = "offline earnings";

    if(prestige >= 16)
        document.getElementById("prestige16_reward").innerHTML = "auto upgrade";

    if(prestige >= 20)
        document.getElementById("prestige20_reward").innerHTML = "lossless offline";

    if(prestige >= 24)
        document.getElementById("prestige24_reward").innerHTML = "auto speed up";

    if(prestige >= 28)
        document.getElementById("prestige28_reward").innerHTML = "exponential offline";
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var minCooldown = 1000.0/24;

function IncreaseClick(){
    document.getElementById("hideButton").innerHTML = clickCooldown.toString();
    if(clickCooldown <= minCooldown && prestige >= 8) {
        clicks += moneySinceLastClick();
        UpdateDisplay();
        lastClick = Date.now();
        setTimeout(IncreaseClick, minCooldown);

    }
    else if (cooldownFinish - Date.now() <= 0)
    {
        clicks += clickAmount;
        UpdateDisplay();
        lastClick = Date.now();
        cooldownFinish = lastClick + clickCooldown;
        StartCooldown();
    }
    else if (prestige >= 4)
    {
        cooldownFinish -= Math.min(clickCooldown, 250);

        var currentCooldown = Math.max(0, cooldownFinish - Date.now());
        clickObject.classList.remove("pbar-inactive");
        clickObject.classList.add("pbar-active");
        clickObject.style.animation = 'none';
        clickObject.offsetHeight; /* trigger reflow */
        clickObject.style.animation = null;
        clearTimeout(animTimeout);
        animTimeout = setTimeout(DeactivatePbar, currentCooldown);
        document.querySelector(':root').style.setProperty('--timeout-millisec', currentCooldown);
        document.querySelector(':root').style.setProperty('--progress-bump', (1.0 - currentCooldown / clickCooldown) * 100);
    }
}

function AutoSpeedUp(){
    IncreaseClick();
    setTimeout(AutoSpeedUp, Math.max(1000/(prestige - 23), 50));
}

function moneySinceLastClick(){
    var money = (1.0/clickCooldown) * clickAmount * (Date.now()-lastClick);
    return Math.floor(money);
}

function StartCooldown()
{

    clickObject.classList.remove("pbar-inactive");
    clickObject.classList.add("pbar-active");
    clickObject.style.animation = 'none';
    clickObject.offsetHeight; /* trigger reflow */
    clickObject.style.animation = null;
    var currentCooldown = Math.max(0, cooldownFinish - Date.now());
    document.querySelector(':root').style.setProperty('--timeout-millisec', currentCooldown);
    document.querySelector(':root').style.setProperty('--progress-bump', 0);
    animTimeout = setTimeout(DeactivatePbar, currentCooldown);
}
function DeactivatePbar()
{
    clickObject.classList.add("pbar-inactive");
    clickObject.classList.remove("pbar-active");

    clickCooldown = CalculateCooldownValue(upgrades[0]);

    if(prestige >= 8)
        IncreaseClick();
}

function CalculateUpgradeCost(upgrade)
{
    return Math.ceil(2 * Math.pow(costIncrease, upgrade.level));
}

let cooldownPower = 2;
let cooldownPowerPower = 50;
function  CalculateCooldownValue(upgrade) {
    return 10000.0/(Math.pow((upgrade.level+1), Math.pow(upgrade.level+1, 1.0/cooldownPowerPower)/cooldownPower));
}

let amountBase = 2;
let amountMod = 9;
let amountStart = 1;
function  CalculateAmountValue(upgrade) {
    // ((x % m) + (m / (b-1))) * pow(b, floor(x / m))-(m / (b-1)) + 1
    let x = upgrade.level;
    let exp = Math.round(((x % amountMod) + (amountMod / (amountBase-1))) * Math.pow(amountBase, Math.floor(x / amountMod))-(amountMod / (amountBase-1)) + amountStart);

    if (x <= 200) return exp;
    if (x > 200) return 46137336 + ((x-200) * 4194288);
}
function Upgrade(index){
    let cost = CalculateUpgradeCost(upgrades[index]);
    if (index == 2)
        cost = prestigeCost();
    if (clicks < cost) { return; }
    clicks -= cost;
    upgrades[index].level++;
    switch (upgrades[index].type){
        case "cooldown":

            clickCooldown = CalculateCooldownValue(upgrades[index]);
            break;
        case "amount":
            clickAmount = CalculateAmountValue(upgrades[index]);
            break;
        case "prestige":
            prestige += 1;
            clearTimeout(animTimeout);
            ResetSave(true);
            upgrades[2].cost = prestigeCost();
            costIncrease = CalculateCost();
            SaveLocal();
            if(prestige == 8)
                IncreaseClick();
            if(prestige == 16)
                AutoUpgrade();
            if(prestige == 24)
                AutoSpeedUp();
            break;
        default:
            ResetSave(false);
            break;
    }
    UpdateDisplay();
}

function AutoUpgrade(){
    setTimeout(AutoUpgrade, Math.max(1000/(prestige - 15), 50));
    let lowest = Math.min(CalculateUpgradeCost(upgrades[0]), CalculateUpgradeCost(upgrades[1]));
    if (clicks < lowest) return;
    if (lowest == CalculateUpgradeCost(upgrades[0]))
        Upgrade(0);
    if (lowest == CalculateUpgradeCost(upgrades[1]))
        Upgrade(1);

}

function PopRandomUpgrade(){

}

function ResetSave(isPrestige){
    localStorage.clear();
    if(!isPrestige){costIncrease = 2; prestige = 1; clicks = 0;}
    clickCooldown = 10000; upgrades = []; lastClick = 0; cooldownFinish = 0; clickAmount = 1; upgrades = structuredClone([completeUpgradePool[0], completeUpgradePool[1], completeUpgradePool[2]]);
    UpdateDisplay();
}
