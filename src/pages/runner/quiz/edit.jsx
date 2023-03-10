import {Button, Col, Container, Portlet, Row} from "@panely/components";
import {breadcrumbChange, pageChangeHeaderTitle, pageShowAlert,} from "store/actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import withLayout from "components/layout/withLayout";
import withAuth from "components/firebase/firebaseWithAuth";
import Head from "next/head";
import Router from "next/router";
import Spinner from "@panely/components/Spinner";
import QuizForm from "components/widgets/form/QuestionForm";
import {getQuiz, updateQuiz} from "consumer/runner";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as SolidIcon from "@fortawesome/free-solid-svg-icons";

class FormBasePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pathwayId: null,
            runnerId: null,
            questionId: null,
            saved: false,
        };

        this.onEdit = this.onEdit.bind(this);
    }

    componentDidMount() {
        if (!Router.query.runnerId || !Router.query.questionId) {
            Router.push("/form/create");
        }
        this.props.pageChangeHeaderTitle("Actualizar");
        this.props.breadcrumbChange([
            {text: "Home", link: "/"},
            {
                text: "Pathway",
                link: "/pathway/edit?pathwayId=" + Router.query.pathwayId,
            },
            {text: "Quiz"},
        ]);
        this.loadData(Router.query);
    }

    loadData({pathwayId, runnerId, questionId}) {
        return getQuiz(
            pathwayId,
            runnerId,
            questionId,
            (data) => {
                this.setState(data);
            },
            () => {
                this.props.pageShowAlert("Error al obtener el quiz", "error");
            }
        );
    }

    onEdit(data) {
        const {pathwayId, runnerId, questionId} = this.state;
        const {pageShowAlert} = this.props;
        return updateQuiz(runnerId, questionId, data)
            .then((docRef) => {
                this.setState({
                    pathwayId,
                    runnerId,
                    questionId,
                    ...data,
                });
                pageShowAlert("La pregunta fue actualizada correctamente");
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                pageShowAlert("Error al ediar el quiz", "error");
            });
    }

    render() {
        if (!this.state.saved) {
            return <Spinner>Loading</Spinner>;
        }
        return (
            <React.Fragment>
                <Head>
                    <title>Quiz | Question</title>
                </Head>
                <Container fluid>
                    <Row>
                        <Col md="6">
                            {/* BEGIN Portlet */}
                            <Portlet>
                                <Portlet.Header bordered>
                                    <Portlet.Title>Pregunta | Editar</Portlet.Title>
                                </Portlet.Header>
                                <Portlet.Body>
                                    <p>
                                        Agregue todas las preguntas relacionadas con este Ruta.
                                        Las preguntas deber??an ayudar a validar el conocimiento.
                                    </p>
                                    <hr/>
                                    <QuizForm onSave={this.onEdit} data={this.state}/>
                                </Portlet.Body>
                                <Portlet.Footer>

                                    <Button
                                        type="button"
                                        className="float-right mr-2"
                                        onClick={() => {
                                            Router.push({
                                                pathname: "/runner/badge",
                                                query: {
                                                    runnerId: this.state.runnerId,
                                                    pathwayId: this.state.pathwayId,
                                                },
                                            });
                                        }}
                                    >
                                        Agregar Emblema
                                        <FontAwesomeIcon className="ml-2" icon={SolidIcon.faPlus}/>
                                    </Button>
                                </Portlet.Footer>
                            </Portlet>
                        </Col>
                    </Row>
                </Container>
            </React.Fragment>
        );
    }
}

function mapDispathToProps(dispatch) {
    return bindActionCreators(
        {pageChangeHeaderTitle, breadcrumbChange, pageShowAlert},
        dispatch
    );
}

export default connect(
    null,
    mapDispathToProps
)(withAuth(withLayout(FormBasePage)));
