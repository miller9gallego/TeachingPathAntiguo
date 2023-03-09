import {Avatar, Badge, Col, Dropdown, RichList, Row, Button} from "@panely/components";
import {ReactSortable} from "react-sortablejs";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Router from "next/router";

import Swal from "@panely/sweetalert2";
import swalContent from "sweetalert2-react-content";
import Spinner from "@panely/components/Spinner";
import {deleteRunner, getRunners, updateLevel} from "consumer/runner";
import {getTracks} from "consumer/track";
import {timeConvert, timePowerTen, timeShortPowerTen,} from "components/helpers/time";
import Accordion from "@panely/components/Accordion";
import Collapse from "@panely/components/Collapse";
import RunnerSaveModal from "./RunnerSaveModal";
import TrackList from "./TrackList";
import TrackSaveModal from "./TrackSaveModal";

const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

class RunnerList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: props.data || [],
            loaded: false,
            activeCard: -1,
        };

        this.onSortList = this.onSortList.bind(this);
    }

    componentDidMount() {
        this.setState({loaded: false});
        getRunners(
            this.props.pathwayId,
            async (data) => {
                const list = [];
                for (const item of data.list) {
                    const tracks = await getTracks(item.id);
                    const estimation = tracks
                        .map((el) => el.timeLimit)
                        .reduce((a, b) => a + b, 0);
                    list.push({
                        id: item.id,
                        title: item.name,
                        pathwayId: item.pathwayId,
                        subtitle: item.description,
                        tracks: tracks,
                        estimation: estimation,
                        badge: item.badge,
                    });
                }
                this.setState({
                    ...this.state,
                    loaded: true,
                    data: list,
                });
            },
            () => {
            }
        );
    }

    onSortList(list) {
        list.forEach((item, level) => {
            updateLevel(item.id, level);
        });
        this.setState({data: list});
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.item?.runnerId !== nextProps.item?.runnerId) {
            this.componentDidMount();
        }
        return true;
    }

    toggleAccordion = (id) => {
        if (this.state.activeCard === id) {
            this.setState({...this.state, activeCard: null});
        } else {
            this.setState({...this.state, activeCard: id});
        }
    };

    render() {
        const estimation = this.state.data
            .map((el) => el.estimation)
            .reduce((a, b) => a + b, 0);
        const activeCard = this.state.activeCard;
        return (
            <RichList bordered action>
                {this.state.loaded === false && <Spinner/>}
                {this.state.loaded === true && this.state.data.length === 0 && (
                    <p className="text-center">
                        Aún no hay rutas. <br/> Te invito a crear la primera RUTA para este
                        pathway{" "}
                    </p>
                )}
                {this.state.data.length >= 1 && (
                    <p>
                        Tiempo estimado aproximadamente:{" "}
                        <strong>{timeConvert(timePowerTen(estimation))}</strong>
                    </p>
                )}
                <ReactSortable
                    list={this.state.data}
                    setList={this.onSortList}
                    className="list"
                >
                    {this.state.data.map((data, index) => {
                        const {
                            title,
                            subtitle,
                            id,
                            pathwayId,
                            tracks,
                            estimation,
                            badge,
                        } = data;
                        const titleHeader = (index + 1) + ". " + title + " [" + timeShortPowerTen(estimation) + "]";
                        return (

                            <RichList.Item key={"runner" + index}
                                           className="d-flex align-items-start"
                            >
                                <RichList.Addon addonType="prepend">
                                    <Avatar display>
                                        <FontAwesomeIcon icon={SolidIcon.faSort}/>
                                    </Avatar>
                                </RichList.Addon>
                                <RichList.Content>
                                    <RunnerSaveModal
                                        key={"edit-runner-"+id}
                                        pathwayId={pathwayId}
                                        runnerId={id}
                                        title={titleHeader}
                                        loadRunner={() => {
                                            this.componentDidMount();
                                        }}
                                    >
                                        <RichList.Title
                                            title={'Click en la ruta para ver "' + title + '"'}

                                        >
                                            {badge && (
                                                <FontAwesomeIcon
                                                    icon={SolidIcon.faCheckCircle}
                                                    className="mr-2"
                                                />
                                            )}
                                            {titleHeader}
                                        </RichList.Title>
                                        <RichList.Subtitle>
                                            <Row>
                                                {badge && (
                                                    <Col md="1">
                                                        <img
                                                            alt="badge"
                                                            title={badge.name}
                                                            style={{width: "60px"}}
                                                            src={badge.image}
                                                        />
                                                    </Col>
                                                )}

                                                <Col md="11" dangerouslySetInnerHTML={{__html:subtitle}} > 
                                                
                                                </Col>
                                            </Row>
                                        </RichList.Subtitle>
                                    </RunnerSaveModal>
                                    <Accordion>
                                        <TrackSaveModal
                                            trackId={null}
                                            pathwayId={pathwayId}
                                            runnerId={id}
                                            title={"Nueva lección"}
                                            loadRunner={() => {
                                                this.componentDidMount();
                                            }}
                                        >
                                            <Badge
                                                className={"ml-2"}
                                                title="Click para nueva lección"

                                                style={{cursor: "pointer", float: "right"}}
                                            >
                                                <FontAwesomeIcon icon={SolidIcon.faPlus}/>
                                            </Badge>
                                        </TrackSaveModal>

                                        <Badge
                                            style={{cursor: "pointer", float: "right"}}
                                            title="Click para expandir o ocultar"
                                            onClick={() => this.toggleAccordion(index)}
                                        >
                                            {!(activeCard === index) ? "Ver" : "Ocultar"} las
                                            lecciones ({tracks.length})
                                        </Badge>

                                        <br/> <br/>
                                        <Collapse isOpen={activeCard === index}>
                                            <TrackList                                            
                                                count={tracks.length}
                                                data={tracks}
                                                indexRunner={index}
                                                runnerId={id}
                                                loadRunner={() => {
                                                    this.componentDidMount()
                                                }}
                                                pathwayId={pathwayId}
                                            />
                                        </Collapse>
                                    </Accordion>
                                </RichList.Content>
                                <AddonRunner pathwayId={pathwayId} id={id} update={() => {
                                    this.componentDidMount()
                                }}/>
                            </RichList.Item>
                        );
                    })}
                </ReactSortable>
                <RunnerSaveModal
                    key={"new-runner"}
                    pathwayId={this.props.pathwayId}
                    runnerId={null}
                    title={"Nueva Ruta"}
                    loadRunner={() => {
                        this.componentDidMount();
                    }}
                >
                    <Button
                        type="button"
                        className="float-right mt-5"            
                    >
                        Agregar ruta
                        <FontAwesomeIcon className="ml-2" icon={SolidIcon.faPlus}/>
                    </Button>
                </RunnerSaveModal>
            </RichList>
        );
    }
}

