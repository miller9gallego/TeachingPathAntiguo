import Steps from "rc-steps";
import { Badge, Button, Card, Marker, Timeline, } from "@panely/components";
import { firebaseClient } from "components/firebase/firebaseClient";
import { deleteResponseById, getTracksResponses, saveTrackResponse } from "consumer/track";
import { activityMapper, linkGroup, linkify, linkTrack, } from "components/helpers/mapper";
import swalContent from "sweetalert2-react-content";
import Swal from "@panely/sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import SolutionForm from "./SolutionForm";
import { useEffect, useState } from "react";

const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

const TrainingTrack = ({ data, group, journeyId, sendAnswer, activityChange, runnerId, name, user, value }) => {
    const [current, setCurrent] = useState(0)
    const [list, setList] = useState([])
    const [userTrack, setUserTrack] = useState(user || firebaseClient.auth().currentUser)
    const [valueTrack, setValueTrack] = useState(value !== undefined ? value : [])
    const [trainings, setTrainings] = useState()
    const [idTrack, setIdTrack] = useState()


    useEffect(() => {
        const { id, training } = data
        getResponse(id, group)
        setTrainings(training)
        setIdTrack(id)
    }, [])

    const getResponse = (trackId, group) => {
        getTracksResponses(
            trackId,
            group,
            (data) => {
                setList(data.list)
            },
            () => {
            }
        );
    }

    const onDelete = (id) => {
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
                    deleteResponseById(id).then((data) => {
                        getResponse(idTrack, group)
                    });
                }
            });
    }


    return (
        <div className="m-2">
            <p>
                En esta lección sigue todos los pasos y complenta por tu cuenta, al
                final entrega el resultado del este Training.
            </p>
            <Steps current={current} direction="vertical">
                {trainings?.map((item, index) => {
                    return (
                        <Steps.Step
                            key={index}
                            title={"Paso#" + (index + 1)}
                            description={
                                <>
                                    {current === index && (
                                        <>
                                            <div dangerouslySetInnerHTML={{ __html: item.name }} />
                                            <Button
                                                onClick={() => setCurrent(element => element + 1)}
                                            >
                                                Hecho
                                            </Button>
                                        </>
                                    )}
                                </>
                            }
                        />
                    );
                })}
                {current >= trainings?.length && (
                    <Steps.Step
                        title={"Resultado de aprendizaje"}
                        description={
                            <div>
                                <Card.Body>
                                    <Card.Text>
                                        Agregue aquí su respuesta de Training, agregue enlaces,
                                        repositorios o comentarios.
                                    </Card.Text>

                                    {userTrack && (
                                        <SolutionForm
                                            value={valueTrack}
                                            onSave={(data) => {
                                                return saveTrackResponse(idTrack, group, data).then(() => {
                                                    if (activityChange) {
                                                        activityChange(
                                                            activityMapper(
                                                                "new_track_response",
                                                                linkTrack(
                                                                    idTrack,
                                                                    runnerId,
                                                                    name,
                                                                    "Nueva respuesta al training __LINK__ "
                                                                ),
                                                                linkGroup(
                                                                    journeyId,
                                                                    userTrack,
                                                                    linkTrack(
                                                                        idTrack,
                                                                        runnerId,
                                                                        name,
                                                                        "ha escrito una nueva respuesta para el training __LINK__ "
                                                                    )
                                                                ),
                                                                group,
                                                                2
                                                            )
                                                        );
                                                    }
                                                    setCurrent(element => element + 1)

                                                    setTimeout(() => {
                                                        getResponse(idTrack, group)
                                                        sendAnswer();
                                                    }, 500);

                                                });
                                            }}
                                        />
                                    )}

                                    {trainings?.length < current && (<Timeline className="">
                                        {list.map((data, index) => {
                                            const { date, result, userId, id } = data;

                                            return (
                                                <Timeline.Item
                                                    key={"timeline" + index}
                                                    date={date}
                                                    pin={<Marker type="dot" />}
                                                >
                                                    <div className="timeline-text">
                                                        <div
                                                            className="mb-2"
                                                            dangerouslySetInnerHTML={{
                                                                __html:
                                                                    linkify(result),
                                                            }}
                                                        />
                                                        {userTrack.uid === userId && (
                                                            <Badge
                                                                href="javascript:void(0)"
                                                                onClick={() => {
                                                                    onDelete(id);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={faTrash}
                                                                />
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Timeline.Item>
                                            );
                                        })}
                                    </Timeline>)}
                                </Card.Body>
                            </div>
                        }
                    />
                )}
            </Steps>
        </div>
    );

}

export default TrainingTrack;
