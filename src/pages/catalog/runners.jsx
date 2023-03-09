import {Card, CardColumns, Col, Container, Portlet, Row,} from "@panely/components";
import {breadcrumbChange, pageChangeHeaderTitle} from "store/actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import withLayout from "components/layout/withLayout";
import Head from "next/head";
import Router from "next/router";
import Spinner from "@panely/components/Spinner";
import Link from "next/link";
import {getRunners} from "consumer/runner";

class CatalogPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {data: null};
    }

    componentDidMount() {
        const pathwayId = Router.query.pathwayId;

        this.props.pageChangeHeaderTitle("Pathways");
        this.props.breadcrumbChange([
            {text: "Catálogo", link: "/catalog"},
            {text: "Rutas"},
        ]);
        getRunners(pathwayId, (data) => {
            this.setState({data: data.list.filter(data => data.badge)});
        }, () => {
        })
    }

    render() {
        if (this.state.data === null) {
            return <Spinner className="m-5">Loading</Spinner>;
        }
        console.log(this.state);
        return (
            <React.Fragment>
                <Head>
                    <title>Rutas | Teaching Path</title>
                    <script src="/script.js"></script>
                </Head>
                <Container fluid className="portlet">
                    <Row>
                        <Col md="12">
                            <div>
                                <Portlet.Header bordered>
                                    <Portlet.Title>Emblemas disponibles </Portlet.Title>
                                </Portlet.Header>
                                <Portlet.Body>
                                    <p>
                                        Lista de emblemas que puedes obtener
                                    </p>
                                    <CardColumns>
                                        {this.state.data.length === 0 && (
                                            <p className="p-5">No hay coincidencias para mostrar.</p>
                                        )}
                                        {this.state.data.map((data, index) => {
                                            const badge = data.badge;
                                            const title = (index + 1) + ". " + badge.name.toUpperCase();
                                            return (
                                                <Card key={"runnerId-" + index}>
                                                    <Card.Body>
                                                        <Card.Title>
                                                           
                                                            <Link href={"/catalog/runner?id=" + data.id}>
                                                                {title}
                                                            </Link>
                                                        </Card.Title>
                                                        <Row>
                                                            <Col md="2">
                                                                    <img
                                                                        alt="badge"
                                                                        title={badge.name}
                                                                        style={{width: "60px"}}
                                                                        src={badge.image}
                                                                    />
                                                            </Col>
                                                            <Col md="10">
                                                                <Card.Text dangerouslySetInnerHTML={{__html:badge.description}}></Card.Text>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            );
                                        })}
                                    </CardColumns>
                                </Portlet.Body>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </React.Fragment>
        );
    }
}

function mapDispathToProps(dispatch) {
    return bindActionCreators(
        {pageChangeHeaderTitle, breadcrumbChange},
        dispatch
    );
}

export default connect(
    null,
    mapDispathToProps
)(withLayout(CatalogPage, "public"));
