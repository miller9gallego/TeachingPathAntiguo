import { Alert, Badge, Col, Container, Portlet, Row, Widget1, } from "@panely/components";
import { activityChange, breadcrumbChange, pageChangeHeaderTitle, pageShowAlert, } from "store/actions";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import withLayout from "components/layout/withLayout";
import Head from "next/head";
import Router from "next/router";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import StartPathway from "components/widgets/journey/start-pathway/StartPathway";
import Teacher from "components/widgets/journey/Teacher";
import RatingPathway from "components/widgets/journey/RatingPathway"
import RunnerTab from "components/widgets/journey/RunnerTab";
import { getPathway } from "consumer/pathway";
import DisplayTrophy from "components/widgets/journey/DisplayTrophy";
import { getUser } from "consumer/user";
import { firebaseClient } from "components/firebase/firebaseClient";


class PathwayPage extends React.Component {
    state = {
        name: "Cargando...",
        id: null,
        draft: null,
    };

    constructor(props) {
        super(props);
        this.runnersRef = React.createRef();
    }

    componentDidMount() {
        if (!Router.query.id) {
            Router.push("/catalog");
        }
        const { pageShowAlert } = this.props;
        getPathway(
            Router.query.id,
            async (data) => {
                this.setState(data);
                const currentUser = firebaseClient.auth().currentUser;
                if (currentUser) {
                    const user = await getUser(currentUser.uid);
                    if (user) {
                        this.setState({
                            ...this.state,
                            user: { ...user.data, uid: user.id },
                        });
                    }
                }
            },
            () => {
                pageShowAlert("Existe un problema al consultar el form", "error");
                setTimeout(() => {
                    window.location.reload();
                }, 800);
            }
        );
    }

    render() {
        const { name, id, leaderId, draft, isFollowUp } = this.state;
        return (
            <Widget1>
                <Widget1.Display top size="lg" className="bg-dark text-white">
                    {draft === false && (
                        <StartPathway
                            pathwayId={id}
                            {...this.state}
                            activityChange={this.props.activityChange}
                            pageShowAlert={this.props.pageShowAlert}
                            runnersRef={this.runnersRef}
                        />
                    )}
                    <Widget1.Dialog>
                        <Widget1.DialogContent>
                            <h1 className="display-5">{name.toUpperCase()}</h1>
                            <Badge variant="outline-light" className="mr-1">
                                <FontAwesomeIcon className="mr-2" icon={SolidIcon.faHiking} />
                                {
                                    {
                                        beginner: "Nivel: Principiante",
                                        middle: "Nivel: Intermedio",
                                        advanced: "Nivel: Avanzado",
                                    }[this.state.level]
                                }
                            </Badge>
                            <Badge variant="outline-light" className="mr-1">
                                <FontAwesomeIcon
                                    className="mr-2"
                                    icon={!isFollowUp ? SolidIcon.faEyeSlash : SolidIcon.faEye}
                                />
                                {isFollowUp ? "Con seguimiento" : "Sin seguimiento"}
                            </Badge>
                        </Widget1.DialogContent>
                    </Widget1.Dialog>
                    {draft === false && <DisplayTrophy trophy={this.state.trophy} />}
                    {draft === true && <Badge>Aún no esta disponible este Pathway</Badge>}
                </Widget1.Display>
                <Widget1.Body className="pt-5">
                    <Portlet className="mt-4">
                        <Portlet.Body>
                            <h4>Generalidades del Pathway</h4>
                            {this.state?.longDescription ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: this.state?.longDescription,
                                    }}
                                />
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: this.state?.description,
                                    }}
                                />
                            )}
                            <Row>
                                <Col md="6">
                                    {isFollowUp && (
                                        <Alert
                                            variant="outline-secondary"
                                            icon={<FontAwesomeIcon icon={SolidIcon.faEye} />}
                                        >
                                            Este pathway tiene seguimiento, el mentor
                                            revisará tus resultados y asignará puntos dentro del
                                            mismo.
                                        </Alert>)}
                                </Col>
                                <Col md="6">
                                    {this.state?.startDate && this.state?.endDate ? (
                                        <Alert
                                            variant="outline-secondary"
                                            icon={
                                                <FontAwesomeIcon icon={SolidIcon.faCalendarCheck} />
                                            }
                                        >
                                            {" "}
                                            Este pathway tiene un período de seguimiento y consultoría:<br /> {
                                                new Date(this.state?.startDate).toLocaleDateString()
                                            } {" -  "}
                                            {
                                                new Date(this.state?.endDate).toLocaleDateString()
                                            }
                                        </Alert>
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Row>
                        </Portlet.Body>
                        <Portlet.Header>
                            <Portlet.Icon>
                                <FontAwesomeIcon icon={SolidIcon.faRoute} />
                            </Portlet.Icon>
                            <Portlet.Title>Rutas</Portlet.Title>
                        </Portlet.Header>
                        <Portlet.Body>
                            {id && (
                                <>
                                    <RunnerTab ref={this.runnersRef} pathwayId={this.state.id} />
                                </>
                            )}
                        </Portlet.Body>
                        <Portlet.Footer>
                            <Row>
                                <Col md="6">{leaderId && <Teacher leaderId={leaderId} />}</Col>
                                <Col md="6"> <RatingPathway /></Col>
                            </Row>

                        </Portlet.Footer>
                    </Portlet>
                </Widget1.Body>
            </Widget1>
        );
    }
}

class PathwayGeneralPage extends React.Component {
    componentDidMount() {
        this.props.pageChangeHeaderTitle("Pathway");
        this.props.breadcrumbChange([
            { text: "Catálogo", link: "/catalog" },
            { text: "Pathway" },
        ]);
    }

    render() {
        return (
            <React.Fragment>
                <Head>
                    <title>Pathway | Teaching Path</title>
                    <script src="/script.js"></script>
                </Head>
                <Container fluid>
                    <Row portletFill="xl" style={{ margin: "-15px" }}>
                        <Col xl="12">
                            <PathwayPage
                                activityChange={this.props.activityChange}
                                pageShowAlert={this.props.pageShowAlert}
                            />
                        </Col>
                    </Row>
                </Container>
            </React.Fragment>
        );
    }
}

function mapDispathToProps(dispatch) {
    return bindActionCreators(
        { pageChangeHeaderTitle, breadcrumbChange, activityChange, pageShowAlert },
        dispatch
    );
}

export default connect(
    null,
    mapDispathToProps
)(withLayout(PathwayGeneralPage, "public"));
