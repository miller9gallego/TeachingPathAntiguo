import {pageChangeHeaderTitle, pageChangeTheme, pageShowAlert} from "./pageAction";
import {sidemenuChange, sidemenuToggle} from "./sidemenuAction";
import {breadcrumbChange} from "./breadcrumbAction";
import {firebaseChange} from "./firebaseAction";
import {activityChange} from "./activityAction";
import {userChange} from "./userAction";
import {cleanPathway, cleanRunner, getPathwayBy, getRunnerBy, loadPathway, loadRunner} from "./pathwayAction";
import {asideChange, asideToggle} from "./asideAction"


// Export all actions
export {
    pageChangeHeaderTitle,
    pageChangeTheme,
    sidemenuToggle,
    sidemenuChange,
    firebaseChange,
    activityChange,
    breadcrumbChange,
    userChange,
    loadPathway,
    loadRunner,
    asideToggle,
    asideChange,
    getPathwayBy,
    getRunnerBy,
    cleanPathway,
    cleanRunner,
    pageShowAlert
};
