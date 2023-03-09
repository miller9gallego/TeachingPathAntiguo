import { Modal } from "@panely/components";
import Button from "@panely/components/Button";
import LearningTrack from "../track/LearningTrack";
import Questions from "../track/QuestionTrack";
import HackingTrack from "../track/HackingTrack";
import { getTrack } from "consumer/track";
import Swal from "@panely/sweetalert2";
import swalContent from "sweetalert2-react-content";
import TrainingTrack from "../track/training-track/TrainingTrack";
import { CertifiedTrack } from "../track/CertifiedTrack";


const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});
class ResponseModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            data: {},
            isSend: false
        };
    }

    toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
        console.log(this.props.value)
    };


    componentDidMount() {
        const { pathwayId, runnerId, id } = this.props;
        getTrack(pathwayId, runnerId, id, (data) => {
            this.setState({
                ...data,
                id: id,
                training: [],
                typeContent: "",
                guidelines: null,
                criteria: null
            });
        },
            () => {
                console.log("Error al obtener La lección");
            }
        );
    }

    answered() {
        this.setState({ ...this.state, isSend: true });
    }

    render() {
        const {
            title,
            type,
            children,
            group,
            journeyId,
            activityChange,
            user,
            badgeType,
            value
        } = this.props;

        return (
            <React.Fragment>
                <span style={{ cursor: "pointer" }} onClick={this.toggle}>
                    {children}
                </span>
                <Modal scrollable isOpen={this.state.isOpen} className="modal-xl">
                    <Modal.Header toggle={this.toggle}>{title}</Modal.Header>
                    <Modal.Body>
                        {
                            {
                                learning: (
                                    <LearningTrack
                                        user={user}
                                        data={this.state}
                                        group={group}
                                        journeyId={journeyId}
                                        activityChange={activityChange}
                                        sendFeddback={() => this.answered()}
                                    />
                                ),
                                questions: (
                                    <Questions
                                        user={user}
                                        data={this.state}
                                        group={group}
                                        journeyId={journeyId}
                                        activityChange={activityChange}
                                        value={value}
                                        sendAnswer={() => this.answered()}
                                    />
                                ),
                                training: (
                                    <TrainingTrack
                                        data={this.state}
                                        group={group}
                                        journeyId={journeyId}
                                        activityChange={activityChange}
                                        value={value}
                                        sendAnswer={() => this.answered()}
                                    />
                                ),
                                hacking: (
                                    <HackingTrack
                                        user={user}
                                        data={this.state}
                                        group={group}
                                        journeyId={journeyId}
                                        activityChange={activityChange}
                                        value={value}
                                        sendAnswer={() => this.answered()}

                                    />
                                ),
                                certified: (
                                    <CertifiedTrack
                                        user={user}
                                        data={this.state}
                                        group={group}
                                        journeyId={journeyId}
                                        activityChange={activityChange}
                                        value={value}
                                        sendAnswer={() => this.answered()}
                                    />
                                )
                            }[type]
                        }
                    </Modal.Body>
                    <Modal.Footer className="bg-yellow">
                        <Button
                            variant="secondary"
                            className="mr-2"
                            title={"Close modal"}
                            onClick={() => {
                                if (badgeType === 'warning') {
                                    !this.state.isSend ?
                                        swal.fire('Recorda enviar tu respuesta')
                                        :
                                        this.toggle();
                                }
                                else {
                                    this.toggle();
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </React.Fragment>
        );
    }
}

export default ResponseModal;
