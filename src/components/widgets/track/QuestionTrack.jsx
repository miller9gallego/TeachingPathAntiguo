import {
    Accordion,
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Collapse,
    FloatLabel,
    Form,
    Input,
    Label,
    Row,
    Timeline,
} from "@panely/components";
import {firebaseClient} from "components/firebase/firebaseClient";
import {Controller, useForm} from "react-hook-form";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers";
import {deleteResponseById, getTracksResponses, saveTrackResponse} from "consumer/track";
import {useState} from "react";
import {activityMapper, linkGroup, linkTrack,} from "components/helpers/mapper";
import {getUser} from "consumer/user";
import swalContent from "sweetalert2-react-content";
import Swal from "@panely/sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons"


const ReactSwal = swalContent(Swal);
const swal = ReactSwal.mixin({
    customClass: {
        confirmButton: "btn btn-label-success btn-wide mx-1",
        cancelButton: "btn btn-label-danger btn-wide mx-1",
    },
    buttonsStyling: false,
});

function QuestionForm({onSave, value}) {
    const [load, setLoad] = useState(null);
    const def = (value.length > 0 )? value[0].answer : '';
    const schema = yup.object().shape({
        answer: yup
            .string()
            .min(5, "Ingrese al menos 5 caracteres")
            .required("Por favor escriba su respuesta"),
    });

    const {control, errors, handleSubmit, reset} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            answer: def ,
        },
    });
    return (
        <Form
            onSubmit={handleSubmit((data) => {
                setLoad(true);
                onSave(data).then(() => {
                    //reset();
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
                                id="answer"
                                name="answer"
                                control={control}
                                invalid={Boolean(errors.answer)}
                                placeholder="Ingrese su respuesta aquí"
                            />
                            <Label for="name">Respuesta</Label>
                            {errors.answer && (
                                <Form.Feedback children={errors.answer.message}/>
                            )}
                        </FloatLabel>
                    </Form.Group>
                </Col>
                <Col sm="12" className="mb-3" >
                    <Button
                        type="submit"
                        variant="primary"
                        className="ml-2"
                        disabled={load}
                    >
                        Responder Pregunta
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

class Questions extends React.Component {
    state = {activeCard: null, list: [], showTimeline:false};

    toggle = (id) => {
        if (this.state.activeCard === id) {
            this.setState({activeCard: null, showTimeline: false});
        } else {
            this.setState({activeCard: id, showTimeline: false});
        }
    };

    componentDidMount() {
        const {
            data: {id},
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
                console.log("Error al obtener la respuesta");
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
        const {activeCard} = this.state;
        const {
            data: {questions = [], id, description},
            group,
            journeyId,
            sendAnswer,
            
        } = this.props;
        const user = this.props.user || firebaseClient.auth().currentUser;
        const value = this.props.value !== undefined ? this.props.value : [];
        return (
            <Accordion>
                <div dangerouslySetInnerHTML={{__html: description}}></div>
                {questions.map((question, index) => {
                    const responseOk = this.state.list.some( el => (el.index === index && el.userId === user.uid));
                    return (
                        <Card key={"myquestions" + index}>
                            <Card.Header
                                title="Click para expandir y ver el formulario de respuesta"
                                collapsed={!(activeCard === index)}
                                onClick={() => this.toggle(index)}
                            >
                                <Card.Title>{question.name}</Card.Title>
                                {responseOk &&
                                <Card.Icon>
                                    <FontAwesomeIcon icon={SolidIcon.faCheckCircle} color={'green'}></FontAwesomeIcon>
                                </Card.Icon>}
                            </Card.Header>
                            <Collapse isOpen={activeCard === index}>
                                <Card.Body>
                                    {user && (
                                        <QuestionForm
                                            value={value.length > 0 ? value.filter(answer => answer.index === index) : []}
                                            onSave={(data) => {
                                                return getUser(user.uid).then((dataUser) => {
                                                    data.name = question.name;
                                                    data.user = {
                                                        displayName:
                                                            dataUser.data.firstName +
                                                            " " +
                                                            dataUser.data.lastName,
                                                        email: dataUser.data.email,
                                                        image: dataUser.data.image,
                                                    };
                                                    data.index = index;
                                                    return saveTrackResponse(
                                                        id,
                                                        group,
                                                        data,
                                                        question.id
                                                    ).then(() => {
                                                        if (this.props.activityChange) {
                                                            this.props.activityChange(
                                                                activityMapper(
                                                                    "new_track_response",
                                                                    linkTrack(
                                                                        this.props.data.id,
                                                                        this.props.data.runnerId,
                                                                        this.props.data.name,
                                                                        "Nueva respuesta al questionario __LINK__ "
                                                                    ),
                                                                    linkGroup(
                                                                        journeyId,
                                                                        user,
                                                                        linkTrack(
                                                                            this.props.data.id,
                                                                            this.props.data.runnerId,
                                                                            this.props.data.name,
                                                                            "ha escrito una nueva respuesta para el questionario __LINK__ "
                                                                        )
                                                                    ),
                                                                    this.props.group,
                                                                    2
                                                                )
                                                            );
                                                        }
                                                        this.setState({showTimeline: true})
                                                        setTimeout(() => {
                                                            this.componentDidMount();
                                                        }, 400);
                                                        {data.index === (questions.length -1)?sendAnswer(): ''}
                                                        
                                                    });
                                                });
                                            }}
                                        />
                                    )}

                                    {(this.state.showTimeline || responseOk)  && (<Timeline className="">
                                        {this.state.list
                                            .filter((q) => q.index === index)
                                            .map((data, index) => {
                                                const {date, answer, userId, id} = data;
                                                return (
                                                    <Timeline.Item
                                                        key={index}
                                                        date={date}
                                                        pin={
                                                            <Avatar circle display>
                                                                <img
                                                                    src={data.user.image}
                                                                    alt={data.user.displayName || "user"}
                                                                    title={data.user.displayName}
                                                                />
                                                            </Avatar>
                                                        }
                                                    >   
                                                    <div className="timeline-text">
                                                        <p className="mb-2">{answer}</p>
                                                        {user.uid === userId && (
                                                            <div><Badge
                                                                href="javascript:void(0)"
                                                                onClick={() => {
                                                                    this.onDelete(id);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={SolidIcon.faTrash}
                                                                />
                                                            </Badge></div>
                                                        )}
                                                    </div>
                                                    </Timeline.Item>
                                                );
                                            })}
                                    </Timeline>)}
                                </Card.Body>
                            </Collapse>
                        </Card>
                    );
                })}
            </Accordion>
        );
    }
}

export default Questions;
