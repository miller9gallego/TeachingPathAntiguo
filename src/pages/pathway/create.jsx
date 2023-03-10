import {Col, Container, Portlet, Row} from "@panely/components";
import {breadcrumbChange, cleanPathway, pageChangeHeaderTitle, pageShowAlert} from "store/actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import withLayout from "components/layout/withLayout";
import withAuth from "components/firebase/firebaseWithAuth";
import Head from "next/head";
import Router from "next/router";
import PathwayForm from "../../components/widgets/form/PathwayForm";
import {create} from "consumer/pathway";


class PathwayPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: null,
            saved: false,
        };
        this.onCreate = this.onCreate.bind(this);
    }

    componentDidMount() {
        this.props.pageChangeHeaderTitle("Nuevo");
        this.props.breadcrumbChange([
            {text: "Home", link: "/"},
            {text: "Pathway"},
        ]);
        this.props.cleanPathway();
    }

    onCreate(data) {
        const {pageShowAlert} = this.props;
        return create(data)
            .then((docRef) => {
                this.setState({
                    id: docRef.id,
                    saved: true,
                    ...data,
                });
                pageShowAlert("Pathway guadardo correctamente");
                Router.push({
                    pathname: "/pathway/edit",
                    query: {pathwayId: this.state.id},
                });
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                pageShowAlert("Error al guardar los datos", "error");
            });
    }

    render() {
        return (
            <React.Fragment>
                <Head>
                    <title>Pathway | Create</title>
                </Head>
                <Container fluid>
                    <Row>
                        <Col md="6">
                            {/* BEGIN Portlet */}
                            <Portlet>
                                <Portlet.Header bordered>
                                    <Portlet.Title>Pathway | Nuevo</Portlet.Title>
                                </Portlet.Header>
                                <Portlet.Body>
                                    <div>
                                        Despu??s de crear el Pathway, debe crear las RUTAS para
                                        agreguar las lecciones de aprendizaje. <a target="_blank"
                                                                                  rel="noopener noreferrer"
                                                                                  href="https://docs.teachingpath.info/concepts/pathway">Ver
                                        m??s informaci??n</a> acerca de los pathways
                                    </div>
                                    <hr/>
                                    <PathwayForm
                                        onSave={this.onCreate}
                                        pathwayId={this.state.id}
                                    />
                                </Portlet.Body>

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
        {pageChangeHeaderTitle, breadcrumbChange, cleanPathway, pageShowAlert},
        dispatch
    );
}

export default connect(
    null,
    mapDispathToProps
)(withAuth(withLayout(PathwayPage)));
