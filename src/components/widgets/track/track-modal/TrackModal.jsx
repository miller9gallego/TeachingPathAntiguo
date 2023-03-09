import { firestoreClient } from "components/firebase/firebaseClient";
import Button from "@panely/components/Button";
import Countdown, { zeroPad } from "react-countdown";
import { timeShortPowerTen } from "components/helpers/time";
import { getTrack } from "consumer/track";
import Swal from "@panely/sweetalert2";
import swalContent from "sweetalert2-react-content";
import Prism from "@panely/tinymce/prism";

import ContentModal from "./ContentModal";

const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

class TrackModal extends React.Component {
    minutes = 0;
    countdownRef = null;

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            dataTime: "00:00",
            isRunning: props.isRunning || false,
            wait: false,
            isCompleted: false,
        };
        this.countdownRef = React.createRef();
        this.answered = this.answered.bind(this)
    }

    componentDidMount() {
        setTimeout(() => {
            document.querySelectorAll("pre").forEach((el) => {
                Prism.highlightElement(el);
            });
        }, 600);
    }
    componentDidUpdate() {
        document.querySelectorAll("pre").forEach((el) => {
            Prism.highlightElement(el);
        });
    }

    toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
        if (!this.state.isOpen) {
            this.loadData();
        }
    };

    loadData() {
        const { pathwayId, runnerId, trackId } = this.props;

        getTrack(pathwayId, runnerId, trackId, (data) => {
            this.setState({
                isOpen: true,
                isRunning: true,
                isCompleted: (data.type === 'learning') ? true : false,
                ...data,
            });
        },
            () => {
                console.log("Error al obtener La lección");
            }
        );
    }

    renderer = ({ hours, minutes, seconds, completed, total }) => {
        const { runnerIndex, trackIndex, journeyId, runners } = this.props;
        if (completed) {
            if (this.minutes === 0) {
                const element = this.countdownRef?.current;
                this.setState({
                    ...this.state,
                    isRunning: false,
                    wait: true,
                });
                swal
                    .fire({
                        title: "¡Tu tiempo ha terminado!",
                        text: "¿Quieres agregar 5 minutos mas para completar la lección?",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Sí",
                    })
                    .then((result) => {
                        if (result.value === true) {
                            element.state.timeDelta.minutes = 5;
                            element.start();
                            this.minutes = 5;
                            const data = {
                                breadcrumbs: runners,
                            };
                            data.breadcrumbs[runnerIndex].tracks[trackIndex].time = 300000;
                            data.breadcrumbs[runnerIndex].tracks[trackIndex].isRunning = true;

                            firestoreClient
                                .collection("journeys")
                                .doc(journeyId)
                                .update(data)
                                .then((docRef) => {
                                    this.setState({
                                        ...this.state,
                                        isRunning: true,
                                        time: 300000,
                                        wait: false,
                                        dataTime: zeroPad(hours) + ":" + zeroPad(this.minutes),
                                    });
                                });
                        }
                    });
            }

            return <span> 00:00:00 h</span>;
        } else {
            if (minutes !== this.minutes) {
                this.minutes = minutes;
                const data = {
                    breadcrumbs: runners,
                };

                if (this.props.isSequential) {
                    data.breadcrumbs[runnerIndex].tracks[trackIndex].time = total;
                    data.breadcrumbs[runnerIndex].tracks[trackIndex].isRunning = true;
                } else {
                    const newBreadCrumbs = data.breadcrumbs.map((bread, index) => {
                        if (index === runnerIndex) {
                            const newTrack = bread.tracks.map((track, index) => {
                                if (index === trackIndex) {
                                    track.time = total
                                    track.isRunning = true
                                    return track
                                }

                                if (track.status === "finish") {
                                    return track
                                }

                                track.status = "wait"
                                return track
                            })
                            bread.tracks = newTrack
                            return bread
                        }
                        const newTrack = bread.tracks.map((track, index) => {
                            if (track.status === "finish") {
                                return track
                            }

                            track.status = "wait"
                            return track
                        })
                        bread.tracks = newTrack
                        return bread
                    })
                    data.breadcrumbs = newBreadCrumbs
                }

                firestoreClient
                    .collection("journeys")
                    .doc(journeyId)
                    .update(data)
                    .then((docRef) => {
                        this.props.updateStateTracks()
                        this.setState({
                            ...this.state,
                            dataTime: zeroPad(hours) + ":" + zeroPad(minutes),
                        });
                    });
            }
            return (
                <span>
                    Entrar [{zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)} h]
                </span>
            );
        }
    };

    answered() {
        this.setState({ ...this.state, isCompleted: true });
    }


    render() {
        const { name, type, isRunning, timeLimit, dataTime } = this.state;
        const {
            onComplete,
            tracksLength,
            trackIndex,
            journeyId,
            group,
            activityChange,
            runners,
            runnerIndex
        } = this.props;
        const time = this.state.time || this.props.time;
        const titleButton = timeLimit
            ? "Tiempo limite[" + timeShortPowerTen(timeLimit) + "]"
            : "Inicia la lección";
        const date = this.countdownRef?.current?.props?.date
            ? this.countdownRef?.current?.props?.date
            : Date.now() + time;

        return (
            <React.Fragment>
                <Button title={titleButton} onClick={this.toggle}>
                    {(isRunning && (
                        <Countdown
                            ref={this.countdownRef}
                            date={date}
                            renderer={this.renderer}
                        />
                    )) ||
                        (this.state.wait ? <>Stop [00:00:00 h]</> : <>Iniciar</>)}
                </Button>
                <ContentModal
                    isOpen={this.state.isOpen}
                    trackIndex={trackIndex}
                    tracksLength={tracksLength}
                    toggle={this.toggle}
                    name={name}
                    state={this.state}
                    group={group}
                    journeyId={journeyId}
                    activityChange={activityChange}
                    answered={this.answered}
                    type={type}
                    references={this.state.references}
                    dataTime={dataTime}
                    isCompleted={this.state.isCompleted}
                    complete={this.complete}
                    runners={runners}
                    runnerIndex={runnerIndex}
                    onComplete={onComplete}
                    isSequential={this.props.isSequential}
                />
            </React.Fragment>
        );
    }
}

export default TrackModal;