import React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import {mapToCssModules, refPropType, tagPropType} from "./utils"

const propTypes = {
    className: PropTypes.string,
    cssModule: PropTypes.object,
    innerRef: refPropType,
    tag: tagPropType
}

const defaultProps = {
    tag: "div"
}

const SidemenuBody = props => {
    const {className, cssModule, innerRef, tag: Tag, ...attributes} = props

    const classes = mapToCssModules(classNames("sidemenu-body", className), cssModule)

    return <Tag {...attributes} ref={innerRef} className={classes}/>
}

SidemenuBody.propTypes = propTypes
SidemenuBody.defaultProps = defaultProps

export default SidemenuBody
