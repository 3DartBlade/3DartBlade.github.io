const version = [1,1,0];
let save_data;

function Ready(){
    onbeforeunload = BeforeUnload;
    document.addEventListener("visibilitychange", BeforeUnload);

    LoadLocal();

    console.log(save_data.prestige);
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
}

function SaveLocal() {
    let save = CreateSave();
    localStorage.setItem("save", JSON.stringify(save));
}

function LoadLocal(){
    console.log(localStorage.getItem("save"));
    let save = JSON.parse(localStorage.getItem("save"));
    if (save != null)
        LoadSave(save);
}

function CreateSave(){
    return save_data;
}
function LoadSave(data){

    save_data = data;

    if(save_data == null){
        save_data = {version, date: new Date(), clicks:0, clickCooldown:10000, lastClick:new Date(), cooldownFinish:new Date(), clickAmount:1, upgrades:[], prestige: 1};
    }
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
