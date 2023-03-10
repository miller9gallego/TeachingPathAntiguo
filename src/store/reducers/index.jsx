import {combineReducers} from "redux"
import breadcrumbReducer from "./breadcrumbReducer"
import sidemenuReducer from "./sidemenuReducer"
import firebaseReducer from "./firebaseReducer"
import userReducer from "./userReducer"
import pathwayReducer from "./pathwayReducer"
import pageReducer from "./pageReducer"
import asideReducer from "./asideReducer"

// Concatenate all reducers
const reducers = combineReducers({
    sidemenu: sidemenuReducer,
    breadcrumb: breadcrumbReducer,
    firebase: firebaseReducer,
    user: userReducer,
    page: pageReducer,
    aside: asideReducer,
    pathway: pathwayReducer
})

export default reducers
