import {Button, Col, Container, Dropdown, Portlet, Row,} from "@panely/components";
import {breadcrumbChange, loadPathway, pageChangeHeaderTitle,} from "store/actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import withLayout from "components/layout/withLayout";
import withAuth from "components/firebase/firebaseWithAuth";
import Head from "next/head";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Router from "next/router";
import RunnerList from "../../components/widgets/form/RunnerList";
import PathwayForm from "../../components/widgets/form/PathwayForm";
import Spinner from "@panely/components/Spinner";
import React from "react";
import {publishPathway, update, updateFollowUp} from "consumer/pathway";
import {pageShowAlert} from "store/actions/pageAction";
import RunnerSaveModal from "../../components/widgets/form/RunnerSaveModal";


class FormBasePage extends React.Component {
    constructor(props) {
        super(props);
        this.onEdit = this.onEdit.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onPublishPathway = this.onPublishPathway.bind(this);
        this.toggleFollowUp = this.toggleFollowUp.bind(this);

    }

    componentDidMount() {
        if (!Router.query.pathwayId) {
            Router.push("/pathway/create");
        }
        this.props.pageChangeHeaderTitle("Actualizar");
        this.props.breadcrumbChange([
            {text: "Home", link: "/"},
            {text: "Pathway"},
        ]);
    }


    toggleFollowUp() {
        const pathway = this.state || this.props.pathway;
        updateFollowUp(pathway.id, !pathway?.isFollowUp).then(() => {
            this.setState({
                ...this.state,
                ...pathway,
                isFollowUp: !pathway?.isFollowUp
            });
            if (!pathway?.isFollowUp) {
                this.props.pageShowAlert("Pathway con seguimiento");
            } else {
                this.props.pageShowAlert("Pathway sin seguimiento");
            }
        })
    }

    onEdit(data) {
        const pathway = this.state || this.props.pathway;
        const {pageShowAlert, loadPathway} = this.props;
        if (data.draft === false) {
            this.onPublishPathway(pathway.id);
        }
        return update(pathway.id, data)
            .then((response) => {
                pageShowAlert("Pathway actualizado correctamente");
                loadPathway({
                    pathwayId: pathway.id,
                    ...response,
                });
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                pageShowAlert("Existe problemas en la actualizaci??n", "error");
            });
    }

    onPublishPathway(pathwayId) {
        const {pageShowAlert} = this.props;
        publishPathway(pathwayId, (dta) => {
                this.componentDidMount();
            },
            (error) => {
                pageShowAlert(error, "error");
            }
        );
    }

    render() {
        const pathway = this.state || this.props.pathway;
        if (!pathway?.id) {
            return <Spinner>Cargando...</Spinner>;
        }
        return (
            <React.Fragment>
                <Head>
                    <title>Pathway | Edit</title>
                </Head>
                <Container fluid>
                    <Row>
                        <Col md="4">
                            <Portlet>
                                <Portlet.Header bordered>
                                    <Portlet.Title
                                        title={pathway.name || "Editar"}>{pathway.name || "Editar"}</Portlet.Title>
                                    <Portlet.Addon>
                                        <PathwayAddon id={pathway.id}
                                                      toggleFollowUp={this.toggleFollowUp}
                                                      isFollowUp={pathway.isFollowUp}/>
                                    </Portlet.Addon>
                                </Portlet.Header>
                                <Portlet.Body>
                                    <PathwayForm
                                        onSave={this.onEdit}
                                        pathwayId={pathway.id}
                                        saved={pathway.saved}
                                        data={pathway}
                                    />
                                </Portlet.Body>
                                <Portlet.Footer>
                                    <Button
                                        type="button"
                                        className="float-right mr-2"
                                        onClick={() => {
                                            Router.push({
                                                pathname: "/pathway/trophy",
                                                query: {pathwayId: pathway.id},
                                            });
                                        }}
                                    >
                                        Agregar Trofeo
                                        <FontAwesomeIcon className="ml-2" icon={SolidIcon.faPlus}/>
                                    </Button>
                                </Portlet.Footer>
                            </Portlet>
                        </Col>
                        <Col md="8">
                            <Portlet>
                                <Portlet.Header bordered>
                                    <Portlet.Title>Rutas</Portlet.Title>
                                </Portlet.Header>
                                <Portlet.Body>
                                    <RunnerList pathwayId={pathway.id}/>
                                </Portlet.Body>                                
                            </Portlet>
                        </Col>
                    </Row>
                </Container>
            </React.Fragment>
        );
    }
}

const PathwayAddon = ({id, toggleFollowUp, isFollowUp}) => {
    return (
        <>
            <Dropdown.Uncontrolled>
                <Dropdown.Toggle icon variant="text-secondary">
                    <FontAwesomeIcon icon={SolidIcon.faEllipsisV}/>
                </Dropdown.Toggle>
                <Dropdown.Menu right animated>
                    
                    <Dropdown.Item
                        onClick={() => {

                            Router.push({
                                pathname: "/pathway/trophy",
                                query: {pathwayId: id},
                            });
                        }}
                        icon={<FontAwesomeIcon icon={SolidIcon.faTrophy}/>}
                    >
                        Agregar Trofeo
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            Router.push({
                                pathname: "/pathway/group",
                                query: {pathwayId: id},
                            });
                        }}
                        icon={<FontAwesomeIcon icon={SolidIcon.faObjectGroup}/>}
                    >
                        Agregar Sala
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            toggleFollowUp();
                        }}
                        icon={<FontAwesomeIcon icon={SolidIcon.faEye}/>}
                    >
                        {isFollowUp ? "Quita" : "Hacer"} Seguimiento
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            Router.push({
                                pathname: "/catalog/pathway",
                                query: {
                                    id: id,
                                },
                            });
                        }}
                        icon={<FontAwesomeIcon icon={SolidIcon.faBook}/>}
                    >
                        Vista Previa
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Uncontrolled>
        </>
    );
};

function mapDispathToProps(dispatch) {
    return bindActionCreators(
        {pageChangeHeaderTitle, breadcrumbChange, loadPathway, pageShowAlert},
        dispatch
    );
}

function mapStateToProps(state) {
    return {
        pathway: state.pathway.pathwaySeleted,
    };
}

export default connect(
    mapStateToProps,
    mapDispathToProps
)(withAuth(withLayout(FormBasePage)));
