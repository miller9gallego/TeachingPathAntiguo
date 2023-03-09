import { Badge, Button, Dropdown, Portlet, RichList } from "@panely/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Router from "next/router";

import swalContent from "sweetalert2-react-content";
import Swal from "@panely/sweetalert2";
import Spinner from "@panely/components/Spinner";
import { deletePathway, getMyPathways, publishPathway, unpublushPathway, updateFollowUp, } from "consumer/pathway";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { pageShowAlert } from "store/actions";
import { groupBy } from "components/helpers/array";

const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

class PathwaysComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: null };
    }

    componentDidMount() {
        const { pageShowAlert } = this.props;
        getMyPathways(
            (data) => {
                this.setState({ data: groupBy(data.data, "teachingPath") });
                this.props.cleanPathway();
            },
            () => {
                pageShowAlert("Error en obtener el form", "error");
            }
        );
    }

    onPublishPathway(pathwayId) {
        const { pageShowAlert } = this.props;

        publishPathway(
            pathwayId,
            (dta) => {
                this.componentDidMount();
                pageShowAlert("Pathway publicado correctamente.");
            },
            (error) => {
                pageShowAlert(error, "error");
            }
        );
    }

    toggleFollowUp(pathway) {
        updateFollowUp(pathway.id, !pathway?.isFollowUp).then(() => {
            this.componentDidMount();
            if (!pathway?.isFollowUp) {
                this.props.pageShowAlert("Pathway con seguimiento");
            } else {
                this.props.pageShowAlert("Pathway sin seguimiento");
            }
        });
    }

    onUnpublishPathway(pathwayId) {
        const { pageShowAlert } = this.props;

        pageShowAlert("Despublicando form, espere un momento...");
        unpublushPathway(pathwayId)
            .then(() => {
                this.componentDidMount();
            })
            .catch(() => {
                pageShowAlert("Error en la despublicación", "error");
            });
    }

    onDelete(pathwayId) {
        swal
            .fire({
                title: "¿Estas seguro/segura?",
                text: "¡No podrás revertir esto!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "¡Sí, bórralo!",
            })
            .then((result) => {
                if (result.value) {
                    const { pageShowAlert } = this.props;
                    deletePathway(pathwayId)
                        .then(() => {
                            this.componentDidMount();
                        })
                        .catch((error) => {
                            console.error("Error removing document: ", error);
                            pageShowAlert("Error al tratar de eliminar el form", "error");
                        });
                }
            });
    }

    render() {
        return (
            <Portlet className="rounded">
                <Portlet.Header>
                    <Portlet.Icon>
                        <FontAwesomeIcon icon={SolidIcon.faRoute} />
                    </Portlet.Icon>
                    <Portlet.Title>Pathways</Portlet.Title>
                    <Portlet.Addon>
                        <Button
                            onClick={() => {
                                Router.push("/pathway/create");
                            }}
                        >
                            Nuevo
                        </Button>
                        <Button className="ml-2" onClick={() => {
                            Router.push("/catalog")
                        }}>
                            Catálogo
                        </Button>
                    </Portlet.Addon>
                </Portlet.Header>
                <Portlet.Body className="list">
                    <RichList bordered action>
                        {this.state.data === null && <Spinner />}
                        {this.state.data && this.state.data.length === 0 && (
                            <p className="text-center">
                                No hay pathways.
                                <br />
                                Te invito a crear tu primer pathway{" "}
                                <a href="/pathway/create">aquí</a>
                            </p>
                        )}
                        {this.state.data &&
                            Object.keys(this.state.data).map((group, index) => {
                                return (
                                    <div key={index}>
                                        <h4>{group}</h4>
                                        {this.state.data[group].map((pathway, index) => {
                                            const {
                                                name,
                                                description,
                                                id,
                                                draft,
                                                isFollowUp,
                                                level,
                                            } = pathway;
                                            return (
                                                <RichList.Item key={index}>
                                                    <RichList.Content
                                                        onClick={() => {
                                                            Router.push({
                                                                pathname: "/pathway/edit",
                                                                query: { pathwayId: id },
                                                            });
                                                        }}
                                                    >
                                                        <RichList.Title
                                                            children={
                                                                <>
                                                                    {isFollowUp && (
                                                                        <FontAwesomeIcon
                                                                            className="mr-2"
                                                                            icon={SolidIcon.faEye}
                                                                        />
                                                                    )}
                                                                    {name.toUpperCase()}

                                                                </>
                                                            }
                                                        />
                                                        <RichList.Subtitle children={description} />
                                                        <RichList.Subtitle
                                                            children={
                                                                <>
                                                                    <Badge>{level}</Badge>{" "}
                                                                    {draft ? (
                                                                        <Badge variant="label-info">
                                                                            En borrador
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="label-success">
                                                                            Publicado
                                                                        </Badge>
                                                                    )}
                                                                </>

                                                            }
                                                        />
                                                    </RichList.Content>
                                                    <RichList.Addon addonType="append">
                                                        {this.getAddon(id, pathway)}
                                                    </RichList.Addon>
                                                </RichList.Item>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                    </RichList>
                </Portlet.Body>
            </Portlet>
        );
    }

    getAddon(id, pathway) {
        return (
            <>
                {/* BEGIN Dropdown */}
                <Dropdown.Uncontrolled>
                    <Dropdown.Toggle icon variant="text-secondary">
                        <FontAwesomeIcon icon={SolidIcon.faCog} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu right animated>
                        <Dropdown.Item
                            onClick={() => {
                                Router.push({
                                    pathname: "/pathway/edit",
                                    query: { pathwayId: id },
                                });
                            }}
                            icon={<FontAwesomeIcon icon={SolidIcon.faEdit} />}
                        >
                            Editar
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                this.onDelete(id);
                            }}
                            icon={<FontAwesomeIcon icon={SolidIcon.faTrashAlt} />}
                        >
                            Eliminar
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            onClick={() => {
                                Router.push({
                                    pathname: "/pathway/edit",
                                    query: { pathwayId: id },
                                });
                            }}
                            icon={<FontAwesomeIcon icon={SolidIcon.faRunning} />}
                        >
                            Agregar Ruta
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                Router.push({
                                    pathname: "/pathway/trophy",
                                    query: { pathwayId: id },
                                });
                            }}
                            icon={<FontAwesomeIcon icon={SolidIcon.faTrophy} />}
                        >
                            Agregar Trofeo
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                Router.push({
                                    pathname: "/pathway/group",
                                    query: { pathwayId: id },
                                });
                            }}
                            icon={<FontAwesomeIcon icon={SolidIcon.faObjectGroup} />}
                        >
                            Agregar Sala
                        </Dropdown.Item>
                        {pathway.draft ? (
                            <Dropdown.Item
                                onClick={() => this.onPublishPathway(id)}
                                icon={<FontAwesomeIcon icon={SolidIcon.faShareSquare} />}
                            >
                                Publicar
                            </Dropdown.Item>
                        ) : (
                            <Dropdown.Item
                                onClick={() => this.onUnpublishPathway(id)}
                                icon={<FontAwesomeIcon icon={SolidIcon.faStop} />}
                            >
                                Despublicar
                            </Dropdown.Item>
                        )}
                        {pathway.draft === false && (
                            <Dropdown.Item
                                onClick={() => {
                                    this.toggleFollowUp(pathway);
                                }}
                                icon={
                                    <FontAwesomeIcon
                                        icon={
                                            pathway.isFollowUp
                                                ? SolidIcon.faEyeSlash
                                                : SolidIcon.faEye
                                        }
                                    />
                                }
                            >
                                {pathway.isFollowUp ? "Quitar seguimiento" : "Seguimiento"}
                            </Dropdown.Item>
                        )}

                        {pathway.draft === false && (
                            <Dropdown.Item
                                onClick={() => {
                                    Router.push({
                                        pathname: "/catalog/pathway/",
                                        query: { id: id },
                                    });
                                }}
                                icon={<FontAwesomeIcon icon={SolidIcon.faThList} />}
                            >
                                Catálogo
                            </Dropdown.Item>
                        )}
                    </Dropdown.Menu>
                </Dropdown.Uncontrolled>
            </>
        );
    }
}

function mapDispathToProps(dispatch) {
    return bindActionCreators({ pageShowAlert }, dispatch);
}

export default connect(null, mapDispathToProps)(PathwaysComponent);
