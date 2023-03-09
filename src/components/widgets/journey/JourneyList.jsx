import { Button, Dropdown, Input, Portlet, RichList } from "@panely/components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import Router from "next/router";
import { firestoreClient } from "components/firebase/firebaseClient";
import Progress from "@panely/components/Progress";
import { deleteJourney, getJourneysAndPathwaysByUser } from "consumer/journey/journey";
import Swal from "@panely/sweetalert2";
import swalContent from "sweetalert2-react-content";



const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

class JourneyListComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: [], filter: [] };
    }

    componentDidMount() {
        this.getDataJourney()
    }

    componentDidUpdate(prevProps) {
        if (this.props.updateJourney !== prevProps.updateJourney) {
            this.getDataJourney()
        }
    }

    getDataJourney() {
        getJourneysAndPathwaysByUser(this.props.user)
            .then(data => {
                this.setState({ data: data });
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }

    onDelete(id) {
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
                    deleteJourney(id).then(() => {
                        this.componentDidMount();
                    });
                }
            });
    }

    findJourneys(value) {
        const select = this.state.data
            .filter(item => item.name === value);
        this.setState({ filter: this.state.filter.concat(select) });
    }

    clearFilter() {
        this.setState({ filter: [] })
    }

    renderJourneys(stateArray) {
        return stateArray.map((data, index) => {
            const { name, description, progress, id, pathwayId } = data;

            return (
                <RichList.Item key={index}>
                    <RichList.Content
                        onClick={() => {
                            Router.push({
                                pathname: "/pathway/resume",
                                query: {
                                    id: id,
                                    pathwayId: pathwayId,
                                },
                            });
                        }}
                    >
                        <RichList.Title
                            children={
                                <Progress
                                    striped
                                    variant="secondary"
                                    className="mr-2 mb-2"
                                    value={progress.toFixed(2)}
                                >
                                    {progress.toFixed(2)}%
                                </Progress>
                            }
                        />

                        <RichList.Title children={name} />
                        <RichList.Subtitle children={description} />
                    </RichList.Content>
                    <RichList.Addon addonType="append">
                        <Button
                            onClick={() => {
                                Router.push({
                                    pathname: "/catalog/journey",
                                    query: {
                                        id: id,
                                    },
                                });
                            }}
                        >
                            Ir al Journey
                        </Button>
                        <Button
                            type="button"
                            className="ml-2"
                            onClick={() => {
                                this.onDelete(id);
                            }}
                        >
                            <FontAwesomeIcon icon={SolidIcon.faTrash} />
                        </Button>
                    </RichList.Addon>
                </RichList.Item>
            );
        })
    }


    render() {
        return (
            <Portlet className="rounded">
                <Portlet.Header>
                    <Portlet.Icon>
                        <FontAwesomeIcon icon={SolidIcon.faRoute} />
                    </Portlet.Icon>
                    <Portlet.Title>Pathways</Portlet.Title>
                    <Portlet.Addon className="w-50 d-flex justify-content-end">
                        <Dropdown.Uncontrolled className="mr-2 ">

                            <Dropdown.Toggle caret variant="primary" >
                                <span className="catalog-desktop">Buscar</span>
                                <FontAwesomeIcon className="catalog-mobile" icon={SolidIcon.faFilter} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu animated className="dropdown-scroll" >
                                {this.state.data.map((item, index) => {
                                    const { name } = item;
                                    return <Dropdown.Item
                                        key={index}
                                        onClick={() =>
                                            this.findJourneys(name)}
                                        disabled={this.state.filter.some(item => item.name === name) ?
                                            true : false}
                                    >
                                        {name}
                                    </Dropdown.Item>
                                })}
                                <Dropdown.Divider />
                                <Dropdown.Item
                                    onClick={() => this.clearFilter()}
                                >
                                    Limpiar filtro
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Uncontrolled>
                        <Button
                            onClick={() => {
                                Router.push("/catalog");
                            }}
                        >
                            Catálogo
                        </Button>
                    </Portlet.Addon>
                </Portlet.Header>
                <Portlet.Body>
                    {/* BEGIN Rich List */}
                    <RichList bordered action>
                        {this.state.data.length === 0 && (
                            <p className="text-center">
                                No hay pathways iniciados. <br />Te invito a buscar dentro del
                                catalogo de pathways <a href="/catalog">aquí</a>
                            </p>
                        )}
                        {this.state.filter.length > 0 ?
                            this.renderJourneys(this.state.filter)
                            :
                            this.renderJourneys(this.state.data)}

                    </RichList>
                    {/* END Rich List */}
                </Portlet.Body>
            </Portlet>
        );
    }
}

export default JourneyListComponent;
