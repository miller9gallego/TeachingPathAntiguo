import { Badge, Button, Chat, Col, Container, Row, Spinner, Widget1, Input, Form, InputGroup, Alert, } from "@panely/components";
import { activityChange, breadcrumbChange, pageChangeHeaderTitle, pageShowAlert, } from "store/actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import withLayout from "components/layout/withLayout";
import Head from "next/head";
import { useCollectionData } from "react-firebase-hooks/firestore";
import withAuth from "components/firebase/firebaseWithAuth";
import Router from "next/router";
import React, { useRef, useEffect, useState } from "react";
import { getRoom } from "consumer/journey/journey";
import { firebaseClient, firestoreClient } from "components/firebase/firebaseClient";
import { timeAgo } from "short-time-ago";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWeixin } from "@fortawesome/free-brands-svg-icons";

class JourneyGeneralPage extends React.Component {
  state = { pathwayId: null, room: null };

  componentDidMount() {
    if (!Router.query.pathwayId) {
      Router.push("/catalog");
    }
    this.props.pageChangeHeaderTitle("Pathways");
    this.props.breadcrumbChange([
      { text: "Catálogo", link: "/catalog" },
      {
        text: "Journey",
        link: "/catalog/pathway?id=" + Router.query.pathwayId,
      },
      { text: "Chat" },
    ]);
    this.setState({
      pathwayId: Router.query.pathwayId,
      room: Router.query.room,
    });
    this.readMessages(Router.query.pathwayId, Router.query.room)
  }

  readMessages = (pathway, room) => {
    firestoreClient.collection("messages").doc(pathway).collection(room)
      .get().then(({ docs }) => {
        if (this.props.user) {
          this.verifyUserMessages(docs, this.props.user)
        }
      })
  }

  verifyUserMessages = (messages, user) => {
    messages.map((element) => {
      element.data().usersRead.map((userRead) => {
        if (userRead !== user.uid) {
          this.updateUsersRead(user.uid, element.id)
        }
      })
    })
  }

  updateUsersRead = (userId, docId) => {
    firestoreClient.collection("messages").doc(this.state.pathwayId).collection(this.state.room).doc(docId)
      .update({ usersRead: firebaseClient.firestore.FieldValue.arrayUnion(userId) })
      .then()
  }

  render() {
    if (!this.state.pathwayId) {
      return <Spinner className="mr-2" />;
    }
    return (
      <React.Fragment>
        <Head>
          <title>Journey | Chat</title>
        </Head>

        <Container fluid>
          <Row portletFill="xl" style={{ margin: "-15px -15px 10px -15px", height: "100%" }}>
            <Col xl="12">
              <Widget1 fluid className="h-100" >
                <Widget1.Body className="h-100" >
                  <ChatRoom user={this.props.user} {...this.state} />
                </Widget1.Body>
              </Widget1>
            </Col>
          </Row>
        </Container>
      </React.Fragment>
    );
  }
}

const updateUsersRead = (userId, messages, pathway, room) => {
  messages.map(({ id }) => {
    firestoreClient.collection("messages").doc(pathway).collection(room).doc(id)
      .update({ usersRead: firebaseClient.firestore.FieldValue.arrayUnion(userId) })
  })
}

const ChatRoom = ({ user, room, pathwayId }) => {
  const messageRef = getRoom(pathwayId, room);
  const query = messageRef.orderBy("createdAt").limitToLast(30);
  const [messages] = useCollectionData(query, { idField: "id" });
  const dummy = useRef();

  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    if (user && messages) {
      updateUsersRead(user.uid, messages, pathwayId, room)
    }
  }, [messages])

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: "smooth" });
  });

  const sendMessage = async (e) => {
    e.preventDefault();
    await messageRef.add({
      text: formValue,
      createdAt: firebaseClient.firestore.FieldValue.serverTimestamp(),
      usersRead: [user.uid],
      ...user,
    });

    setFormValue("");
  };

  return (
    <main className="h-100 d-flex flex-column justify-content-end">
      {messages && (messages.length === 0) &&
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
          <Alert variant={"label-dark"}
            icon={<FontAwesomeIcon icon={faWeixin} size={'lg'} />}><h2>¡No hay mensajes por aquí, se el primero!</h2></Alert>
        </div>}
      <div >
        {messages &&
          messages.map((msn) => (
            <ChatMessage key={msn.id} message={msn} user={user} />
          ))}
      </div>
      <div>
        <Form onSubmit={sendMessage}>
          <Row form className="align-items-center">
            <Col xs="8">
              <Input
                value={formValue}
                onChange={(e) => {
                  setFormValue(e.target.value);
                }}
                type="text"
                placeholder="Escribe el mensaje"
              />
            </Col>

            <Col>
              <Button type="submit" disabled={!formValue} variant="primary">
                Enviar
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
      <span ref={dummy}></span>
    </main>
  );
};

const ChatMessage = ({ message, user }) => {
  const { text, uid, image, displayName, profile, createdAt } = message;
  const messageOrderClass = uid === user.uid ? "right" : "left";
  const time = timeAgo(createdAt ? createdAt.toDate() : new Date(), new Date());

  return (
    <Chat>
      <Chat.Item align={messageOrderClass}>
        <Chat.Avatar display circle>
          <img src={image} alt={profile} />
        </Chat.Avatar>
        <Chat.Content >
          <Chat.Author>{displayName}</Chat.Author>
          <Chat.Bubble>{text}</Chat.Bubble>
          <Chat.Time>{time}</Chat.Time>
        </Chat.Content>
      </Chat.Item>
    </Chat>
  );
};
function mapDispathToProps(dispatch) {
  return bindActionCreators(
    { pageChangeHeaderTitle, breadcrumbChange, activityChange, pageShowAlert },
    dispatch
  );
}

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

export default connect(
  mapStateToProps,
  mapDispathToProps
)(withAuth(withLayout(JourneyGeneralPage)));
