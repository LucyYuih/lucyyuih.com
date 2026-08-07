gdjs.sitelegalCode = {};
gdjs.sitelegalCode.localVariables = [];
gdjs.sitelegalCode.idToCallbackMap = new Map();
gdjs.sitelegalCode.GDTextoCentralObjects1= [];
gdjs.sitelegalCode.GDTextoCentralObjects2= [];
gdjs.sitelegalCode.GDTextoCentralObjects3= [];
gdjs.sitelegalCode.GDColorObjects1= [];
gdjs.sitelegalCode.GDColorObjects2= [];
gdjs.sitelegalCode.GDColorObjects3= [];
gdjs.sitelegalCode.GDGDevObjects1= [];
gdjs.sitelegalCode.GDGDevObjects2= [];
gdjs.sitelegalCode.GDGDevObjects3= [];


gdjs.sitelegalCode.asyncCallback38136092 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.sitelegalCode.localVariables);
gdjs.copyArray(asyncObjectsList.getObjects("Color"), gdjs.sitelegalCode.GDColorObjects3);

{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects3.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects3[i].setColor("3;3;3");
}
}
{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects3.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects3[i].getBehavior("Text").setText("color");
}
}
{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects3.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects3[i].activateBehavior("CursorHover", true);
}
}
gdjs.sitelegalCode.localVariables.length = 0;
}
gdjs.sitelegalCode.idToCallbackMap.set(38136092, gdjs.sitelegalCode.asyncCallback38136092);
gdjs.sitelegalCode.eventsList0 = function(runtimeScene, asyncObjectsList) {

{


{
const parentAsyncObjectsList = asyncObjectsList;
{
const asyncObjectsList = gdjs.LongLivedObjectsList.from(parentAsyncObjectsList);
asyncObjectsList.backupLocalVariablesContainers(gdjs.sitelegalCode.localVariables);
for (const obj of gdjs.sitelegalCode.GDColorObjects2) asyncObjectsList.addObject("Color", obj);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(3), (runtimeScene) => (gdjs.sitelegalCode.asyncCallback38136092(runtimeScene, asyncObjectsList)), 38136092, asyncObjectsList);
}
}

}


};gdjs.sitelegalCode.asyncCallback38211140 = function (runtimeScene, asyncObjectsList) {
asyncObjectsList.restoreLocalVariablesContainers(gdjs.sitelegalCode.localVariables);
gdjs.copyArray(asyncObjectsList.getObjects("Color"), gdjs.sitelegalCode.GDColorObjects2);

{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects2.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects2[i].setColor("255;0;0");
}
}

{ //Subevents
gdjs.sitelegalCode.eventsList0(runtimeScene, asyncObjectsList);} //End of subevents
gdjs.sitelegalCode.localVariables.length = 0;
}
gdjs.sitelegalCode.idToCallbackMap.set(38211140, gdjs.sitelegalCode.asyncCallback38211140);
gdjs.sitelegalCode.eventsList1 = function(runtimeScene) {

{


{
{
const asyncObjectsList = new gdjs.LongLivedObjectsList();
asyncObjectsList.backupLocalVariablesContainers(gdjs.sitelegalCode.localVariables);
for (const obj of gdjs.sitelegalCode.GDColorObjects1) asyncObjectsList.addObject("Color", obj);
runtimeScene.getAsyncTasksManager().addTask(gdjs.evtTools.runtimeScene.wait(0.1), (runtimeScene) => (gdjs.sitelegalCode.asyncCallback38211140(runtimeScene, asyncObjectsList)), 38211140, asyncObjectsList);
}
}

}


};gdjs.sitelegalCode.eventsList2 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("TextoCentral"), gdjs.sitelegalCode.GDTextoCentralObjects1);
{for(var i = 0, len = gdjs.sitelegalCode.GDTextoCentralObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDTextoCentralObjects1[i].setCenterPositionInScene(gdjs.evtTools.camera.getCameraX(runtimeScene, "", 0),gdjs.evtTools.camera.getCameraY(runtimeScene, "", 0));
}
}
{for(var i = 0, len = gdjs.sitelegalCode.GDTextoCentralObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDTextoCentralObjects1[i].setWrappingWidth(960 * Math.min(gdjs.evtTools.window.getGameResolutionWidth(runtimeScene) / 1280, gdjs.evtTools.window.getGameResolutionHeight(runtimeScene) / 720));
}
}
{for(var i = 0, len = gdjs.sitelegalCode.GDTextoCentralObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDTextoCentralObjects1[i].setWrapping(true);
}
}
}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("Color"), gdjs.sitelegalCode.GDColorObjects1);
{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects1[i].setY(12);
}
}
{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects1[i].setCenterXInScene(gdjs.evtTools.camera.getCameraX(runtimeScene, "", 0));
}
}
{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects1[i].setWrappingWidth(560 * Math.min(gdjs.evtTools.window.getGameResolutionWidth(runtimeScene) / 1280, gdjs.evtTools.window.getGameResolutionHeight(runtimeScene) / 720));
}
}
{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects1[i].setWrapping(true);
}
}
}

}


