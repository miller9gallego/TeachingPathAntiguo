import { Modal } from "@panely/components";
import { updateToDraft } from "../../../consumer/pathway";
import RunnerForm from "./RunnerForm";
import React from "react";
import { create, getRunner, update } from "../../../consumer/runner";

class RunnerSaveModal extends React.Component {
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
        const { runnerId } = this.props;
        if (runnerId) {
            this.loadData();
        }
    }
    toggle = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };

    loadData() {
        const { pathwayId, runnerId } = this.props;
        return getRunner(
            pathwayId,
            runnerId,
            (data) => {
                this.setState({
                    data: { ...data, runnerId },
                });
            },
            () => {
            }
        );
    }


    onCreate(data) {
        const { loadRunner, pathwayId } = this.props;
        return create(pathwayId, data)
            .then((docRef) => {
                this.setState({
                    data: {
                        pathwayId,
                        saved: true,
                        runnerId: docRef.id,
                        ...data,
                    }
                });
                return updateToDraft(pathwayId);
            }).then(() => {
                loadRunner();
                this.setState({ isOpen: false, data: null });

            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    }

    onEdit(data) {
        const { loadRunner, runnerId, pathwayId } = this.props;
        return update(runnerId, data)
            .then((docRef) => {
                return updateToDraft(pathwayId);
            }).then(() => {
                this.setState({ isOpen: false, data: null });
                this.loadData();
                loadRunner();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    }

    onSave(data) {
        const { runnerId } = this.props;
        if (runnerId) {
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
                <div style={{ cursor: "pointer" }} onClick={this.toggle}>
                    {children}
                </div>
                <Modal scrollable isOpen={this.state.isOpen} className="modal-xl">
                    <Modal.Header toggle={this.toggle}>{title}</Modal.Header>
                    <Modal.Body className={"p-4"}>

                        <RunnerForm onSave={this.onSave} disableCancel={true} data={this.state.data} />
                    </Modal.Body>

                </Modal>
            </React.Fragment>
        );
    }
}

export default RunnerSaveModal;
