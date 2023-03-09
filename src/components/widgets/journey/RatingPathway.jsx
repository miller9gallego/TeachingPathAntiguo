import { Progress, Card, Col, Row, Spinner } from "@panely/components";
import React from "react"
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Rating from '@material-ui/lab/Rating'
import { getQualify, getQualifySubscribe } from 'consumer/pathway'
import Router from "next/router";
import Divider from '@material-ui/core/Divider';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { timeAgo } from "short-time-ago";
import swalContent from "sweetalert2-react-content";
import Swal from "@panely/sweetalert2";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useState } from "react";
import QualifyPathwayModal from "./QualifyPathwayModal";
import { useEffect } from "react";

const ReactSwal = swalContent(Swal);
const usersSwal = ReactSwal.mixin({
  title: 'Comentarios y Opiniones',
  showCancelButton: true,
  showConfirmButton: false,
  cancelButtonText: 'Salir'
})
class RatingPathway extends React.Component {
  state = { data: {}, unsubscribe: null };
  componentDidMount() {
    this.unsubscribe = getQualifySubscribe(Router.query.id,
      (data) => {
        this.setState({ info: data })
      })
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    if (this.state.info != undefined) {
      const data = this.state.info;
      const totalPoints = [];
      let reduceAverage = 0;
      data.forEach(({ points }) => {
        totalPoints.push(points)
      });
      if (totalPoints.length > 0) {
        reduceAverage = Number(((totalPoints.reduce((a, b) => {
          return a + b;
        })) / totalPoints.length).toFixed(1));
      }
      return (
        <>
          {data.length > 0 ? (
            <Card>
              <Card.Body>
                Comentarios y Opiniones
              </Card.Body>
              <Row>
                <Col md="8">
                  <div>
                    {
                      data.reverse().slice(0, 2).map((group, index) => {
                        const {
                          comment,
                          createAt,
                          points,
                          userName,
                          avatar,
                          userId
                        } = group;
                        return (
                          <CommentsList
                            key={index}
                            comment={comment}
                            createAt={createAt}
                            points={points}
                            userName={userName}
                            avatar={avatar}
                            userId={userId}
                            user={this.props}
                            pathwayId={Router.query.id}
                          />
                        )
                      })
                    }
                  </div>
                  <div className="d-flex justify-content-center ">
                    <a style={{ cursor: 'pointer' }} onClick={() => {
                      usersSwal.fire({
                        html: (
                          <div className="h-100">
                            {data.map((group) => {
                              const {
                                comment,
                                createAt,
                                points,
                                userName,
                                avatar,
                                userId
                              } = group;
                              return (
                                <CommentsList
                                  key={group.userId}
                                  comment={comment}
                                  createAt={createAt}
                                  points={points}
                                  userName={userName}
                                  avatar={avatar}
                                  userId={userId}
                                  user={this.props}
                                  pathwayId={Router.query.id}
                                />
                              )
                            })}
                          </div>
                        ),
                        padding: "1.5em",
                        customClass: {
                          popup: "h-100 justify-content-between",
                          htmlContainer: "h-100",
                          content: "h-75 overflow-auto scroll",
                        },
                      })
                    }}>Ver más comentarios</a>
                  </div>
                </Col>
                <Col md="4" >
                  <div className="d-flex  flex-column ml-4">
                    < >
                      <div className="d-flex flex-row align-items-center">
                        <Typography component="legend" variant="h3">{reduceAverage}</Typography>
                        <Typography component="legend" >{[totalPoints.length, '-Opiniones']}</Typography>
                      </div>
                      <Rating name="read-only" value={reduceAverage} readOnly precision={0.5} size="large" />
                    </>
                    <div className="w-100">
                      {[5, 4, 3, 2, 1].map((starPoints, index) => {
                        return <div className="d-flex" key={index}>
                          <Progress value={totalPoints.filter((star) =>
                            star == starPoints).length}
                            max={totalPoints.length}
                            size="sm" className="mt-1 w-75"
                            variant="warning" /><Typography >{starPoints} <FontAwesomeIcon className="mr-2" icon={SolidIcon.faStar} /></Typography>
                        </div>
                      })}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          ) :
            (
              <div className="d-flex justify-content-center">
                <p>
                  Aún no hay comentarios disponibles.
                </p>
              </div>
            )
          }
        </>
      )
    } else {
      return (
        <></>
      )
    }
  }
}

const CommentsList = (props) => {
  const { comment, createAt, points, userName, avatar, userId, user, pathwayId } = props
  const [isOpen, setIsOpen] = useState(false)

  const updateComment = () => {
    setIsOpen(!isOpen)
  }

  const openModalQualify = () => {
    setIsOpen(!isOpen)
  }
  return (
    <>
      {user.user && (
        <List >
          <ListItem alignItems="flex-start">
            <ListItemAvatar>
              <Avatar alt="avatar" src={avatar} />
            </ListItemAvatar>
            <ListItemText
              primary={userName}
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                    {comment}
                  </Typography>
                  <Divider />
                  <div className="d-flex justify-content-between">
                    {timeAgo(createAt.toDate(), new Date())}
                    {userId === user.user.uid && (
                      <a className="update-qualify-text" onClick={updateComment}>
                        Editar Comentario
                      </a>
                    )}
                  </div>
                </React.Fragment>}
            />
            <Rating name="read-only" value={points} readOnly precision={0.5} />
          </ListItem>
        </List>
      )}
      {isOpen && (
        <QualifyPathwayModal
          isOpenModal={openModalQualify}
          pathwayId={pathwayId}
          user={user.user}
        />
      )}
    </>
  )
}

function mapDispathToProps(dispatch) {
  return bindActionCreators(
    {},
    dispatch
  );
}

function mapStateToProps(state) {
  return {
    user: state.user,
  }
}

export default connect(
  mapStateToProps,
  mapDispathToProps
)(RatingPathway)