const AddonRunner = ({id, pathwayId, update}) => {
    const onDelete = (runnerId) => {
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
                    deleteRunner(runnerId).then(() => {
                        update(pathwayId);
                    });
                }
            });
    };
    return (
        <RichList.Addon addonType="append">
            <Dropdown.Uncontrolled>
                <Dropdown.Toggle icon variant="text-secondary">
                    <FontAwesomeIcon icon={SolidIcon.faCog}/>
                </Dropdown.Toggle>
                <Dropdown.Menu right animated>

                    <Dropdown.Item
                        onClick={() => {
                            onDelete(id);
                        }}
                        icon={<FontAwesomeIcon icon={SolidIcon.faTrashAlt}/>}
                    >
                        Eliminar
                    </Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item
                        onClick={() => {
                            Router.push({
                                pathname: "/runner/quiz/create",
                                query: {
                                    runnerId: id,
                                    pathwayId: pathwayId,
                                },
                            });
                        }}
                        icon={<FontAwesomeIcon icon={SolidIcon.faQuestion}/>}
                    >
                        Agregar quiz
                    </Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => {
                            Router.push({
                                pathname: "/runner/badge",
                                query: {
                                    runnerId: id,
                                    pathwayId: pathwayId,
                                },
                            });
                        }}
                        icon={<FontAwesomeIcon icon={SolidIcon.faTrophy}/>}
                    >
                        Agregar emblema
                    </Dropdown.Item>

                </Dropdown.Menu>
            </Dropdown.Uncontrolled>
        </RichList.Addon>
    );
};

export default RunnerList;
