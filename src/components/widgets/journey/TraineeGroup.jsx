import swalContent from "sweetalert2-react-content";
import Swal from "@panely/sweetalert2";
import { Avatar, AvatarGroup, Portlet, Button, ListGroup } from "@panely/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Spinner from "@panely/components/Spinner";
import { getJourneyByPathwayId } from "consumer/journey/journey";
import Link from "next/link";
import Router from "next/router";
import { firestoreClient } from "components/firebase/firebaseClient";
import ButtonMarker from "@panely/components/ButtonMarker";
import ButtonCounter from "@panely/components/ButtonCounter";
import ListGroupItem from "@panely/components/ListGroupItem";
import { html } from "react-dom-factories";



const ReactSwal = swalContent(Swal);
const usersSwal = ReactSwal.mixin({
  title: 'Lista de aprendices',
  showCancelButton: true,
  showConfirmButton: false,
  cancelButtonText: 'Salir'

})
class TraineeGroup extends React.Component {
  state = { data: [], countMessages: 0, newMessages: 0 };
  unsubscribe = null;

  componentDidMount() {
    getJourneyByPathwayId(
      this.props.pathwayId,
      (result) => {
        this.setState({
          data: result.data.map((r) => {
            return { ...r.user, id: r.userId };
          }),
        });
      },
      () => { }
    );
    this.calculateUnreadMessages();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  firestoreCollection = () => {
    return firestoreClient
      .collection("messages")
      .doc(this.props.pathwayId)
      .collection(this.props.group);
  };

  calculateTotalMessages = () => {
    this.firestoreCollection()
      .get()
      .then(({ docs }) => {
        this.setState({
          countMessages: docs.length,
        });
      });
  };

  calculateUnreadMessages = () => {
    this.unsubscribe = this.firestoreCollection().onSnapshot(({ docs }) => {
      this.countMessagesNew();
      docs.map((element) => {
        this.verifyMessages(element.data().usersRead);
      });
    });
  };

  countMessagesNew = () => {
    this.calculateTotalMessages();
    this.firestoreCollection()
      .where("usersRead", "array-contains", this.props.user.uid)
      .get()
      .then(({ docs }) => {
        if (docs.length != this.state.countMessages) {
          this.setState({
            newMessages: this.state.countMessages - docs.length,
          });
        } else {
          this.setState({
            newMessages: 0,
          });
        }
      });
  };

  verifyMessages = (usersRead) => {
    let isMessagesRead = "";
    usersRead.map((userId) => {
      if (userId === this.props.user.uid) {
        isMessagesRead = "leido";
      }
    });
    if (isMessagesRead === "leido") {
      this.setState({
        countMessages: 0,
      });
    }
  };

  render() {
    return (
      <Portlet>
        <Portlet.Header>
          <Portlet.Icon>
            <FontAwesomeIcon icon={SolidIcon.faUsers} />
          </Portlet.Icon>
          <Portlet.Title>Grupo [{this.props.group}]</Portlet.Title>
        </Portlet.Header>
        <Portlet.Body className="list d-flex flex-wrap">
          {this.state.data.length === 0 && <Spinner />}
          {this.state.data.length > 0 && <UserGroup users={this.state.data} />}
          <Button
            style={{ padding: '8px 24px' }}
            className="float-right m-2"
            onClick={() => {
              Router.push({
                pathname: "/chat",
                query: {
                  pathwayId: this.props.pathwayId,
                  room: this.props.group,
                },
              });
            }}
          >
            {" "}
            <i className="fas fa-comment-alt mr-2"></i> Chat
            <ButtonMarker>
              <ButtonCounter className="badge-danger">
                {this.state.newMessages}
              </ButtonCounter>
            </ButtonMarker>
          </Button>
        </Portlet.Body>
      </Portlet >
    );
  }
}

const UserGroup = (data) => {

  const { users } = data;

  const modalUsers = () => {
    usersSwal.fire({
      html: (
        <div style={{ height: "100%" }}>
          <ListGroup flush>
            {users.map((user, index) => (
              <ListGroupItem
                key={index}
                action
                className="d-flex align-items-center justify-content-start flex-nowrap"
              >
                <Avatar
                  key={index}
                  circle
                  display
                  style={{ cursor: "pointer", margin: "0 20px" }}
                  className="avatar-modal-list"
                >
                  <img
                    src={user.image}
                    alt="Avatar image"
                    title={user.displayName}
                  />
                </Avatar>
                <a href={"/user?uid=" + user.id}>{user.displayName}</a>
              </ListGroupItem>
            ))}
          </ListGroup>
        </div>
      ),
      padding: "1.5em",
      customClass: {
        popup: "h-100 justify-content-between",
        htmlContainer: "h-100",
        content: "h-75 overflow-auto scroll",
      },
    });
  };

  if (users.length > 10) {
    let viewLimit = users.slice(0, 10);

    return (
      <AvatarGroup className="m-2 w-100">
        {viewLimit.map((user, index) => (
          <Avatar key={index} circle display style={{ cursor: "pointer" }} className="avatar-hover">
            <Link href={"/user?uid=" + user.id}>
              <img
                src={user.image}
                alt="Avatar image"
                title={user.displayName}
              />
            </Link>
          </Avatar>
        ))}
        <Avatar
          className="avatar-hover"
          onClick={() => modalUsers()}
          circle
          display
          style={{ cursor: "pointer" }}
        >
          <FontAwesomeIcon title="Ver mas" icon={SolidIcon.faPlus} />
        </Avatar>
      </AvatarGroup>
    );
  } else {
    return (
      <AvatarGroup className="m-2">
        {users.map((user, index) => (
          <Avatar key={index} circle display style={{ cursor: "pointer" }}>
            <Link href={"/user?uid=" + user.id}>
              <img
                src={user.image}
                alt="Avatar image"
                title={user.displayName}
              />
            </Link>
          </Avatar>
        ))}

      </AvatarGroup>
    )
  }


};

export default TraineeGroup;
