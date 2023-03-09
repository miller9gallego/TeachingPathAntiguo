import {Modal} from "@panely/components";
import TrackForm from "./TrackForm";
import {create, getTrack, updateTrack} from "../../../consumer/track";
import {updateToDraft} from "../../../consumer/pathway";

class TrackSaveModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            data: null,
        };
        this.onEdit = this.onEdit.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onSave = this.onSave.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        const { trackId} = this.props;
        if(trackId){
            this.loadData();
        }
    }
    toggle = () => {
        this.setState({isOpen: !this.state.isOpen});
    };

    loadData() {
        const {pathwayId, runnerId, trackId} = this.props;
        return getTrack(
            pathwayId,
            runnerId,
            trackId,
            (data) => {
                this.setState({
                    data: data,
                });
            },
            () => {
            }
        );
    }

    onCreate(data) {
        const {runnerId, loadRunner, pathwayId} = this.props;
        return create(runnerId, data)
            .then((docRef) => {
                return updateToDraft(pathwayId);
            })
            .then(() => {
                this.toggle();
                loadRunner();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    }

    onEdit(data) {
        const {pathwayId, loadRunner, runnerId, trackId} = this.props;

        return updateTrack(runnerId, trackId, data)
            .then(() => {
                return updateToDraft(pathwayId);
            }).then(() => {
                this.toggle();
                this.loadData();
                loadRunner();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    }

    onSave(data){
        const { trackId} = this.props;
        if(trackId){
            return this.onEdit(data);
        } else {
            return this.onCreate(data);
        }
    }

    render() {
        const {
            title,
            children,
        } = this.props;
        return (
            <React.Fragment>
                <div style={{cursor: "pointer"}} onClick={this.toggle}>
                  {children}
                </div>
                <Modal scrollable isOpen={this.state.isOpen} className="modal-xl">
                    <Modal.Header toggle={this.toggle}>{title}</Modal.Header>
                    <Modal.Body className={"p-4"}>
                        <TrackForm
                            onExtend={() => {}}
                            onSave={this.onSave}  disableCancel={true} data={this.state.data}
                        />
                    </Modal.Body>

                </Modal>
            </React.Fragment>
        );
    }
}

export default TrackSaveModal;
