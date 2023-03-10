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

const MenuItem = props => {
    const {className, cssModule, innerRef, tag: Tag, ...attributes} = props

    const classes = mapToCssModules(classNames("menu-item", className), cssModule)

    return <Tag {...attributes} ref={innerRef} className={classes}/>
}

MenuItem.propTypes = propTypes
MenuItem.defaultProps = defaultProps

export default MenuItem
