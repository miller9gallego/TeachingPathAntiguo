import {Avatar, Dropdown, RichList} from "@panely/components";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";
import {ReactSortable} from "react-sortablejs";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Router from "next/router";
import Badge from "@panely/components/Badge";

import Swal from "@panely/sweetalert2";
import swalContent from "sweetalert2-react-content";
import Spinner from "@panely/components/Spinner";
import {deleteTrack, updateTrackLevel} from "consumer/track";
import {timeConvert, timePowerTen, timeShortPowerTen,} from "components/helpers/time";
import TrackSaveModal from "./TrackSaveModal";

const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

class TrackList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            loaded: false,
        };
        this.onSortList = this.onSortList.bind(this);
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            count: this.props.count,
            data: this.props.data.map((item) => ({
                id: item.id,
                title: item.name,
                subtitle: item.description,
                type: item.type,
                time: item.timeLimit,
                typeContent: item.typeContent,
            })),
            loaded: true,
        });

    }

    onDelete(trackId) {
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
                    deleteTrack(this.props.runnerId, trackId).then(() => {
                        this.setState({
                            ...this.state,
                            data: this.state.data.filter(a => a.id !==trackId),
                            loaded: true,
                        });
                        this.props.loadRunner();
                    });
                }
            });
    }

    componentWillReceiveProps(nextProps){
        if (this.props.count !== nextProps.count) {
            this.setState({
                ...this.state,
                count: nextProps.count,
                data: nextProps.data.map((item) => ({
                    id: item.id,
                    title: item.name,
                    subtitle: item.description,
                    type: item.type,
                    time: item.timeLimit,
                    typeContent: item.typeContent,
                })),
            });
        }
    }

    onSortList(list) {
        list.forEach((item, level) => {
            updateTrackLevel(this.props.runnerId, item.id, level);
        });
        this.setState({data: list});
    }

    render() {
        const estimation = this.state.data
            .map((el) => el.time)
            .reduce((a, b) => a + b, 0);

        return (
            <RichList bordered action className="list">
                {this.state.loaded === false && <Spinner>loading...</Spinner>}
                {this.state.loaded === true && this.state.data.length === 0 && (
                    <p className="text-center">No hay lecciones.<br/>Te invito a crear tu primera lección de
                        aprendizaje.</p>
                )}
                {this.state.data.length >= 1 && (
                    <p>
                        Tiempo estimado aproximadamente:{" "}
                        <strong>{timeConvert(timePowerTen(estimation))}</strong>
                    </p>
                )}

                <ReactSortable list={this.state.data} setList={this.onSortList}>
                    {this.state.data.map((data, index) => {
                        const indexRunner = this.props.indexRunner;
                        const pathwayId = this.props.pathwayId;
                        const runnerId = this.props.runnerId;

                        const {title, subtitle, typeContent, type, id, time} = data;
                        const titleHeader = (indexRunner + 1) + "." + (index + 1) + ". " + title

                        return (

                            <RichList.Item
                                className="d-flex align-items-start"
                            >
                                <RichList.Addon addonType="prepend">
                                    <Avatar display>
                                        <FontAwesomeIcon icon={SolidIcon.faSort}/>
                                    </Avatar>
                                </RichList.Addon>
                                <TrackSaveModal key={"tracks" + index}
                                                trackId={id}
                                                runnerId={runnerId}
                                                title={titleHeader}
                                                loadRunner={() => {
                                                    this.props.loadRunner();
                                                    this.componentDidMount();
                                                }}
                                                pathwayId={pathwayId}>
                                    <RichList.Content>

                                        <RichList.Title>
                                            {titleHeader}
                                        </RichList.Title>
                                        <RichList.Subtitle dangerouslySetInnerHTML={{__html:subtitle}}></RichList.Subtitle>
                                        <RichList.Subtitle>
                                            <Badge variant="label-info">{type}</Badge>
                                            <Badge variant="label-info" className="ml-2">
                                                {typeContent}
                                            </Badge>
                                            <Badge variant="label-success" className="ml-2">
                                                {timeShortPowerTen(time)}
                                            </Badge>
                                        </RichList.Subtitle>
                                    </RichList.Content>
                                </TrackSaveModal>
                                <RichList.Addon addonType="append">
                                    <Dropdown.Uncontrolled>
                                        <Dropdown.Toggle icon variant="text-secondary">
                                            <FontAwesomeIcon icon={SolidIcon.faCog}/>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu right animated>

                                            <Dropdown.Item
                                                onClick={() => {
                                                    this.onDelete(id);
                                                }}
                                                icon={<FontAwesomeIcon icon={SolidIcon.faTrashAlt}/>}
                                            >
                                                Eliminar
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                onClick={() => {
                                                    Router.push({
                                                        pathname: "/catalog/track",
                                                        query: {
                                                            id: id,
                                                            runnerId: this.props.runnerId,
                                                            pathwayId: this.props.pathwayId,
                                                        },
                                                    });
                                                }}
                                                icon={<FontAwesomeIcon icon={SolidIcon.faBook}/>}
                                            >
                                                Vista previa
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Uncontrolled>
                                </RichList.Addon>
                            </RichList.Item>

                        );
                    })}
                </ReactSortable>
            </RichList>
        );
    }
}

export default TrackList;
