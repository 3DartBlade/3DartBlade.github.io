const version = "0.7.0";
var clicks = 0;

let clickObject;

function Ready(){
    clickObject = document.getElementById("clickCount");
    onbeforeunload = BeforeUnload;

    LoadLocal();
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
    return {version, date: new Date(), clicks};
}
function LoadSave(data){
    clicks = data.clicks;
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
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function IncreaseClick(){
    clicks += 1;
    UpdateDisplay();
}