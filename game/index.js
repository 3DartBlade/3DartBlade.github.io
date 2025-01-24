const version = [0,15,1];
var clicks = 0;
var lastClick = 0;
var clickAmount = 1;

var clickCooldown = 10000;
var cooldownFinish = 0;
var upgrades;

var costIncrease = 2;
var prestige = 1;

var upgradePool = [{type:"cooldown", value:0.9, cost: 2}, {type:"amount", value:1, cost: 2}, {type:"prestige", value:0, cost: prestigeCost()}];
function prestigeCost()
{
    return Math.pow(2, prestige+2);
}
var availableUpgrades = structuredClone([upgradePool[0], upgradePool[1], upgradePool[2]]);

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
    return {version, date: new Date(), clicks, clickCooldown, upgrades, lastClick, cooldownFinish, clickAmount, availableUpgrades, costIncrease, prestige};
}
function  CalculateCost()
{
    return  1 + Math.pow(0.85, prestige-1);
}
function LoadSave(data){
    if(typeof(data.version) === typeof ("string")) ResetSave(false);
    clicks = data.clicks;
    if (isNaN(clicks)){
        clicks = 0;
    }
    clickCooldown = data.clickCooldown;
    if (isNaN(clickCooldown)){
        clickCooldown = 10000;
    }
    prestige = data.prestige;
    if (isNaN(prestige)){
        prestige = 1;
    }
    costIncrease = CalculateCost();
    //costIncrease = data.costIncrease;
    //if (isNaN(costIncrease)){
        //costIncrease = 2;
    //}
    upgrades = data.upgrades;
    if (data.availableUpgrades.length === 3)
        availableUpgrades = data.availableUpgrades;
    else
        availableUpgrades = structuredClone([upgradePool[0], upgradePool[1], upgradePool[2]]);
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
    clickAmount = data.clickAmount;
    if (isNaN(clickAmount)){
        clickAmount = 1;
    }
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

function UpdateDisplay(){
    clickObject.innerHTML = clicks.toString();

    document.getElementById("upgrade0_label").innerHTML = "Upgrade " + availableUpgrades[0].type + " $" + availableUpgrades[0].cost;
    document.getElementById("upgrade1_label").innerHTML = "Upgrade " + availableUpgrades[1].type + " $" + availableUpgrades[1].cost;
    document.getElementById("upgrade2_label").innerHTML = "Upgrade " + availableUpgrades[2].type + " $" + availableUpgrades[2].cost;
    document.getElementById("MultText").innerHTML = "Cost: x" + (Math.round(costIncrease * 100) / 100) + "<br>$/sec: " + (Math.round((1.0/(clickCooldown/1000) * clickAmount) * 100) / 100);
    document.getElementById("VersionDisplay").innerHTML = "Version: " + version.join(".") + "<br> Prestige: <span id='prestige'>" + prestige + "</span>";
    document.querySelector(':root').style.setProperty('--prestigeHue', (prestige % 12)*30);
    document.querySelector(':root').style.setProperty('--prestigeSat', prestige * (100.0/(12 * 12)));
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function IncreaseClick(){
    if (cooldownFinish - Date.now() <= 0)
    {
        clicks += clickAmount;
        UpdateDisplay();
        lastClick = Date.now();
        cooldownFinish = lastClick + clickCooldown;
        StartCooldown();
    }
}
function StartCooldown()
{
    if(clickCooldown <= 10) return;
    clickObject.classList.remove("pbar-inactive");
    clickObject.classList.add("pbar-active");
    var currentCooldown = Math.max(0, cooldownFinish - Date.now());
    document.querySelector(':root').style.setProperty('--timeout-millisec', currentCooldown);
    setTimeout(DeactivatePbar, currentCooldown);
}
function DeactivatePbar()
{
    clickObject.classList.add("pbar-inactive");
    clickObject.classList.remove("pbar-active");
}

function Upgrade(index){
    if (clicks < availableUpgrades[index].cost) { return; }
    clicks -= availableUpgrades[index].cost
    availableUpgrades[index].cost = Math.ceil(availableUpgrades[index].cost * costIncrease);
    switch (availableUpgrades[index].type){
        case "cooldown":
            clickCooldown *= availableUpgrades[index].value;
            clickCooldown = Math.floor(clickCooldown);
            break;
        case "amount":
            clickAmount += availableUpgrades[index].value;
            break;
        case "prestige":
            prestige += 1;
            ResetSave(true);
            availableUpgrades[2].cost = prestigeCost();
            costIncrease = CalculateCost();
            SaveLocal();
            break;
        default:
            ResetSave(false);
            break;
    }
    UpdateDisplay();
}

function ResetSave(isPrestige){
    localStorage.clear();
    if(!isPrestige){costIncrease = 2; prestige = 1}
    clicks = 0; clickCooldown = 10000; upgrades = []; lastClick = 0; cooldownFinish = 0; clickAmount = 1; availableUpgrades = structuredClone([upgradePool[0], upgradePool[1], upgradePool[2]]);
    UpdateDisplay();
}