const version = [0,16,0];
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
    LoadSave(save);
}

function CreateSave(){
    return {version, date: new Date(), clicks, clickCooldown, lastClick, cooldownFinish, clickAmount, upgrades, prestige};
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

        if(prestige>= 12)
            IncreaseClick();

        UpdateDisplay();
        return;
    }

    clicks = data.clicks;
    if (isNaN(clicks)){
        clicks = 0;
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
    cooldownFinish = data.cooldownFinish;
    if (isNaN(cooldownFinish)){
        cooldownFinish = 0;
    }


    if(prestige>= 12)
        IncreaseClick();

    UpdateDisplay();
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
    if (num > Math.pow(10, 12))
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

    document.getElementById("upgrade0_label").innerHTML = "Upgrade " + upgrades[0].type + " $" + ShortenNum(CalculateUpgradeCost(upgrades[0]));
    document.getElementById("upgrade1_label").innerHTML = "Upgrade " + upgrades[1].type + " $" + ShortenNum(CalculateUpgradeCost(upgrades[1]));
    document.getElementById("upgrade2_label").innerHTML = "Upgrade " + upgrades[2].type + " $" + ShortenNum(prestigeCost());
    document.getElementById("MultText").innerHTML = "Cost: x" + (Math.round(costIncrease * 100) / 100) + "<br>$/sec: " + ShortenNum(Math.round((1.0/(clickCooldown/1000) * clickAmount) * 100) / 100);
    document.getElementById("VersionDisplay").innerHTML = "Version: " + version.join(".") + "<br> Prestige: <span id='prestige'>" + prestige + "</span>";

    document.querySelector(':root').style.setProperty('--prestigeHue', (prestige % 12)*30);
    document.querySelector(':root').style.setProperty('--prestigeSat', prestige * (100.0/(12 * 12)));

    if(prestige >= 12)
        document.getElementById("prestige12_reward").innerHTML = "autoclicker";
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var minCooldown = 1000.0/24;

function IncreaseClick(){
    document.getElementById("hideButton").innerHTML = clickCooldown.toString();
    if(clickCooldown <= minCooldown && prestige >= 12) {
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
    animTimeout = setTimeout(DeactivatePbar, currentCooldown);
}
function DeactivatePbar()
{
    clickObject.classList.add("pbar-inactive");
    clickObject.classList.remove("pbar-active");

    if(prestige >= 12)
        IncreaseClick();
}

function CalculateUpgradeCost(upgrade)
{
    return Math.ceil(2 * Math.pow(costIncrease, upgrade.level));
}

let cooldownPower = 2;
let cooldownPowerPower = 50;
function  CalculateCooldownValue(upgrade) {
    console.log(10000.0+" / (" + (upgrade.level+1) + " ^ ("+ (upgrade.level+1)+" / "+cooldownPower+"))");
    return 10000.0/(Math.pow((upgrade.level+1), Math.pow(upgrade.level+1, 1.0/cooldownPowerPower)/cooldownPower));
}

let amountBase = 2;
let amountMod = 9;
let amountStart = 1;
function  CalculateAmountValue(upgrade) {
    // ((x % m) + (m / (b-1))) * pow(b, floor(x / m))-(m / (b-1)) + 1
    let x = upgrade.level;
    return Math.round(((x % amountMod) + (amountMod / (amountBase-1))) * Math.pow(amountBase, Math.floor(x / amountMod))-(amountMod / (amountBase-1)) + amountStart);
}
function Upgrade(index){
    let cost = CalculateUpgradeCost(upgrades[index]);
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
            if(prestige >= 12)
                IncreaseClick();
            break;
        default:
            ResetSave(false);
            break;
    }
    UpdateDisplay();
}

function PopRandomUpgrade(){

}

function ResetSave(isPrestige){
    localStorage.clear();
    if(!isPrestige){costIncrease = 2; prestige = 1}
    clicks = 0; clickCooldown = 10000; upgrades = []; lastClick = 0; cooldownFinish = 0; clickAmount = 1; upgrades = structuredClone([completeUpgradePool[0], completeUpgradePool[1], completeUpgradePool[2]]);
    UpdateDisplay();
}