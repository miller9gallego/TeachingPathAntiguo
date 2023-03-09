import React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import {mapToCssModules, refPropType, tagPropType} from "./utils"

const propTypes = {
    className: PropTypes.string,
    cssModule: PropTypes.object,
    collapsed: PropTypes.bool,
    innerRef: refPropType,
    tag: tagPropType
}

const defaultProps = {
    tag: "div"
}

const CardHeader = props => {
    const {className, cssModule, collapsed, innerRef, tag: Tag, ...attributes} = props

    const classes = mapToCssModules(classNames("card-header", {collapsed}, className), cssModule)

    return <Tag {...attributes} className={classes} ref={innerRef}/>
}

CardHeader.propTypes = propTypes
CardHeader.defaultProps = defaultProps

export default CardHeader
