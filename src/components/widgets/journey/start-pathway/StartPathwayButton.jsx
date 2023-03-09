import { Button, Modal, RichList, Spinner } from '@panely/components';
import Swal from '@panely/sweetalert2';
import { firestoreClient } from 'components/firebase/firebaseClient';
import React, { Component } from 'react'
import swalContent from 'sweetalert2-react-content'

const ReactSwal = swalContent(Swal);

const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

export class StartPathwayButton extends React.Component {
    state = { isOpen: false, data: [] };

    toggle = () => this.setState({ isOpen: !this.state.isOpen });

    componentDidMount() {
        firestoreClient
            .collection("pathways")
            .doc(this.props.pathwayId)
            .get()
            .then((doc) => {
                const groups = doc.data()?.groups || [];
                this.setState({ ...this.state, data: groups });
            });
    }

    onSubmitPathwayGroup = () => {
        swal
            .fire({
                title: "Seleccione una sala",
                input: "text",
                inputAttributes: {
                    autocapitalize: "off",
                },
                showCancelButton: true,
                confirmButtonText: "Buscar",
                showLoaderOnConfirm: true,
                preConfirm: (group) => {
                    return Promise.resolve({
                        groups: this.state.data,
                        group: this.state.data.filter(
                            (g) => g.name === group || g.slug === group
                        ),
                        status: this.state.data.some(
                            (g) => g.name === group || g.slug === group
                        ),
                    });
                },
                allowOutsideClick: () => !swal.isLoading(),
            })
            .then((result) => {
                if (result.value && result.value.status) {
                    this.props.onStart(result.value.group[0].slug);
                } else {
                    swal.fire({
                        icon: "error",
                        title: "Oops...",
                        text: "La sala no existe para este pathway.",
                    });
                }
            });
    };

    render() {
        return (
            <>
                <div className="d-flex justify-content-center">
                    <Button onClick={this.toggle} className="w-50 btn-light">
                        Iniciar Pathway
                    </Button>
                </div>
                <Modal isOpen={this.state.isOpen} toggle={this.toggle}>
                    <Modal.Header toggle={this.toggle}>Selecciona una sala</Modal.Header>
                    <Modal.Body>
                        <p className="mb-0">
                            {this.props.loading && <Spinner className="mr-2" />}
                            Seleccione una sala para trabajar el pathway como grupo
                        </p>
                        <RichList bordered action>
                            {this.state.data === null && <Spinner className="mr-2" />}

                            {this.state.data && this.state.data.length === 0 && (
                                <p className="text-center">No existe salas para este pathway</p>
                            )}
                            {this.state.data
                                .filter((item) => item.isPrivate !== true)
                                .map((data, index) => {
                                    const { name, slug } = data;
                                    return (
                                        <RichList.Item key={index}>
                                            <RichList.Content
                                                onClick={() => {
                                                    this.props.onStart(slug);
                                                }}
                                            >
                                                <RichList.Title children={name.toUpperCase()} />
                                            </RichList.Content>
                                        </RichList.Item>
                                    );
                                })}
                        </RichList>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="primary"
                            className="mr-2"
                            onClick={this.onSubmitPathwayGroup}
                        >
                            Ingrese una sala privada
                        </Button>
                        <Button variant="outline-danger" onClick={this.toggle}>
                            Cancelar
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* END Modal */}
            </>
        );
    }
}

export default StartPathwayButton