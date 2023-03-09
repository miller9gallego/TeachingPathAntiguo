import { Button, Dropdown, } from "@panely/components";


import { addFeedback } from "consumer/user";
import Marker from "@panely/components/Marker";
import { escapeHtml, } from "components/helpers/mapper";
import { sendFeedback } from "consumer/sendemail";
import swalContent from "sweetalert2-react-content";
import Swal from "@panely/sweetalert2";

 
const ReactSwal = swalContent(Swal);

// Set SweetAlert options
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

 class Calification extends React.Component {
    handleClick = (score, title) => {
        const { review, id, trackName } = this.props.data;
        swal
            .fire({
                title: trackName.toUpperCase(),
                text: title,
                input: "textarea",
                inputValue: review || "",
                inputAttributes: {
                    autocapitalize: "off",
                },
                showCancelButton: true,
                confirmButtonText: "Enviar",
                showLoaderOnConfirm: true,
                preConfirm: (feedback) => {
                    const responseId = id;
                    return addFeedback(responseId, feedback, score)
                        .then(() => {
                            const { track, runnerName, response } = this.props.data;
                            const title = escapeHtml(runnerName + "/" + track);
                            const email = this.props.user.email;
                            const replyTo = this.props.leaderUser.email;
                            return sendFeedback(
                                email,
                                title,
                                response,
                                feedback,
                                replyTo,
                                score
                            ).then(() => {
                                return "Se envio el feedback correctamente.";
                            });
                        })
                        .catch((error) => {
                            swal.showValidationMessage(`Existe un error: ${error}`);
                        });
                },
                allowOutsideClick: () => !swal.isLoading(),
            })
            .then((result) => {
                if (result.value) {
                    swal.fire({
                        title: result.value,
                    });
                }
            });
    };

    render() {
        const { review } = this.props.data;

        return (
            <div>
                <Dropdown.Uncontrolled>
                    <Dropdown.Toggle caret size="sm" className="float-right">
                        Calificar como:
                        {review && (
                            <Button.Marker>
                                <Marker type="dot" variant="success" />
                            </Button.Marker>
                        )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item
                            href={() => {
                            }}
                            onClick={() => {
                                this.handleClick(
                                    "insufficient",
                                    "Calificación INSUFICIENTE +10pts"
                                );
                            }}
                        >
                            <span>Insuficiente</span>
                            <span className="float-right">⭐️</span>
                        </Dropdown.Item>
                        <Dropdown.Item
                            href={() => {
                            }}
                            onClick={() => {
                                this.handleClick("regular", "Calificación REGULAR +20pts");
                            }}
                        >
                            <span>Regular</span>
                            <span className="float-right">⭐️⭐️</span>
                        </Dropdown.Item>
                        <Dropdown.Item
                            href={() => {
                            }}
                            onClick={() => {
                                this.handleClick("acceptable", "Calificación ACEPTABLE +30pts");
                            }}
                        >
                            <span>Aceptable</span>

                            <span className="float-right">⭐️⭐️⭐️</span>
                        </Dropdown.Item>
                        <Dropdown.Item
                            href={() => {
                            }}
                            onClick={() => {
                                this.handleClick("good", "Calificación BIEN +40pts");
                            }}
                        >
                            <span>Bien</span>
                            <span className="float-right">⭐️⭐️⭐️⭐️</span>
                        </Dropdown.Item>
                        <Dropdown.Item
                            href={() => {
                            }}
                            onClick={() => {
                                this.handleClick("excellent", "Calificación EXCELENTE +50pts");
                            }}
                        >
                            <span className="mr-3">Excelente</span>
                            <span className="float-right">⭐️⭐️⭐️⭐️⭐️</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Uncontrolled>
            </div>
        );
    }
}


export default Calification