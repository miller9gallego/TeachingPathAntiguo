import { Button, } from "@panely/components";

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


class Review extends React.Component {
    handleClick = () => {
        const { review, id, trackName } = this.props.data;
        swal
            .fire({
                title: trackName.toUpperCase(),
                text: "Realizar una retroalimentación",
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
                    return addFeedback(responseId, feedback)
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
                                replyTo
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
            <Button onClick={this.handleClick} size={"sm"} className="float-right">
                Hacer retroalimentación
                {review && (
                    <Button.Marker>
                        <Marker type="dot" variant="success" />
                    </Button.Marker>
                )}
            </Button>
        );
    }
}

export default Review