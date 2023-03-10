import { Avatar, Badge, Button, Card, FloatLabel, Form, Input, Label, Timeline, } from "@panely/components";
import { firebaseClient } from "components/firebase/firebaseClient";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers";
import Row from "@panely/components/Row";
import Col from "@panely/components/Col";
import ReactPlayer from "react-player";
import DescribeURL from "@panely/components/DescribePage";
import { deleteResponseById, getTracksResponses, saveTrackResponse, } from "consumer/track";
import { activityMapper, linkGroup, linkify, linkTrack, } from "components/helpers/mapper";
import { useState } from "react";
import { getUser } from "consumer/user";
import swalContent from "sweetalert2-react-content";
import Swal from "@panely/sweetalert2";
import { sendNotifyResponseHacking } from "consumer/sendemail";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";


const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

function SolutionForm({onSave, value}) {
    const [load, setLoad] = useState(null);
    const def = (value.length > 0 )? value[0].solution : '';
    const schema = yup.object().shape({
        solution: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor ingrese su solución"),
    });

    const { control, errors, handleSubmit, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            solution: def,
        }
    });
    



    return (
        
        <Form
            onSubmit={handleSubmit((data) => {
                setLoad(true);
                onSave(data).then(() => {
                   // reset();
                    setLoad(false);
                });
            })}
        >   
            <Row>
                <Col sm="12">
                    <Form.Group>
                        <FloatLabel>
                            <Controller
                                as={Input}
                                type="textarea"
                                id="solution"
                                name="solution"
                                control={control}
                                invalid={Boolean(errors.solution)}
                                value='hola muyndo'
                                placeholder="Ingrese su solución aquí"
                            />
                            <Label for="name">Mi Solución</Label>
                            {errors.solution && (
                                <Form.Feedback children={errors.solution.message} />
                            )}
                        </FloatLabel>
                    </Form.Group>
                </Col>
                <Col sm="12" className="mb-3">
                    <Button type="submit" variant="primary" disabled={load}>
                        Responder
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

class HackingTrack extends React.Component {
    state = { list: [], showTimeline: false };

    componentDidMount() {
        const {
            data: { id },
            group,
        } = this.props;

        getTracksResponses(
            id,
            group,
            (data) => {
                this.setState({
                    ...this.state,
                    list: data.list,
                });
            },
            () => {
                console.log("Error al intetar conseguir las respuestas");
            }
        );

    }

    onDelete(id) {
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
                    deleteResponseById(id).then(() => {
                        this.componentDidMount();
                    });
                }
            });
    }

    render() {
        const { data, group, journeyId } = this.props;
        const id = data.id;
        const leaderId = data.leaderId;
        const trackName = data.name;
        const user = this.props.user || firebaseClient.auth().currentUser;
        const value = this.props.value !== undefined ? this.props.value : [];
        const typeContent = data?.typeContent;
        let offsetWidth = undefined;
        let offsetHeight = undefined;
        if (document.getElementById('learning-modal')) {
            offsetWidth = document.getElementById('learning-modal').offsetWidth - 60;
            offsetHeight = offsetWidth - offsetWidth * 50 / 100;
        }
        return (
            <>
                {data.guidelines && (
                    <Card>
                        <Card.Header><h5 className="mt-2">Pauta para el hacking</h5></Card.Header>
                        <Card.Body className="content-view">
                            <Card.Text>
                                {
                                    {
                                        file: (
                                            <div
                                                style={{ overflow: "hidden" }}
                                                dangerouslySetInnerHTML={{ __html: data.guidelines }}
                                            />
                                        ),
                                        fileCode: (
                                            <div
                                                className="center"
                                                dangerouslySetInnerHTML={{ __html: data.guidelines }}
                                            />
                                        ),
                                        video: <div><ReactPlayer url={data.guidelines} controls width={offsetWidth} height={offsetHeight} /></div>,
                                        url: <DescribeURL url={data.guidelines} />,
                                    }[typeContent]
                                }
                            </Card.Text>
                        </Card.Body>
                    </Card>
                )}

                {data.criteria && (
                    <Card className="mt-3">
                        <Card.Header>Basado en lo anterior, realizar lo siguiente:</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                <div dangerouslySetInnerHTML={{ __html: data.criteria }} />
                            </Card.Text>
                        </Card.Body>
                    </Card>
                )}

                {user && (
                    <Card>
                        <Card.Header>
                            <h3 className="mt-3">Entregar tu solución</h3>
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Agregue aquí su respuesta del hacking, agregue enlaces,
                                repositorios o comentarios.
                            </Card.Text>
                            <SolutionForm
                                onSave={(data) => {
                                    return getUser(user.uid).then((dataUser) => {
                                        data.user = {
                                            displayName: user.displayName,
                                            email: dataUser.data.email,
                                            image: dataUser.data.image,
                                        };
                                        return saveTrackResponse(id, group, data).then(() => {
                                            if (this.props.activityChange) {
                                                getUser(leaderId).then((leaderData) => {
                                                    this.props.activityChange(
                                                        activityMapper(
                                                            "new_track_response",
                                                            linkTrack(
                                                                this.props.data.id,
                                                                this.props.data.runnerId,
                                                                this.props.data.name,
                                                                "Nueva respuesta al hacking __LINK__ "
                                                            ),
                                                            linkGroup(
                                                                journeyId,
                                                                user,
                                                                linkTrack(
                                                                    this.props.data.id,
                                                                    this.props.data.runnerId,
                                                                    this.props.data.name,
                                                                    "ha escrito una nueva respuesta para el hacking __LINK__ "
                                                                )
                                                            ),
                                                            this.props.group,
                                                            8
                                                        )
                                                    );

                                                    return sendNotifyResponseHacking(
                                                        journeyId,
                                                        user.email,
                                                        user.displayName,
                                                        leaderData.data.email,
                                                        trackName
                                                    );
                                                });
                                            }
                                            this.setState({ current: this.state.current + 1, showTimeline: true });
                                            setTimeout(() => {
                                                this.componentDidMount();
                                            }, 400);
                                            this.props.sendAnswer();
                                        });
                                    });
                                }}
                                
                                value={value}
                            />

                            {this.state.showTimeline && (<Timeline>
                                {this.state.list.map((data, index) => {
                                    const { date, solution, userId, id } = data;

                                    return (
                                      <Timeline.Item
                                        key={"timeline" + index}
                                        date={date}
                                        pin={
                                          <Avatar circle display>
                                            <img
                                              src={data.user.image}
                                              alt="Avatar image"
                                              title={data.user.displayName}
                                            />
                                          </Avatar>
                                        }
                                      >
                                        <div className="timeline-text">
                                          <div
                                            className="mb-2"
                                            dangerouslySetInnerHTML={{
                                              __html: linkify(solution),
                                            }}
                                          />
                                          {user.uid === userId && (
                                            <Badge
                                              href="javascript:void(0)"
                                              onClick={() => {
                                                this.onDelete(id);
                                              }}
                                            >
                                              <FontAwesomeIcon icon={faTrash} />
                                            </Badge>
                                          )}
                                        </div>
                                      </Timeline.Item>
                                    );
                                })}
                            </Timeline>)}
                        </Card.Body>
                    </Card>
                )}
            </>
        );
    }
}

export default HackingTrack;