{

gdjs.copyArray(runtimeScene.getObjects("Color"), gdjs.sitelegalCode.GDColorObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.sitelegalCode.GDColorObjects1.length;i<l;++i) {
    if ( gdjs.sitelegalCode.GDColorObjects1[i].getBehavior("ButtonFSM").IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.sitelegalCode.GDColorObjects1[k] = gdjs.sitelegalCode.GDColorObjects1[i];
        ++k;
    }
}
gdjs.sitelegalCode.GDColorObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.sitelegalCode.GDColorObjects1.length;i<l;++i) {
    if ( gdjs.sitelegalCode.GDColorObjects1[i].getBehavior("Text").getText() == "color" ) {
        isConditionTrue_0 = true;
        gdjs.sitelegalCode.GDColorObjects1[k] = gdjs.sitelegalCode.GDColorObjects1[i];
        ++k;
    }
}
gdjs.sitelegalCode.GDColorObjects1.length = k;
}
if (isConditionTrue_0) {
/* Reuse gdjs.sitelegalCode.GDColorObjects1 */
{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects1[i].activateBehavior("CursorHover", false);
}
}
{for(var i = 0, len = gdjs.sitelegalCode.GDColorObjects1.length ;i < len;++i) {
    gdjs.sitelegalCode.GDColorObjects1[i].getBehavior("Text").setText("what makes you happy?");
}
}

{ //Subevents
gdjs.sitelegalCode.eventsList1(runtimeScene);} //End of subevents
}

}


{

gdjs.copyArray(runtimeScene.getObjects("GDev"), gdjs.sitelegalCode.GDGDevObjects1);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.sitelegalCode.GDGDevObjects1.length;i<l;++i) {
    if ( gdjs.sitelegalCode.GDGDevObjects1[i].getBehavior("ButtonFSM").IsClicked(null) ) {
        isConditionTrue_0 = true;
        gdjs.sitelegalCode.GDGDevObjects1[k] = gdjs.sitelegalCode.GDGDevObjects1[i];
        ++k;
    }
}
gdjs.sitelegalCode.GDGDevObjects1.length = k;
if (isConditionTrue_0) {
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getOnceTriggers().triggerOnce(14926356);
}
}
if (isConditionTrue_0) {
{gdjs.evtTools.window.openURL("https://gd.games/LucYuih", runtimeScene);
}
}

}


};

gdjs.sitelegalCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.sitelegalCode.GDTextoCentralObjects1.length = 0;
gdjs.sitelegalCode.GDTextoCentralObjects2.length = 0;
gdjs.sitelegalCode.GDTextoCentralObjects3.length = 0;
gdjs.sitelegalCode.GDColorObjects1.length = 0;
gdjs.sitelegalCode.GDColorObjects2.length = 0;
gdjs.sitelegalCode.GDColorObjects3.length = 0;
gdjs.sitelegalCode.GDGDevObjects1.length = 0;
gdjs.sitelegalCode.GDGDevObjects2.length = 0;
gdjs.sitelegalCode.GDGDevObjects3.length = 0;

gdjs.sitelegalCode.eventsList2(runtimeScene);
gdjs.sitelegalCode.GDTextoCentralObjects1.length = 0;
gdjs.sitelegalCode.GDTextoCentralObjects2.length = 0;
gdjs.sitelegalCode.GDTextoCentralObjects3.length = 0;
gdjs.sitelegalCode.GDColorObjects1.length = 0;
gdjs.sitelegalCode.GDColorObjects2.length = 0;
gdjs.sitelegalCode.GDColorObjects3.length = 0;
gdjs.sitelegalCode.GDGDevObjects1.length = 0;
gdjs.sitelegalCode.GDGDevObjects2.length = 0;
gdjs.sitelegalCode.GDGDevObjects3.length = 0;


return;

}

gdjs['sitelegalCode'] = gdjs.sitelegalCode;
